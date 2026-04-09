import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getHasPro } from '@/lib/pro-status';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const hasPro = await getHasPro(session.user.id);
  return NextResponse.json({ hasPro });
}
