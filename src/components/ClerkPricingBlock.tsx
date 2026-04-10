'use client';

import { Check, Sparkles } from 'lucide-react';
import { PricingTable } from '@clerk/nextjs';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const clerkPricingAppearance = {
  variables: {
    colorPrimary: '#7AA2F7',
    colorText: '#1F2335',
    colorBackground: '#FFFFFF',
    colorInputText: '#1F2335',
    colorInputBackground: '#F8FAFF',
    borderRadius: '18px',
    fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
  },
};

const fallbackPlans = [
  {
    name: 'Starter',
    price: 'Kostenlos',
    description: 'Für den schnellen täglichen Blick auf den Vertretungsplan.',
    cta: 'Direkt loslegen',
    featured: false,
    items: [
      'Vertretungsplan für den aktuellen Tag',
      'Klassen-, Raum- und Lehrersuche',
      'Stundenplan-Zugangsdaten sicher gespeichert',
    ],
  },
  {
    name: 'Pro',
    price: '1,50€ / Monat',
    description: 'Für Supporter mit Favoriten, Blacklists und Pro-Status.',
    cta: 'Monatlich upgraden',
    featured: true,
    items: [
      'Favoriten und schneller Kontextwechsel',
      'Fächer gezielt ausblenden',
      'Priorisierter Ausbau weiterer Funktionen',
    ],
  },
  {
    name: 'Lifetime',
    price: '15€ einmalig',
    description: 'Einmal zahlen, dauerhaft freischalten.',
    cta: 'Lifetime holen',
    featured: false,
    items: [
      'Alle Pro-Funktionen inklusive',
      'Keine wiederkehrenden Kosten',
      'Ideal für regelmäßige Nutzung über mehrere Schuljahre',
    ],
  },
];

export default function ClerkPricingBlock() {
  if (clerkEnabled) {
    return (
      <div className="panel" style={{ padding: '1rem', background: 'var(--color-surface)' }}>
        <PricingTable
          appearance={clerkPricingAppearance}
          checkoutProps={{ appearance: clerkPricingAppearance }}
          ctaPosition="bottom"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {fallbackPlans.map((plan) => (
        <div
          key={plan.name}
          className="panel relative overflow-visible"
          style={{
            padding: '1.5rem',
            background: plan.featured
              ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary-light) 84%, #fff 16%), var(--color-surface))'
              : undefined,
          }}
        >
          {plan.featured && (
            <span
              className="badge absolute"
              style={{ top: '-0.75rem', left: '1.25rem', boxShadow: 'var(--shadow-sm)' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Beliebt
            </span>
          )}
          <div className="mb-6">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              {plan.name}
            </p>
            <h3 className="mt-2 text-3xl font-bold display" style={{ color: 'var(--color-text)' }}>
              {plan.price}
            </h3>
            <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {plan.description}
            </p>
          </div>
          <ul className="space-y-3">
            {plan.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span
                  className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-[18px] border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}>
            {plan.cta}
          </div>
        </div>
      ))}
    </div>
  );
}
