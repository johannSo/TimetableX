import HomePageClient from '@/components/HomePageClient';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { date } = await searchParams;

  return (
    <main className="app-shell edge-shell">
      <HomePageClient currentDateStr={date} />
    </main>
  );
}
