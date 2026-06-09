'use client';

import { useState, useEffect } from 'react';
import { Credentials } from '@/lib/types';
import { track } from '@/lib/analytics';

const STORAGE_KEY = 'school_creds';

export function useAuth() {
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCreds(parsed);
        setIsLogged(true);
      } catch (e) {
        console.error('Failed to parse saved credentials', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (newCreds: Credentials) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCreds));
    setCreds(newCreds);
    setIsLogged(true);
    track('user_logged_in', { school: newCreds.school });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCreds(null);
    setIsLogged(false);
    track('user_logged_out');
  };

  return { creds, isLogged, login, logout, isInitialized };
}
