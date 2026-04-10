'use client';

import ClientViewer from '@/components/ClientViewer';
import LandingPage from '@/components/LandingPage';
import { authClient } from '@/lib/auth-client';

interface HomePageClientProps {
  currentDateStr?: string;
}

export default function HomePageClient({ currentDateStr }: HomePageClientProps) {
  const session = authClient.useSession();

  if (session.isPending) {
    return null;
  }

  if (session.data) {
    return <ClientViewer currentDateStr={currentDateStr} />;
  }

  return <LandingPage />;
}
