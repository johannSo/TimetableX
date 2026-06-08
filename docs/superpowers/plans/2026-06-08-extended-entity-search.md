# Extended Entity Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive search list for classes, rooms, and teachers by fetching the last 4 calendar weeks of timetable data in the background and merging them with current data.

**Architecture:** A new `useExtendedEntities` hook fetches 4 prior weeks via the existing `/api/stundenplan` endpoint, merges entity lists from all responses, caches the result in `localStorage` for 24 hours, and returns three sorted arrays. `ClientViewer` calls this hook and merges the extended lists with the current data before building `searchItems`.

**Tech Stack:** Next.js 15 App Router, React hooks, TypeScript, existing `/api/stundenplan` POST endpoint, `localStorage`

---

### Task 1: Create `useExtendedEntities` hook

**Files:**
- Create: `src/lib/hooks/useExtendedEntities.ts`

- [ ] **Step 1: Create the hook file with full implementation**

Create `src/lib/hooks/useExtendedEntities.ts` with this exact content:

```ts
'use client';

import { useState, useEffect } from 'react';
import { Credentials } from '@/lib/types';
import { addDays, formatDateStr, getWeekStart } from '@/lib/date';

const CACHE_KEY = 'extended_entities';
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface ExtendedEntitiesCache {
  classes: string[];
  rooms: string[];
  teachers: string[];
  cachedAt: number;
}

function getPriorWeekDateStrs(): string[] {
  const today = new Date();
  return [1, 2, 3, 4].map(n =>
    formatDateStr(getWeekStart(addDays(today, -7 * n)))
  );
}

function loadCache(): ExtendedEntitiesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: ExtendedEntitiesCache = JSON.parse(raw);
    if (Date.now() - parsed.cachedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(classes: string[], rooms: string[], teachers: string[]): void {
  try {
    const cache: ExtendedEntitiesCache = { classes, rooms, teachers, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable or full — silently skip
  }
}

export function useExtendedEntities(creds: Credentials | null) {
  const [extendedClasses, setExtendedClasses] = useState<string[]>([]);
  const [extendedRooms, setExtendedRooms] = useState<string[]>([]);
  const [extendedTeachers, setExtendedTeachers] = useState<string[]>([]);
  const [isLoadingExtended, setIsLoadingExtended] = useState(false);

  useEffect(() => {
    if (!creds) return;

    const cached = loadCache();
    if (cached) {
      setExtendedClasses(cached.classes);
      setExtendedRooms(cached.rooms);
      setExtendedTeachers(cached.teachers);
      return;
    }

    setIsLoadingExtended(true);

    const weekDateStrs = getPriorWeekDateStrs();
    const fetches = weekDateStrs.map(date =>
      fetch('/api/stundenplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, date, view: 'week' }),
      })
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null)
    );

    Promise.allSettled(fetches).then(results => {
      const classSet = new Set<string>();
      const roomSet = new Set<string>();
      const teacherSet = new Set<string>();

      results.forEach(result => {
        if (result.status !== 'fulfilled' || !result.value) return;
        const d = result.value;
        (d.availableClasses ?? []).forEach((c: string) => classSet.add(c));
        (d.availableRooms ?? []).forEach((r: string) => roomSet.add(r));
        (d.availableTeachers ?? []).forEach((t: string) => teacherSet.add(t));
      });

      const classes = Array.from(classSet).sort();
      const rooms = Array.from(roomSet).sort();
      const teachers = Array.from(teacherSet).sort();

      saveCache(classes, rooms, teachers);
      setExtendedClasses(classes);
      setExtendedRooms(rooms);
      setExtendedTeachers(teachers);
      setIsLoadingExtended(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creds?.school, creds?.user, creds?.pass]);

  return { extendedClasses, extendedRooms, extendedTeachers, isLoadingExtended };
}
```

- [ ] **Step 2: Type-check**

```bash
cd /home/joni/timetablex-webui && npx tsc --noEmit
```

Expected: no errors related to `useExtendedEntities.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/useExtendedEntities.ts
git commit -m "feat: add useExtendedEntities hook with 24h localStorage cache"
```

---

### Task 2: Integrate extended entities into `ClientViewer`

**Files:**
- Modify: `src/components/ClientViewer.tsx`

- [ ] **Step 1: Add the import**

In `src/components/ClientViewer.tsx`, add this import after the existing hook imports (around line 19):

```ts
import { useExtendedEntities } from '@/lib/hooks/useExtendedEntities';
```

- [ ] **Step 2: Call the hook**

In the `ClientViewer` component body, after the `useAvailableSubjects` call (around line 86), add:

```ts
const { extendedClasses, extendedRooms, extendedTeachers } = useExtendedEntities(creds);
```

- [ ] **Step 3: Merge extended entities into searchItems**

Replace the existing `searchItems` useMemo (lines 107–114):

```ts
// OLD:
const searchItems = useMemo(() => {
  if (!data) return [];
  const items: SearchItem[] = [];
  data.availableClasses.forEach(c => items.push({ id: c, name: c, type: 'class' }));
  data.availableRooms.forEach(r => items.push({ id: r, name: r, type: 'room' }));
  data.availableTeachers.forEach(t => items.push({ id: t, name: t, type: 'teacher' }));
  return items;
}, [data]);
```

With:

```ts
// NEW:
const searchItems = useMemo(() => {
  const currentClasses  = data?.availableClasses ?? [];
  const currentRooms    = data?.availableRooms ?? [];
  const currentTeachers = data?.availableTeachers ?? [];

  const allClasses  = [...new Set([...currentClasses,  ...extendedClasses])].sort();
  const allRooms    = [...new Set([...currentRooms,    ...extendedRooms])].sort();
  const allTeachers = [...new Set([...currentTeachers, ...extendedTeachers])].sort();

  const items: SearchItem[] = [];
  allClasses.forEach(c => items.push({ id: c, name: c, type: 'class' }));
  allRooms.forEach(r => items.push({ id: r, name: r, type: 'room' }));
  allTeachers.forEach(t => items.push({ id: t, name: t, type: 'teacher' }));
  return items;
}, [data, extendedClasses, extendedRooms, extendedTeachers]);
```

- [ ] **Step 4: Type-check**

```bash
cd /home/joni/timetablex-webui && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/ClientViewer.tsx
git commit -m "feat: merge extended entity lists into CommandPalette search items"
```

---

### Task 3: Verify in the running app

**Files:** none — verification only

- [ ] **Step 1: Start the dev server**

```bash
cd /home/joni/timetablex-webui && bun run dev
```

- [ ] **Step 2: Open the app and open the command palette (⌘K or the search button)**

Switch to "Lehrer" (teacher) filter mode. Verify that teachers from prior weeks appear in the list even when the current week has fewer entries. Open DevTools → Application → Local Storage and confirm `extended_entities` key is present with a `cachedAt` timestamp.

- [ ] **Step 3: Verify cache hit**

Refresh the page and open the command palette again. Confirm no additional `/api/stundenplan` requests fire for the prior weeks (check DevTools → Network tab).

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -p
git commit -m "fix: <describe any fix>"
```
