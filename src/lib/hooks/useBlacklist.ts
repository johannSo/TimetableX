'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/analytics';

type BlacklistMap = Record<string, string[]>;

const STORAGE_KEY = 'timetable_blacklist';

export function useBlacklist(currentEntity: string) {
  const [blacklistMap, setBlacklistMap] = useState<BlacklistMap>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBlacklistMap(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load blacklist from local storage', e);
    }
  }, []);

  const saveBlacklist = (newMap: BlacklistMap) => {
    setBlacklistMap(newMap);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
  };

  const currentBlacklist = blacklistMap[currentEntity] || [];

  const addToBlacklist = (subject: string) => {
    if (!currentEntity || currentBlacklist.includes(subject)) return;
    track('blacklist_subject_toggled', { action: 'added' });
    saveBlacklist({
      ...blacklistMap,
      [currentEntity]: [...currentBlacklist, subject],
    });
  };

  const removeFromBlacklist = (subject: string) => {
    if (!currentEntity) return;
    track('blacklist_subject_toggled', { action: 'removed' });
    saveBlacklist({
      ...blacklistMap,
      [currentEntity]: currentBlacklist.filter(s => s !== subject),
    });
  };

  return { currentBlacklist, addToBlacklist, removeFromBlacklist };
}
