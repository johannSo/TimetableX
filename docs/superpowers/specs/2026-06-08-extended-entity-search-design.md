# Extended Entity Search — Design Spec

**Date:** 2026-06-08  
**Status:** Approved

## Problem

The CommandPalette search for classes, rooms, and teachers is built entirely from the current day/week's timetable XML data. If a teacher (or class/room) has no substitution entries in the current period, they simply do not appear in search results. This is confusing for users who know the entity exists.

## Solution

Fetch the last 4 calendar weeks of timetable data in the background on app load, merge the entity lists, cache the result in localStorage for 24 hours, and merge this extended list into the search items.

## Architecture

### New hook: `useExtendedEntities`

**File:** `src/lib/hooks/useExtendedEntities.ts`

**Responsibilities:**
- Check `localStorage` key `extended_entities` for a cached object `{ classes: string[], rooms: string[], teachers: string[], cachedAt: number }`
- If `cachedAt` is within 24 hours, return cached data immediately — no network requests
- Otherwise, compute the Monday of each of the 4 prior calendar weeks from today, then fire 4 parallel `POST /api/stundenplan` calls with `{ ...creds, view: 'week', date: weekStartStr }`
- Merge all `availableClasses`, `availableRooms`, `availableTeachers` from all responses into deduplicated sorted arrays
- Persist result to localStorage with `cachedAt: Date.now()`
- Return `{ extendedClasses, extendedRooms, extendedTeachers, isLoadingExtended }`

**Error handling:** If any individual week fetch fails, skip it silently — partial results are still useful. If all fail, return empty arrays (current data still works as before).

**Cache key:** `extended_entities`  
**Cache TTL:** 24 hours (86400000 ms)

### Changes to `ClientViewer.tsx`

1. Call `useExtendedEntities(creds)` alongside existing hooks
2. In the `searchItems` useMemo, merge current data entities with extended lists:
   ```ts
   const allClasses  = [...new Set([...data.availableClasses,  ...extendedClasses])].sort();
   const allRooms    = [...new Set([...data.availableRooms,    ...extendedRooms])].sort();
   const allTeachers = [...new Set([...data.availableTeachers, ...extendedTeachers])].sort();
   ```
3. Build `searchItems` from these merged arrays

## Data Flow

```
App load (creds available)
  → useExtendedEntities
      → localStorage hit? return cached → merge into searchItems
      → stale/missing? fire 4 week fetches in parallel
          → merge entities → save to localStorage → return
  → searchItems = current data ∪ extended entities
```

## Out of Scope

- The auto-select logic in `useTimetable` that resets `selectedValue` when the current selection isn't in the current week's data — this is a related UX issue but separate from search.
- Invalidating the cache when credentials change — the cache key is global; if the user logs in with different credentials, they may briefly see stale data from the previous school. Acceptable given the 24h TTL.

## Files Changed

- `src/lib/hooks/useExtendedEntities.ts` — new file
- `src/components/ClientViewer.tsx` — consume hook, merge into searchItems
