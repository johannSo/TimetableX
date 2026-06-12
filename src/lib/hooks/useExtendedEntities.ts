'use client';

import { useEffect, useState } from 'react';
import { AuthIdentity, TimetableWeekData } from '@/lib/types';
import { addDays, formatDateStr, getWeekStart } from '@/lib/date';

const CACHE_TTL = 24 * 60 * 60 * 1000;
const WEEKS_TO_LOOK_BACK = 2;

interface ExtendedEntitiesCache {
  classes: string[];
  rooms: string[];
  teachers: string[];
  cachedAt: number;
}

function getRecentWeekStartStrs(): string[] {
  const today = new Date();
  return Array.from({ length: WEEKS_TO_LOOK_BACK }, (_, index) =>
    formatDateStr(getWeekStart(addDays(today, -7 * (index + 1))))
  );
}

function getCacheKey(creds: AuthIdentity): string {
  return `extended_entities_${creds.school}`;
}

function loadCache(creds: AuthIdentity): ExtendedEntitiesCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey(creds));
    if (!raw) return null;
    const parsed: ExtendedEntitiesCache = JSON.parse(raw);
    if (
      !parsed ||
      !Array.isArray(parsed.classes) ||
      !Array.isArray(parsed.rooms) ||
      !Array.isArray(parsed.teachers) ||
      typeof parsed.cachedAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() - parsed.cachedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(
  creds: AuthIdentity,
  classes: string[],
  rooms: string[],
  teachers: string[]
): void {
  const cache: ExtendedEntitiesCache = {
    classes,
    rooms,
    teachers,
    cachedAt: Date.now(),
  };
  localStorage.setItem(getCacheKey(creds), JSON.stringify(cache));
}

export function useExtendedEntities(creds: AuthIdentity | null) {
  const [extendedClasses, setExtendedClasses] = useState<string[]>([]);
  const [extendedRooms, setExtendedRooms] = useState<string[]>([]);
  const [extendedTeachers, setExtendedTeachers] = useState<string[]>([]);

  useEffect(() => {
    if (!creds) {
      setExtendedClasses([]);
      setExtendedRooms([]);
      setExtendedTeachers([]);
      return;
    }

    const cached = loadCache(creds);
    if (cached) {
      setExtendedClasses(cached.classes);
      setExtendedRooms(cached.rooms);
      setExtendedTeachers(cached.teachers);
      return;
    }

    let cancelled = false;
    const activeCreds = creds;

    async function load() {
      const classes = new Set<string>();
      const rooms = new Set<string>();
      const teachers = new Set<string>();

      for (const date of getRecentWeekStartStrs()) {
        if (cancelled) return;

        const res = await fetch('/api/stundenplan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, view: 'week' }),
        });

        if (!res.ok) continue;

        const week = (await res.json()) as TimetableWeekData;
        week.availableClasses.forEach(value => classes.add(value));
        week.availableRooms.forEach(value => rooms.add(value));
        week.availableTeachers.forEach(value => teachers.add(value));
      }

      if (cancelled) return;

      const classList = Array.from(classes).sort();
      const roomList = Array.from(rooms).sort();
      const teacherList = Array.from(teachers).sort();

      setExtendedClasses(classList);
      setExtendedRooms(roomList);
      setExtendedTeachers(teacherList);
      saveCache(activeCreds, classList, roomList, teacherList);
    }

    load().catch(() => {
      if (!cancelled) {
        setExtendedClasses([]);
        setExtendedRooms([]);
        setExtendedTeachers([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [creds?.school, creds?.user]);

  return { extendedClasses, extendedRooms, extendedTeachers };
}
