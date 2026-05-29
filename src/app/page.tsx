import ClientViewer from '@/components/ClientViewer';
import { ViewMode } from '@/lib/types';

interface PageProps {
  searchParams: Promise<{ date?: string; view?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { date, view } = await searchParams;
  const currentViewMode: ViewMode = view === 'week' ? 'week' : 'day';

  return (
    <main className="app-shell edge-shell">
      <ClientViewer currentDateStr={date} currentViewMode={currentViewMode} />
    </main>
  );
}
