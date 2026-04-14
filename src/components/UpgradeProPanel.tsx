'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function UpgradeProPanel() {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (slug: 'pro-monthly' | 'pro-lifetime') => {
    setError(null);
    setIsBusy(true);
    const { error } = await authClient.checkout({ slug });
    if (error) {
      setError(error.message || 'Checkout fehlgeschlagen.');
      setIsBusy(false);
      return;
    }
    // Redirect handled by Polar checkout
  };

  return (
    <div className="panel panel-muted" style={{ margin: '1rem 1rem 0', padding: '1rem 1.1rem' }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge">Pro optional</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.8} />
              In-App Checkout
            </span>
          </div>
          <h2 className="text-base font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
            Mehr Kontrolle mit TimetableX Pro
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Favoriten und Blacklist sind Pro-Features. Kostenlos weiternutzen ist jederzeit möglich.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="badge">Favoriten</span>
            <span className="badge">Blacklist</span>
            <span className="badge">Support</span>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn btn-primary text-sm"
              style={{ padding: '0.7rem 1.1rem' }}
              onClick={() => handleCheckout('pro-monthly')}
              disabled={isBusy}
            >
              Monatlich 1,50€
            </button>
            <button
              className="btn btn-outline text-sm"
              style={{ padding: '0.7rem 1.1rem' }}
              onClick={() => handleCheckout('pro-lifetime')}
              disabled={isBusy}
            >
              Lifetime 15€
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Preise inkl. MwSt.
          </p>
        </div>
      </div>
      {error && (
        <div className="text-sm mt-3" style={{ color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}
      <div className="sr-only" aria-live="polite">
        {isBusy ? 'Checkout wird geöffnet.' : ''}
      </div>
      <style jsx>{`
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
