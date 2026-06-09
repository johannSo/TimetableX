'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Credentials,
  TimetableEntry,
  TimetableResponse,
  FilterMode,
  ViewMode,
} from '@/lib/types';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useBlacklist } from './useBlacklist';
import { track } from '@/lib/analytics';

const FETCH_KEY = 'timetable';

export function getAvailableValues(data: TimetableResponse | undefined, filterMode: FilterMode): string[] {
  if (!data) return [];
  if (filterMode === 'class') return data.availableClasses;
  if (filterMode === 'room') return data.availableRooms;
  return data.availableTeachers;
}

export function computeIsSelectionAvailable(
  data: TimetableResponse | undefined,
  filterMode: FilterMode,
  selectedValue: string
): boolean {
  if (!selectedValue || !data) return true;
  return getAvailableValues(data, filterMode).includes(selectedValue);
}

export function filterEntries(
  entries: TimetableEntry[],
  filterMode: FilterMode,
  selectedValue: string,
  blacklist: string[]
): TimetableEntry[] {
  if (!selectedValue) return [];

  const filtered = entries.filter(e => {
    let isMatch = false;
    if (filterMode === 'class') isMatch = e.class === selectedValue;
    else if (filterMode === 'room') isMatch = e.room === selectedValue;
    else if (filterMode === 'teacher') isMatch = e.teacher === selectedValue;

    if (!isMatch) return false;
    if (blacklist.includes(e.subject)) return false;
    return true;
  });

  return [...filtered].sort((a, b) => (parseInt(a.hour) || 0) - (parseInt(b.hour) || 0));
}

export function useTimetable(creds: Credentials | null, date?: string, view: ViewMode = 'day') {
  const [filterMode, setFilterModeRaw] = useState<FilterMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('filterMode') as FilterMode) || 'class';
    }
    return 'class';
  });

  const setFilterMode = useCallback((mode: FilterMode) => {
    track('filter_mode_changed', { mode });
    setFilterModeRaw(mode);
  }, []);

  const [selectedValue, setSelectedValue] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('filterValue') || '';
    }
    return '';
  });

  const { currentBlacklist, addToBlacklist, removeFromBlacklist } = useBlacklist(selectedValue);

  const { data, error, isLoading, isFetching, refetch } = useQuery<TimetableResponse, Error>({
    queryKey: [FETCH_KEY, creds?.school, creds?.user, date, view],
    queryFn: async () => {
      if (!creds) throw new Error('No credentials');
      const res = await fetch('/api/stundenplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, date, view }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Daten.');
      return json;
    },
    enabled: !!creds,
  });

  useEffect(() => {
    if (error) track('timetable_fetch_error', { message: error.message });
  }, [error]);

  // Auto-select first available value only when nothing has been chosen yet
  useEffect(() => {
    if (data && !selectedValue) {
      const options = getAvailableValues(data, filterMode);
      if (options.length > 0) setSelectedValue(options[0]);
    }
  }, [data, filterMode, selectedValue]);

  // Persist filter settings
  useEffect(() => {
    if (filterMode) localStorage.setItem('filterMode', filterMode);
    if (selectedValue) localStorage.setItem('filterValue', selectedValue);
  }, [filterMode, selectedValue]);

  const isSelectionAvailable = useMemo(
    () => computeIsSelectionAvailable(data, filterMode, selectedValue),
    [data, filterMode, selectedValue]
  );

  const filteredEntries = useMemo(() => {
    if (!data || !('entries' in data)) return [];
    return filterEntries(data.entries, filterMode, selectedValue, currentBlacklist);
  }, [data, filterMode, selectedValue, currentBlacklist]);

  const filteredDays = useMemo(() => {
    if (!data || !('days' in data)) return [];

    return data.days.map(day => ({
      ...day,
      filteredEntries: filterEntries(day.entries, filterMode, selectedValue, currentBlacklist),
      isSelectionAvailable: computeIsSelectionAvailable(day, filterMode, selectedValue),
    }));
  }, [data, filterMode, selectedValue, currentBlacklist]);

  return {
    data,
    error,
    isLoading: isLoading || isFetching,
    filteredEntries,
    filterMode,
    setFilterMode,
    selectedValue,
    setSelectedValue,
    refetch,
    currentBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    filteredDays,
    isSelectionAvailable,
  };
}
