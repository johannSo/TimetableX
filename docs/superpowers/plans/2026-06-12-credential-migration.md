# Silent Legacy Credential Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Devices that still have the legacy plaintext `localStorage['school_creds']` entry are silently upgraded to the new `timetablex_session` cookie on first load, instead of being dropped to the login screen.

**Architecture:** A new, standalone module `src/lib/authMigration.ts` exports `migrateLegacyCredentials()`, which reads the legacy `localStorage` entry, exchanges it for a session via the existing `POST /api/auth`, and cleans up `localStorage` based on the outcome. `useAuth`'s init effect calls this once, before its existing `GET /api/auth` check.

**Tech Stack:** TypeScript, Vitest (jsdom environment for the new test, `vi.stubGlobal` for `fetch`), Next.js App Router (`/api/auth` route, unchanged).

---

## File Structure

- **Create:** `src/lib/authMigration.ts` — exports `migrateLegacyCredentials(): Promise<AuthIdentity | null>`. Owns the legacy `localStorage` key name and all read/write/cleanup of it.
- **Create:** `src/lib/__tests__/authMigration.test.ts` — jsdom test, covers all 5 outcomes from the spec's behavior table.
- **Modify:** `src/lib/hooks/useAuth.ts` — init `useEffect` calls `migrateLegacyCredentials()` first; falls through to the existing `GET /api/auth` check only if it returns `null`.

No other files change. `login`/`logout` in `useAuth.ts` are untouched. `projectAudit.test.ts` is not modified — it must continue to pass because `useAuth.ts` still won't contain `localStorage.*` calls or the literal `'school_creds'`.

---

## Task 1: `authMigration` module with tests

**Files:**
- Create: `src/lib/__tests__/authMigration.test.ts`
- Create: `src/lib/authMigration.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/authMigration.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { migrateLegacyCredentials } from '../authMigration';

const LEGACY_KEY = 'school_creds';

describe('migrateLegacyCredentials', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null and does not call fetch when nothing is stored', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await migrateLegacyCredentials();

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('removes the entry and returns null when it is not valid JSON', async () => {
    localStorage.setItem(LEGACY_KEY, 'not json');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await migrateLegacyCredentials();

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it('exchanges valid credentials for a session, removes the entry, and returns the identity', async () => {
    const credentials = { school: 'demo', user: 'alice', pass: 'secret' };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(credentials));

    const identity = { school: 'demo', user: 'alice' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ identity }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await migrateLegacyCredentials();

    expect(result).toEqual(identity);
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  });

  it('removes the entry and returns null when the server rejects the credentials', async () => {
    const credentials = { school: 'demo', user: 'alice', pass: 'wrong' };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(credentials));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Anmeldung fehlgeschlagen.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await migrateLegacyCredentials();

    expect(result).toBeNull();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it('keeps the entry and returns null on a network error', async () => {
    const credentials = { school: 'demo', user: 'alice', pass: 'secret' };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(credentials));

    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await migrateLegacyCredentials();

    expect(result).toBeNull();
    expect(localStorage.getItem(LEGACY_KEY)).toBe(JSON.stringify(credentials));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/authMigration.test.ts`
Expected: FAIL — `src/lib/authMigration.ts` does not exist yet (`Failed to resolve import "../authMigration"`).

- [ ] **Step 3: Implement `migrateLegacyCredentials`**

Create `src/lib/authMigration.ts`:

```ts
import { AuthIdentity, Credentials } from '@/lib/types';

const LEGACY_STORAGE_KEY = 'school_creds';

export async function migrateLegacyCredentials(): Promise<AuthIdentity | null> {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;

  let credentials: Credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }

  let res: Response;
  try {
    res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  } catch {
    return null;
  }

  if (!res.ok) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY);
  const json = await res.json();
  return json.identity as AuthIdentity;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/authMigration.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/authMigration.ts src/lib/__tests__/authMigration.test.ts
git commit -m "Add silent legacy credential migration helper"
```

---

## Task 2: Wire migration into `useAuth`

**Files:**
- Modify: `src/lib/hooks/useAuth.ts`

- [ ] **Step 1: Call `migrateLegacyCredentials` before the existing session check**

In `src/lib/hooks/useAuth.ts`, add the import:

```ts
import { migrateLegacyCredentials } from '@/lib/authMigration';
```

Replace the init `useEffect` body (currently a `fetch('/api/auth', { cache: 'no-store' })` promise chain) with:

```ts
useEffect(() => {
    let cancelled = false;

    (async () => {
      const migrated = await migrateLegacyCredentials();
      if (cancelled) return;

      if (migrated) {
        setCreds(migrated);
        setIsLogged(true);
        setIsInitialized(true);
        return;
      }

      try {
        const res = await fetch('/api/auth', { cache: 'no-store' });
        const identity = res.ok ? ((await res.json()).identity as AuthIdentity | null) : null;
        if (cancelled) return;
        setCreds(identity);
        setIsLogged(!!identity);
      } catch {
        if (cancelled) return;
        setCreds(null);
        setIsLogged(false);
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
```

Everything else in `useAuth.ts` (`login`, `logout`, return value) stays the same.

- [ ] **Step 2: Run the full test suite and typecheck**

Run: `npx vitest run`
Expected: PASS (67) — the existing 62 plus the 5 new `authMigration` tests, including `projectAudit.test.ts` still passing.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/useAuth.ts
git commit -m "Run legacy credential migration on app init"
```
