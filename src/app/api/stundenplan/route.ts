import { fetchStundenplan } from '@/lib/stundenplan';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getTimetableCredentials } from '@/lib/timetable-credentials';

const RequestSchema = z.object({
  date: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = RequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: result.error.issues[0].message
      }, { status: 400 });
    }

    const creds = await getTimetableCredentials(session.user.id);
    if (!creds) {
      return NextResponse.json({ error: 'Keine Stundenplan-Zugangsdaten hinterlegt.' }, { status: 400 });
    }

    const { date } = result.data;
    const data = await fetchStundenplan(creds.school, creds.user, creds.pass, date);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({
      error: e.message || 'Interner Serverfehler beim Laden des Stundenplans.'
    }, { status: 500 });
  }
}
