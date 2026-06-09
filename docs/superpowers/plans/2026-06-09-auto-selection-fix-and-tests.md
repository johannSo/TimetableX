# Auto-Selection Fix + Comprehensive Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the silent filter-switch bug in `useTimetable`, surface a "not in today's data" message via the existing empty state UI, and fill all identified test gaps.

**Architecture:** Extract a pure `computeIsSelectionAvailable` function from the hook, add it to hook return + per-day in `filteredDays`, thread it down through `ClientViewer` → `TimetableTable` / `WeekTimetableView` as a prop that changes the empty-state subtitle.

**Tech Stack:** Next.js 15, React, TypeScript, Vitest, `@tanstack/react-query`

---

### Task 1: Write failing tests for `computeIsSelectionAvailable`

**Files:**
- Create: `src/lib/__tests__/isSelectionAvailable.test.ts`

- [ ] **Step 1: Create the test file**

```ts
import { describe, it, expect } from 'vitest';
import { computeIsSelectionAvailable } from '../hooks/useTimetable';
import { TimetableData } from '../types';

const makeDay = (classes: string[]): TimetableData => ({
  title: '',
  date: '20260609',
  currentDateStr: '20260609',
  entries: [],
  availableClasses: classes,
  availableRooms: [],
  availableTeachers: [],
});

describe('computeIsSelectionAvailable', () => {
  it('returns true when selectedValue is empty string', () => {
    expect(computeIsSelectionAvailable(makeDay(['5/1']), 'class', '')).toBe(true);
  });

  it('returns true when data is undefined', () => {
    expect(computeIsSelectionAvailable(undefined, 'class', '5/1')).toBe(true);
  });

  it('returns true when selectedValue is in availableClasses', () => {
    expect(computeIsSelectionAvailable(makeDay(['5/1', '9/2']), 'class', '5/1')).toBe(true);
  });

  it('returns false when selectedValue is NOT in availableClasses', () => {
    expect(computeIsSelectionAvailable(makeDay(['9/2']), 'class', '5/1')).toBe(false);
  });

  it('returns false when availableClasses is empty and selectedValue is set', () => {
    expect(computeIsSelectionAvailable(makeDay([]), 'class', '5/1')).toBe(false);
  });

  it('checks availableRooms when filterMode is room', () => {
    const day: TimetableData = { ...makeDay([]), availableRooms: ['313'], availableTeachers: [] };
    expect(computeIsSelectionAvailable(day, 'room', '313')).toBe(true);
    expect(computeIsSelectionAvailable(day, 'room', '999')).toBe(false);
  });

  it('checks availableTeachers when filterMode is teacher', () => {
    const day: TimetableData = { ...makeDay([]), availableRooms: [], availableTeachers: ['KNO'] };
    expect(computeIsSelectionAvailable(day, 'teacher', 'KNO')).toBe(true);
    expect(computeIsSelectionAvailable(day, 'teacher', 'ZZZ')).toBe(false);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
bun run test src/lib/__tests__/isSelectionAvailable.test.ts
```

Expected: `Cannot find module` or `computeIsSelectionAvailable is not exported`

---

### Task 2: Export `computeIsSelectionAvailable` + fix auto-selection + update hook

**Files:**
- Modify: `src/lib/hooks/useTimetable.ts`

- [ ] **Step 1: Export `getAvailableValues`, add `computeIsSelectionAvailable`, fix the auto-select effect, add `isSelectionAvailable` to return**

Replace the top of `useTimetable.ts` — here is the full updated file:

```ts
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Credentials,
  TimetableEntry,
  TimetableResponse,
  FilterMode,
  ViewMode,
} from '@/lib/types';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useBlacklist } from './useBlacklist';
import { track } from '@/lib/analytics';

const FETCH_KEY = 'timetable';

export function getAvailableValues(data: TimetableResponse | undefined, filterMode: FilterMode): string[] {
  if (!data) return [];
  if (filterMode === 'class') return data.availableClasses;
  if (filterMode === 'room') return data.availableRooms;
  return data.availableTeachers;
}

export function computeIsSelectionAvailable(
  data: TimetableResponse | undefined,
  filterMode: FilterMode,
  selectedValue: string
): boolean {
  if (!selectedValue || !data) return true;
  return getAvailableValues(data, filterMode).includes(selectedValue);
}

export function filterEntries(
  entries: TimetableEntry[],
  filterMode: FilterMode,
  selectedValue: string,
  blacklist: string[]
): TimetableEntry[] {
  if (!selectedValue) return [];

  const filtered = entries.filter(e => {
    let isMatch = false;
    if (filterMode === 'class') isMatch = e.class === selectedValue;
    else if (filterMode === 'room') isMatch = e.room === selectedValue;
    else if (filterMode === 'teacher') isMatch = e.teacher === selectedValue;

    if (!isMatch) return false;
    if (blacklist.includes(e.subject)) return false;
    return true;
  });

  return [...filtered].sort((a, b) => (parseInt(a.hour) || 0) - (parseInt(b.hour) || 0));
}

export function useTimetable(creds: Credentials | null, date?: string, view: ViewMode = 'day') {
  const [filterMode, setFilterModeRaw] = useState<FilterMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('filterMode') as FilterMode) || 'class';
    }
    return 'class';
  });

  const setFilterMode = useCallback((mode: FilterMode) => {
    track('filter_mode_changed', { mode });
    setFilterModeRaw(mode);
  }, []);

  const [selectedValue, setSelectedValue] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('filterValue') || '';
    }
    return '';
  });

  const { currentBlacklist, addToBlacklist, removeFromBlacklist } = useBlacklist(selectedValue);

  const { data, error, isLoading, isFetching, refetch } = useQuery<TimetableResponse, Error>({
    queryKey: [FETCH_KEY, creds?.school, creds?.user, date, view],
    queryFn: async () => {
      if (!creds) throw new Error('No credentials');
      const res = await fetch('/api/stundenplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, date, view }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Daten.');
      return json;
    },
    enabled: !!creds,
  });

  useEffect(() => {
    if (error) track('timetable_fetch_error', { message: error.message });
  }, [error]);

  // Auto-select first available value only when nothing has been chosen yet
  useEffect(() => {
    if (data && !selectedValue) {
      const options = getAvailableValues(data, filterMode);
      if (options.length > 0) setSelectedValue(options[0]);
    }
  }, [data, filterMode, selectedValue]);

  // Persist filter settings
  useEffect(() => {
    if (filterMode) localStorage.setItem('filterMode', filterMode);
    if (selectedValue) localStorage.setItem('filterValue', selectedValue);
  }, [filterMode, selectedValue]);

  const isSelectionAvailable = useMemo(
    () => computeIsSelectionAvailable(data, filterMode, selectedValue),
    [data, filterMode, selectedValue]
  );

  const filteredEntries = useMemo(() => {
    if (!data || !('entries' in data)) return [];
    return filterEntries(data.entries, filterMode, selectedValue, currentBlacklist);
  }, [data, filterMode, selectedValue, currentBlacklist]);

  const filteredDays = useMemo(() => {
    if (!data || !('days' in data)) return [];

    return data.days.map(day => ({
      ...day,
      filteredEntries: filterEntries(day.entries, filterMode, selectedValue, currentBlacklist),
      isSelectionAvailable: computeIsSelectionAvailable(day, filterMode, selectedValue),
    }));
  }, [data, filterMode, selectedValue, currentBlacklist]);

  return {
    data,
    error,
    isLoading: isLoading || isFetching,
    filteredEntries,
    filterMode,
    setFilterMode,
    selectedValue,
    setSelectedValue,
    refetch,
    currentBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    filteredDays,
    isSelectionAvailable,
  };
}
```

- [ ] **Step 2: Run the new tests**

```bash
bun run test src/lib/__tests__/isSelectionAvailable.test.ts
```

Expected: all 7 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/useTimetable.ts src/lib/__tests__/isSelectionAvailable.test.ts
git commit -m "fix: only auto-select filter when no value stored; expose isSelectionAvailable"
```

---

### Task 3: Update `TimetableTable` to show "not in plan" message

**Files:**
- Modify: `src/components/TimetableTable.tsx`

- [ ] **Step 1: Add props and update the empty state**

Replace the `TimetableTableProps` interface and the empty-state block (lines 6-63):

```tsx
interface TimetableTableProps {
  entries: TimetableEntry[];
  showClassColumn: boolean;
  compact?: boolean;
  isSelectionAvailable?: boolean;
  selectionLabel?: string;
}
```

Replace the empty-state return (the `if (entries.length === 0)` block):

```tsx
export default function TimetableTable({
  entries,
  showClassColumn,
  compact = false,
  isSelectionAvailable = true,
  selectionLabel,
}: TimetableTableProps) {
  if (entries.length === 0) {
    const subtitle = !isSelectionAvailable && selectionLabel
      ? `${selectionLabel} ist heute nicht im Vertretungsplan.`
      : 'Für diese Auswahl gibt es keine Vertretungen.';

    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
          }}
        >
          <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            Keine Einträge
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        </div>
      </div>
    );
  }
  // ... rest unchanged
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/TimetableTable.tsx
git commit -m "feat: show 'not in plan today' message in TimetableTable empty state"
```

---

### Task 4: Update `WeekTimetableView` to show "not in plan" per day

**Files:**
- Modify: `src/components/WeekTimetableView.tsx`

- [ ] **Step 1: Add `isSelectionAvailable` to `WeekTimetableDay` and update the empty-state subtitle**

Update the `WeekTimetableDay` interface (line 8):

```ts
export interface WeekTimetableDay {
  date: string;
  entries: TimetableEntry[];
  filteredEntries: TimetableEntry[];
  dayNotes?: string[];
  isWeekend?: boolean;
  isSelectionAvailable?: boolean;
}
```

Update the `WeekTimetableViewProps` to also accept `selectionLabel`:

```ts
interface WeekTimetableViewProps {
  days: WeekTimetableDay[];
  showClassColumn: boolean;
  selectionLabel?: string;
}
```

Update the function signature:

```tsx
export default function WeekTimetableView({ days, showClassColumn, selectionLabel }: WeekTimetableViewProps) {
```

Replace the per-day empty-state block (the `<div className="flex flex-col items-center justify-center py-12 ...">` block, currently lines 99-121):

```tsx
) : (
  <div className="flex flex-col items-center justify-center py-12 px-6 gap-3 text-center">
    <div
      className="flex items-center justify-center"
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
      }}
    >
      <CheckCircle2 className="w-6 h-6" strokeWidth={1.75} />
    </div>
    <div>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Kein Unterricht für diese Auswahl
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
        {!day.isSelectionAvailable && selectionLabel
          ? `${selectionLabel} ist für diesen Tag nicht im Plan.`
          : 'Dieser Tag ist leer oder alle passenden Einträge wurden ausgefiltert.'}
      </p>
    </div>
  </div>
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/WeekTimetableView.tsx
git commit -m "feat: show 'not in plan' per day in WeekTimetableView empty state"
```

---

### Task 5: Wire `isSelectionAvailable` + `selectionLabel` through `ClientViewer`

**Files:**
- Modify: `src/components/ClientViewer.tsx`

- [ ] **Step 1: Destructure `isSelectionAvailable` from `useTimetable`**

In the `useTimetable` destructure block (around line 69), add `isSelectionAvailable`:

```ts
const {
  data,
  error,
  isLoading,
  filteredEntries,
  filterMode,
  setFilterMode,
  selectedValue,
  setSelectedValue,
  currentBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  filteredDays,
  refetch,
  isSelectionAvailable,
} = useTimetable(creds, currentDateStr, currentViewMode);
```

- [ ] **Step 2: Pass props to `TimetableTable`**

Find the `<TimetableTable` usage in the day-view render (around line 341) and update it:

```tsx
<TimetableTable
  entries={filteredEntries}
  showClassColumn={filterMode !== 'class'}
  isSelectionAvailable={isSelectionAvailable}
  selectionLabel={selectedValue}
/>
```

- [ ] **Step 3: Pass `selectionLabel` to `WeekTimetableView`**

Find the `<WeekTimetableView` usage (around line 336) and update it:

```tsx
<WeekTimetableView
  days={filteredDays}
  showClassColumn={filterMode !== 'class'}
  selectionLabel={selectedValue}
/>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/ClientViewer.tsx
git commit -m "feat: wire isSelectionAvailable and selectionLabel through ClientViewer"
```

---

### Task 6: Fill `filterEntries` test gaps

**Files:**
- Modify: `src/lib/__tests__/filterEntries.test.ts`

- [ ] **Step 1: Append new describe blocks to the existing test file**

Add these blocks at the end of `src/lib/__tests__/filterEntries.test.ts`:

```ts
describe('filterEntries edge cases', () => {
  it('returns empty array when entries is empty', () => {
    expect(filterEntries([], 'class', '5/1', [])).toEqual([]);
  });

  it('returns empty array when all matching entries are blacklisted', () => {
    const result = filterEntries(entries, 'class', '5/1', ['MA', 'DE', 'BIO']);
    expect(result).toEqual([]);
  });

  it('non-numeric hours sort to key 0 via the || 0 fallback', () => {
    const mixed: TimetableEntry[] = [
      { class: 'X', hour: '3', subject: 'MA', teacher: 'A', room: '1', info: '' },
      { class: 'X', hour: 'AG', subject: 'EN', teacher: 'A', room: '1', info: '' },
      { class: 'X', hour: '1', subject: 'DE', teacher: 'A', room: '1', info: '' },
    ];
    const result = filterEntries(mixed, 'class', 'X', []);
    // 'AG' -> parseInt('AG') = NaN -> NaN || 0 = 0, sorts before '1'
    expect(result[0].subject).toBe('EN');
    expect(result[1].subject).toBe('DE');
    expect(result[2].subject).toBe('MA');
  });

  it('hour "0" is treated same as non-numeric (|| 0 known limitation)', () => {
    const withZero: TimetableEntry[] = [
      { class: 'X', hour: '0', subject: 'ZERO', teacher: 'A', room: '1', info: '' },
      { class: 'X', hour: 'AG', subject: 'AG', teacher: 'A', room: '1', info: '' },
      { class: 'X', hour: '1', subject: 'ONE', teacher: 'A', room: '1', info: '' },
    ];
    const result = filterEntries(withZero, 'class', 'X', []);
    // Both '0' and 'AG' map to sort key 0, 'ONE' sorts after
    const sortKeys = result.map(e => parseInt(e.hour) || 0);
    expect(sortKeys[sortKeys.length - 1]).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
bun run test src/lib/__tests__/filterEntries.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/filterEntries.test.ts
git commit -m "test: add edge case coverage for filterEntries"
```

---

### Task 7: Fill `date` test gaps

**Files:**
- Modify: `src/lib/__tests__/date.test.ts`

- [ ] **Step 1: Update the import at the top of `src/lib/__tests__/date.test.ts`**

Replace the existing import line with:

```ts
import {
  formatDateStr,
  parseDateStr,
  addDays,
  getWeekStart,
  getWeekDates,
  formatWeekLabel,
  getTodayStr,
  formatDayLabel,
} from '../date';
```

Then append these describe blocks at the end of the file:

```ts
describe('getTodayStr', () => {
  it('returns an 8-character YYYYMMDD string', () => {
    const result = getTodayStr();
    expect(result).toHaveLength(8);
    expect(/^\d{8}$/.test(result)).toBe(true);
  });
});

describe('formatDayLabel', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatDayLabel(new Date(2026, 5, 9));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getWeekStart additional cases', () => {
  it('returns previous Monday for Saturday', () => {
    const saturday = new Date(2026, 5, 13); // Saturday 2026-06-13
    expect(formatDateStr(getWeekStart(saturday))).toBe('20260608');
  });
});

describe('addDays year boundary', () => {
  it('crosses year boundary', () => {
    const dec31 = new Date(2024, 11, 31);
    const jan1 = addDays(dec31, 1);
    expect(jan1.getFullYear()).toBe(2025);
    expect(jan1.getMonth()).toBe(0);
    expect(jan1.getDate()).toBe(1);
  });
});

describe('parseDateStr invalid input', () => {
  it('returns Invalid Date for empty string', () => {
    expect(isNaN(parseDateStr('').getTime())).toBe(true);
  });

  it('returns Invalid Date for non-numeric string', () => {
    expect(isNaN(parseDateStr('abcdefgh').getTime())).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
bun run test src/lib/__tests__/date.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/date.test.ts
git commit -m "test: add coverage for getTodayStr, formatDayLabel, Saturday weekStart, year boundary, parseDateStr bad input"
```

---

### Task 8: Fill `trackingConsent` SSR guard test gaps

**Files:**
- Modify: `src/lib/__tests__/trackingConsent.test.ts`

- [ ] **Step 1: Add `vi` import and SSR describe block**

Add `vi` to the vitest import at line 2:

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
```

Append this block at the end of the file:

```ts
describe('SSR guard (document undefined)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('readTrackingConsent returns pending when document is undefined', () => {
    vi.stubGlobal('document', undefined);
    expect(readTrackingConsent()).toBe('pending');
  });

  it('writeTrackingConsent does not throw when document is undefined', () => {
    vi.stubGlobal('document', undefined);
    expect(() => writeTrackingConsent('accepted')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
bun run test src/lib/__tests__/trackingConsent.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/trackingConsent.test.ts
git commit -m "test: add SSR guard coverage for readTrackingConsent and writeTrackingConsent"
```

---

### Task 9: Full test run + verification

- [ ] **Step 1: Run all tests**

```bash
bun run test
```

Expected: all test suites PASS with 0 failures

- [ ] **Step 2: TypeScript check**

```bash
bunx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Final commit if any loose files**

```bash
git status
```

If clean, no action needed. All changes were committed per-task.
