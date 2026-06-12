'use client';

import { useQuery } from '@tanstack/react-query';
import { AuthIdentity, FilterMode } from '@/lib/types';

export function useAvailableSubjects(
  creds: AuthIdentity | null,
  filterMode: FilterMode,
  selectedValue: string
) {
  const { data, isLoading, isFetching } = useQuery<{ subjects: string[] }, Error>({
    queryKey: ['availableSubjects', creds?.school, creds?.user, filterMode, selectedValue],
    queryFn: async () => {
      if (!creds || !selectedValue) throw new Error('No session or selection');

      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterMode, selectedValue }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Fächer.');
      return json;
    },
    enabled: !!creds && !!selectedValue,
    staleTime: 1000 * 60 * 30,
  });

  return {
    availableSubjects: data?.subjects || [],
    isLoadingSubjects: isLoading || isFetching,
  };
}
