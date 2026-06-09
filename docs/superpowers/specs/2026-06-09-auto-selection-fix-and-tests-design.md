# Auto-Selection Bug Fix + Comprehensive Tests

## Problem

`useTimetable` silently switches the user's selected class/room/teacher to `options[0]` whenever the current selection is not present in the fetched data. Users noticed their filter changed without interaction.

## Fix

Remove the second branch in the `useEffect` at `src/lib/hooks/useTimetable.ts:89-98`. Only auto-select when `selectedValue === ''` (first visit). Once a user has a stored value, never overwrite it automatically.

## UX: "Not available today" signal

Reuse the existing empty state UI in `TimetableTable` and `WeekTimetableView`. Differentiate two cases:

- **Selection unavailable** (`selectedValue` not in today's data): subtitle → *"[selectedValue] ist heute nicht im Vertretungsplan."*
- **Available but empty** (blacklisted / genuinely no substitutions): keep existing subtitle unchanged

## Data changes in `useTimetable`

**Day view:** add `isSelectionAvailable: boolean` to hook return.  
Computed as: `!selectedValue || getAvailableValues(data, filterMode).includes(selectedValue)`  
Defaults to `true` while loading.

**Week view:** extend each `filteredDays` entry with `isSelectionAvailable: boolean`.  
Computed per-day: `!selectedValue || day.entries.some(e => e[filterModeField] === selectedValue)`

## Component changes

- `TimetableTable`: accept `isSelectionAvailable?: boolean` and `selectionLabel?: string` props. When `!isSelectionAvailable`, swap subtitle text.
- `WeekTimetableView`: read `isSelectionAvailable` from each day object, same subtitle swap.
- `ClientViewer`: pass `isSelectionAvailable` + `selectedValue` down to `TimetableTable`.

## Tests

All new tests go in `src/lib/__tests__/`.

### `filterEntries.test.ts` additions
- Empty `entries` array → returns `[]`
- All matching entries blacklisted → returns `[]`
- Non-numeric hours (`'AG'`) sort to key `0` (documents `|| 0` behavior)
- `hour: '0'` treated same as non-numeric (known limitation of `|| 0`)

### `date.test.ts` additions
- `getTodayStr` returns an 8-char `YYYYMMDD` string
- `formatDayLabel` returns a non-empty string (smoke test; locale output not asserted)
- `getWeekStart` for Saturday → returns previous Monday
- `addDays` crossing year boundary (Dec 31 + 1 = Jan 1 next year)
- `parseDateStr` with bad input (`''`, `'abc'`) → produces `Invalid Date` (documents behavior)

### `trackingConsent.test.ts` additions
- `readTrackingConsent` returns `'pending'` when `document` is `undefined` (SSR guard), via `vi.stubGlobal`
- `writeTrackingConsent` returns without throwing when `document` is `undefined`

### New `useTimetable.test.ts`
- `isSelectionAvailable` is `true` when `selectedValue` matches an available option
- `isSelectionAvailable` is `false` when `selectedValue` is not in available options
- Auto-selection only fires when `selectedValue === ''`
- Existing selection is never overwritten when data changes
