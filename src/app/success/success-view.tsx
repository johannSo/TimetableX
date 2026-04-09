'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';

interface SuccessViewProps {
  checkoutId?: string;
}

export default function SuccessView({ checkoutId }: SuccessViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div className="app-shell flex flex-col items-center justify-center min-h-dvh px-4 py-12">
      <div className="w-full max-w-md panel" style={{ padding: '2.5rem' }}>
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)'
            }}
          >
            <CheckCircle2 className="w-8 h-8" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Kauf erfolgreich
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Danke für dein Upgrade! Dein Pro-Status wird gleich aktiviert.
            </p>
            {checkoutId && (
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
                Checkout ID: {checkoutId}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              className="btn btn-primary w-full"
              onClick={() => router.push('/')}
            >
              Zum Stundenplan
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['proStatus'] })}
            >
              Pro-Status aktualisieren
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={() => authClient.customer.portal()}
            >
              Käufe verwalten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
