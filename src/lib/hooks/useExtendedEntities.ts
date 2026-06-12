'use client';

import { useState, useEffect } from 'react';
import { Credentials, TimetableWeekData } from '@/lib/types';
import { addDays, formatDateStr, getWeekStart } from '@/lib/date';

const CACHE_TTL = 24 * 60 * 60 * 1000;

interface ExtendedEntitiesCache {
  classes: string[];
  rooms: string[];
  teachers: string[];
  cachedAt: number;
}

function getLastFourWeekStartStrs(): string[] {
  const today = new Date();
  return [1, 2, 3, 4].map(n =>
    formatDateStr(getWeekStart(addDays(today, -7 * n)))
  );
}

function loadCache(school: string): ExtendedEntitiesCache | null {
  try {
    const raw = localStorage.getItem(`extended_entities_${school}`);
    if (!raw) return null;
    const parsed: ExtendedEntitiesCache = JSON.parse(raw);
    if (
      !parsed ||
      !Array.isArray(parsed.classes) ||
      !Array.isArray(parsed.rooms) ||
      !Array.isArray(parsed.teachers) ||
      typeof parsed.cachedAt !== 'number'
    ) return null;
    if (Date.now() - parsed.cachedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(school: string, classes: string[], rooms: string[], teachers: string[]): void {
  try {
    const cache: ExtendedEntitiesCache = { classes, rooms, teachers, cachedAt: Date.now() };
    localStorage.setItem(`extended_entities_${school}`, JSON.stringify(cache));
  } catch {
    // localStorage unavailable or full — silently skip
  }
}

export function useExtendedEntities(creds: Credentials | null) {
  const [extendedClasses, setExtendedClasses] = useState<string[]>([]);
  const [extendedRooms, setExtendedRooms] = useState<string[]>([]);
  const [extendedTeachers, setExtendedTeachers] = useState<string[]>([]);

  useEffect(() => {
    if (!creds) return;

    const controller = new AbortController();

    const cached = loadCache(creds.school);
    if (cached) {
      setExtendedClasses(cached.classes);
      setExtendedRooms(cached.rooms);
      setExtendedTeachers(cached.teachers);
      return () => controller.abort();
    }

    const weekDateStrs = getLastFourWeekStartStrs();
    const fetches = weekDateStrs.map(date =>
      fetch('/api/stundenplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, date, view: 'week' }),
        signal: controller.signal,
      })
        .then(res => (res.ok ? (res.json() as Promise<TimetableWeekData>) : null))
        .catch(() => null)
    );

    Promise.allSettled(fetches).then(results => {
      if (controller.signal.aborted) return;

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

      saveCache(creds.school, classes, rooms, teachers);
      setExtendedClasses(classes);
      setExtendedRooms(rooms);
      setExtendedTeachers(teachers);
    });

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creds?.school, creds?.user, creds?.pass]);

  return { extendedClasses, extendedRooms, extendedTeachers };
}
