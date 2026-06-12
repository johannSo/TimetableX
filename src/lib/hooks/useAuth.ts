'use client';

import { useEffect, useState } from 'react';
import { AuthIdentity, Credentials } from '@/lib/types';
import { track } from '@/lib/analytics';
import { migrateLegacyCredentials } from '@/lib/authMigration';

export function useAuth() {
  const [creds, setCreds] = useState<AuthIdentity | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  const login = async (newCreds: Credentials) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCreds),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Anmeldung fehlgeschlagen.');
    }

    setCreds(json.identity);
    setIsLogged(true);
    track('user_logged_in', { school: newCreds.school });
  };

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => undefined);
    setCreds(null);
    setIsLogged(false);
    track('user_logged_out');
  };

  return { creds, isLogged, login, logout, isInitialized };
}
