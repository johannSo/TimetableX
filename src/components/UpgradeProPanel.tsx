'use client';

import { useState } from 'react';
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
    <div className="panel" style={{ margin: '1.25rem 0', padding: '1.25rem' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            TimetableX Pro
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Unterstütze das Projekt und schalte Pro frei.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="btn btn-primary text-sm"
            style={{ padding: '0.75rem 1.25rem' }}
            onClick={() => handleCheckout('pro-monthly')}
            disabled={isBusy}
          >
            1,50€/Monat
          </button>
          <button
            className="btn btn-outline text-sm"
            style={{ padding: '0.75rem 1.25rem' }}
            onClick={() => handleCheckout('pro-lifetime')}
            disabled={isBusy}
          >
            15€ einmalig
          </button>
        </div>
      </div>
      {error && (
        <div className="text-sm mt-3" style={{ color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
