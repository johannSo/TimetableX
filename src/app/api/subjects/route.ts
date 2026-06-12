import { fetchStundenplan } from '@/lib/stundenplan';
import { getAuthCredentials } from '@/lib/server/authSession';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  filterMode: z.enum(['class', 'room', 'teacher']),
  selectedValue: z.string().min(1, 'Auswahl fehlt.'),
});

const LOOKBACK_WEEKDAYS = 8;
const FETCH_CONCURRENCY = 3;

function getPastWeekdays(daysCount: number): string[] {
  const dates: string[] = [];
  const curr = new Date();
  while (dates.length < daysCount) {
    const dayOfWeek = curr.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      dates.push(`${y}${m}${d}`);
    }
    curr.setDate(curr.getDate() - 1);
  }
  return dates;
}

async function fetchInBatches<T>(
  items: string[],
  handler: (item: string) => Promise<T>
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];

  for (let i = 0; i < items.length; i += FETCH_CONCURRENCY) {
    const batch = items.slice(i, i + FETCH_CONCURRENCY);
    results.push(...(await Promise.allSettled(batch.map(handler))));
  }

  return results;
}

export async function POST(request: Request) {
  const credentials = getAuthCredentials(request);
  if (!credentials) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = await request.json();
  const result = RequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || 'Ungültige Anfrage.' },
      { status: 400 }
    );
  }

  const { school, user, pass } = credentials;
  const { filterMode, selectedValue } = result.data;
  const dates = getPastWeekdays(LOOKBACK_WEEKDAYS);
  const settled = await fetchInBatches(dates, dateStr =>
    fetchStundenplan(school, user, pass, dateStr)
  );

  const subjectSet = new Set<string>();
  let authError: Error | null = null;
  let successfulDays = 0;

  for (const item of settled) {
    if (item.status === 'rejected') {
      if (item.reason?.message?.includes('Ungültig')) authError = item.reason;
      continue;
    }

    successfulDays += 1;
    item.value.entries.forEach(entry => {
      const matches =
        (filterMode === 'class' && entry.class === selectedValue) ||
        (filterMode === 'room' && entry.room === selectedValue) ||
        (filterMode === 'teacher' && entry.teacher === selectedValue);

      if (matches && entry.subject && entry.subject !== '---') {
        subjectSet.add(entry.subject);
      }
    });
  }

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }

  if (successfulDays === 0) {
    return NextResponse.json(
      { error: 'Fächer konnten nicht geladen werden.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ subjects: Array.from(subjectSet).sort() });
}
