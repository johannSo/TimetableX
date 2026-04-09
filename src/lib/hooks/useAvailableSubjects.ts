'use client';

import { useQuery } from '@tanstack/react-query';
import { FilterMode } from '@/lib/types';

export function useAvailableSubjects(
  enabled: boolean,
  filterMode: FilterMode,
  selectedValue: string
) {
  const { data, isLoading, isFetching } = useQuery<{ subjects: string[] }, Error>({
    queryKey: ['availableSubjects', filterMode, selectedValue],
    queryFn: async () => {
      if (!selectedValue) throw new Error('No selection');
      
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterMode, selectedValue }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Fächer.');
      return json;
    },
    enabled: enabled && !!selectedValue,
    // Keep it fresh for a while so opening/closing the modal is quick
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    availableSubjects: data?.subjects || [],
    isLoadingSubjects: isLoading || isFetching,
  };
}
