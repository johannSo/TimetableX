'use client';

import { useQuery } from '@tanstack/react-query';

export function useProStatus(enabled: boolean) {
  return useQuery<boolean, Error>({
    queryKey: ['proStatus'],
    queryFn: async () => {
      const res = await fetch('/api/pro-status');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden des Pro-Status.');
      return !!json.hasPro;
    },
    enabled,
    staleTime: 1000 * 30,
  });
}
