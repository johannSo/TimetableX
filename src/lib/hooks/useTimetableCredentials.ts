'use client';

import { useQuery } from '@tanstack/react-query';
import { TimetableCredentialsStatus } from '@/lib/types';

export function useTimetableCredentials(enabled: boolean) {
  return useQuery<TimetableCredentialsStatus, Error>({
    queryKey: ['timetableCredentials'],
    queryFn: async () => {
      const res = await fetch('/api/credentials');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Zugangsdaten.');
      return json;
    },
    enabled,
  });
}
