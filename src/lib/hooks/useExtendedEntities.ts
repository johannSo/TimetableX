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
