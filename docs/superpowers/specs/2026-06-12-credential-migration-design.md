# Silent Legacy Credential Migration

## Problem

Credential storage was converted from plaintext `localStorage['school_creds']`
(`{school, user, pass}`) to an encrypted, HttpOnly `timetablex_session` cookie
minted by `POST /api/auth`. `useAuth` no longer reads `localStorage` at all, so
on every device that still has the old entry, `GET /api/auth` returns 401,
`isLogged` is `false`, and the user is dropped to `LoginForm` — effectively a
forced re-login for the entire existing user base.

## Approach

Add a small, standalone module `src/lib/authMigration.ts` exporting:

```ts
export async function migrateLegacyCredentials(): Promise<AuthIdentity | null>
```

`useAuth`'s init effect calls this first. If it returns an identity, that
identity is used directly (the cookie has already been set by the call inside
`migrateLegacyCredentials`) and the normal `GET /api/auth` check is skipped. If
it returns `null`, the existing `GET /api/auth` flow runs unchanged.

Keeping this in its own module (rather than inlining it in `useAuth.ts`) keeps
`useAuth.ts` free of `localStorage` calls and the literal string
`'school_creds'`, which `projectAudit.test.ts` asserts. It also makes the
migration logic independently testable (mock `localStorage` + `fetch`) without
touching `useAuth`'s existing tests.

## Behavior

`LEGACY_KEY = 'school_creds'`

| Stored value | Action | Returns |
|---|---|---|
| Missing | nothing | `null` |
| Present, but `JSON.parse` throws | remove key | `null` |
| Present, valid JSON (any shape) | `POST /api/auth` with the parsed value as the body | — |
| → response `2xx` | remove key | `json.identity` |
| → response non-2xx | remove key | `null` |
| → `fetch` throws (offline/network error) | **keep key** for retry on next load | `null` |

Shape validation (`school`/`user`/`pass` all non-empty strings) is **not**
duplicated client-side — `POST /api/auth` already runs this through its
`LoginSchema` Zod check and returns a non-2xx for anything that doesn't fit,
which falls into the "remove key, return null" row above. This keeps
validation in one place.

The distinction in the last two rows matters: a definitive "this didn't work"
response should clear the stale entry so the user isn't stuck re-attempting a
doomed migration on every load, but a transient network error should not
destroy the only copy of the user's credentials before they've had a chance to
migrate.

## Integration into `useAuth.ts`

The init `useEffect` becomes:

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

    // existing GET /api/auth check, unchanged
  })();

  return () => { cancelled = true; };
}, []);
```

No other part of `useAuth.ts` changes. `login`/`logout` are untouched.

## Testing

New `src/lib/__tests__/authMigration.test.ts` (jsdom, mocked `fetch` via
`vi.stubGlobal`):

- no `school_creds` entry → resolves `null`, `fetch` not called
- malformed JSON → entry removed, resolves `null`, `fetch` not called
- valid entry, `fetch` resolves `2xx` with `{identity}` → entry removed,
  resolves the identity, `fetch` called with `POST /api/auth` and the parsed
  credentials as body
- valid entry, `fetch` resolves non-2xx → entry removed, resolves `null`
- valid entry, `fetch` rejects → entry **not** removed, resolves `null`

Existing `projectAudit.test.ts` continues to pass unchanged (it only inspects
`useAuth.ts`, `useTimetable.ts`, `useAvailableSubjects.ts`).

## Out of scope

- No UI change: migration is invisible on success, and falls back to the
  normal login screen on failure exactly as it does today.
- No removal timeline for this shim is defined here; it's a cheap no-op
  (`localStorage.getItem` returning `null`) once a device has migrated, so it
  can stay indefinitely or be removed later as a separate cleanup.
