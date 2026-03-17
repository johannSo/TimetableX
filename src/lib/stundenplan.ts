import { parseStringPromise } from 'xml2js';

export interface TimetableEntry {
  class: string;
  hour: string;
  subject: string;
  teacher: string;
  room: string;
  info: string;
}

export interface TimetableData {
  title: string;
  date: string;
  entries: TimetableEntry[];
  availableClasses: string[];
  availableRooms: string[];
  availableTeachers: string[];
  currentDateStr: string;
  dayNotes?: string[];
  isWeekend?: boolean;
}

function getFallbackDate(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(4, 6)) - 1;
  const d = parseInt(dateStr.slice(6, 8));
  const date = new Date(y, m, d);
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function cleanValue(val: any): string {
  if (typeof val !== 'string') {
    val = val?._ || '';
  }
  if (!val || val === '&nbsp;' || val.trim() === '' || val === '---') {
    return '---';
  }
  return val.trim();
}

export async function fetchStundenplan(
  school: string,
  user: string,
  pass: string,
  dateStr?: string
): Promise<TimetableData> {
  // Use provided date or today
  let targetDateStr = dateStr;
  if (!targetDateStr) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    targetDateStr = `${year}${month}${day}`;
  }
  
  const url = `https://www.stundenplan24.de/${school}/wplan/wdatenk/WPlanKl_${targetDateStr}.xml`;

  const credentials = Buffer.from(`${user}:${pass}`).toString('base64');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Ungültiger Benutzername oder Passwort.');
    }
    
    const y = parseInt(targetDateStr.slice(0, 4));
    const m = parseInt(targetDateStr.slice(4, 6)) - 1;
    const d = parseInt(targetDateStr.slice(6, 8));
    const dayOfWeek = new Date(y, m, d).getDay(); // 0 = Sunday, 6 = Saturday
    
    // Return empty data with formatted date instead of error for weekends or missing plans
    return {
      title: 'Stundenplan',
      date: getFallbackDate(targetDateStr),
      entries: [],
      availableClasses: [],
      availableRooms: [],
      availableTeachers: [],
      currentDateStr: targetDateStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  }

  const xml = await response.text();
  const result = await parseStringPromise(xml);

  const kopf = result.WplanVp?.Kopf?.[0] || {};
  const datum = kopf.DatumPlan?.[0] || 'Unbekanntes Datum';
  const zeitstempel = kopf.zeitstempel?.[0] || '';

  // Extract global day notes (ZusatzInfo/ZiZeile and FreieTexte)
  const dayNotes: string[] = [];
  
  // 1. Check ZusatzInfo (ZiZeile array)
  const zusatzInfoLines = result.WplanVp?.ZusatzInfo?.[0]?.ZiZeile || [];
  for (const line of zusatzInfoLines) {
    const text = cleanValue(line);
    if (text !== '---' && text !== '') dayNotes.push(text);
  }

  // 2. Check FreieTexte as fallback
  const freieTexte = result.WplanVp?.FreieTexte?.[0]?.Ft || [];
  for (const ft of freieTexte) {
    const text = cleanValue(ft);
    if (text !== '---' && text !== '' && !dayNotes.includes(text)) {
      dayNotes.push(text);
    }
  }

  const entries: TimetableEntry[] = [];
  const classSet = new Set<string>();
  const roomSet = new Set<string>();
  const teacherSet = new Set<string>();

  const klassen = result.WplanVp?.Klassen?.[0]?.Kl || [];

  for (const kl of klassen) {
    const className = cleanValue(kl.Kurz?.[0]);
    if (className !== '---') classSet.add(className);
    
    const stunden = kl.Pl?.[0]?.Std || [];

    for (const std of stunden) {
      const entry: TimetableEntry = {
        class: className,
        hour: cleanValue(std.St?.[0]),
        subject: cleanValue(std.Fa?.[0]),
        teacher: cleanValue(std.Le?.[0]),
        room: cleanValue(std.Ra?.[0]),
        info: cleanValue(std.If?.[0]),
      };
      
      entries.push(entry);
      if (entry.room !== '---') roomSet.add(entry.room);
      if (entry.teacher !== '---') teacherSet.add(entry.teacher);
    }
  }

  return {
    title: `Stundenplan`,
    date: `${datum} (Aktualisiert: ${zeitstempel})`,
    entries,
    availableClasses: Array.from(classSet).sort(),
    availableRooms: Array.from(roomSet).sort(),
    availableTeachers: Array.from(teacherSet).sort(),
    currentDateStr: targetDateStr,
    dayNotes: dayNotes.length > 0 ? dayNotes : undefined,
  };
}
