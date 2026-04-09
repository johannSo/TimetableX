import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getTimetableCredentialStatus, upsertTimetableCredentials } from "@/lib/timetable-credentials";

const CredentialsSchema = z.object({
  school: z.string().min(1, "Schulnummer fehlt."),
  user: z.string().min(1, "Benutzername fehlt."),
  pass: z.string().min(1, "Passwort fehlt."),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const status = await getTimetableCredentialStatus(session.user.id);
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = CredentialsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await upsertTimetableCredentials(session.user.id, result.data);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("API Error (Credentials):", e);
    return NextResponse.json(
      { error: e.message || "Interner Serverfehler beim Speichern der Zugangsdaten." },
      { status: 500 }
    );
  }
}
