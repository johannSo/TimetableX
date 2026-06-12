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
