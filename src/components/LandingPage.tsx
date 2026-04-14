'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Layers3, Rocket, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';

const featureCards = [
  {
    icon: CalendarDays,
    title: 'Schneller als das Original',
    text: 'Der Plan ist sofort da. Kein Suchen durch alte Masken, keine unnötigen Klicks.',
  },
  {
    icon: Star,
    title: 'Favoriten für deinen Alltag',
    text: 'Lege Klassen, Räume oder Lehrkräfte als Favoriten ab und springe direkt dahin.',
  },
  {
    icon: ShieldCheck,
    title: 'Zugangsdaten verschlüsselt',
    text: 'Deine Stundenplan-Zugangsdaten werden sicher gespeichert und nicht im Klartext abgelegt.',
  },
  {
    icon: Layers3,
    title: 'Blacklists für Fächer',
    text: 'Blende Fächer aus, die dich nicht interessieren, und halte die Ansicht ruhig.',
  },
  {
    icon: Clock3,
    title: 'Für jeden Schultag optimiert',
    text: 'Wochenenden werden sinnvoll behandelt, Tagesnavigation bleibt immer direkt.',
  },
  {
    icon: Rocket,
    title: 'Gemacht für schnelle Checks',
    text: 'Mobil zuerst, aber nicht nur mobil. Auf Desktop wirkt die Oberfläche genauso sauber.',
  },
];

const previewRows = [
  { hour: '1', subject: 'M', change: 'Raum 204', room: '204', teacher: 'Fr. Klein' },
  { hour: '3', subject: 'D', change: 'Entfällt', room: '---', teacher: 'Hr. Weber' },
  { hour: '5', subject: 'Bio', change: 'Vertretung', room: '118', teacher: 'Fr. Seidel' },
];

export default function LandingPage() {
  return (
    <div className="relative z-10">
      <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[24px] border px-4 py-3 sm:px-5"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-border) 86%, #fff 14%)',
            background: 'color-mix(in srgb, var(--color-surface) 82%, transparent 18%)',
            backdropFilter: 'blur(18px)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <Image
              src="/pfp.png"
              alt="TimetableX Logo"
              width={42}
              height={42}
              className="rounded-[12px] flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="display truncate text-lg font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
                TimetableX
              </p>
              <p className="truncate text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Der bessere Vertretungsplan
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-2 lg:flex">
            <a href="#features" className="chip">Features</a>
            <a href="#pricing" className="chip">Preise</a>
            <Link href="/signup" className="chip">Starten</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-outline text-sm" style={{ padding: '0.8rem 1rem' }}>
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary text-sm" style={{ padding: '0.8rem 1.1rem' }}>
              Signup
            </Link>
          </div>
        </div>
      </header>

      <section id="top" className="px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="panel overflow-visible" style={{ padding: '2rem' }}>
            <span className="badge">
              <Sparkles className="h-3.5 w-3.5" />
              Schneller Alltag, weniger Reibung
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl" style={{ color: 'var(--color-text)' }}>
              Vertretungsplan
              <br />
              ohne Amtsgefühl.
            </h1>
            <p className="mt-6 max-w-2xl text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              TimetableX holt deinen Stundenplan in eine Oberfläche, die sich nach App anfühlt und nicht nach Verwaltungssoftware.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary text-base" style={{ padding: '1rem 1.35rem' }}>
                Kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#pricing" className="btn btn-outline text-base" style={{ padding: '1rem 1.35rem' }}>
                Preise ansehen
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                'Klassen, Räume und Lehrkräfte in Sekunden filtern',
                'Pro-Features für Favoriten und Blacklists',
                'Sicherer Login mit gespeicherten Zugangsdaten',
              ].map((item) => (
                <div key={item} className="surface-soft px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-semibold">Direkt nutzbar</span>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: '1.25rem' }}>
            <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <Image
                    src="/pfp.png"
                    alt="TimetableX Logo"
                    width={36}
                    height={36}
                    className="rounded-[10px]"
                  />
                  <div>
                    <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Heute</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Freitag, 10. April</p>
                  </div>
                </div>
                <span className="badge">
                  <Zap className="h-3.5 w-3.5" />
                  Pro
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-active">Q2A</span>
                <span className="chip">Raum 204</span>
                <span className="chip">Hr. Weber</span>
              </div>

              <div className="mt-5 overflow-hidden rounded-[20px] border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)' }}>
                {previewRows.map((row, index) => (
                  <div
                    key={row.hour}
                    className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-4"
                    style={{ borderTop: index === 0 ? 'none' : '1px solid var(--color-border-subtle)' }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] text-sm font-semibold" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      {row.hour}.
                    </div>
                    <div>
                      <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{row.subject}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {row.teacher} · {row.room}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: row.change === 'Entfällt' ? 'var(--color-danger-bg)' : 'var(--color-primary-light)',
                        color: row.change === 'Entfällt' ? 'var(--color-danger)' : 'var(--color-primary)',
                      }}
                    >
                      {row.change}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[18px] border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)', color: 'var(--color-text-secondary)' }}>
                Für mobile Checks gebaut, aber auf Desktop nicht verloren.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-2xl">
            <span className="badge">Features</span>
            <h2 className="mt-4 text-4xl font-bold display" style={{ color: 'var(--color-text)' }}>
              Alles, was im Alltag wirklich hilft.
            </h2>
            <p className="mt-3 text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Kein überladenes Portal. Nur die Teile, die man morgens zwischen Haustür und erster Stunde wirklich braucht.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="panel" style={{ padding: '1.5rem' }}>
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px]"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold display" style={{ color: 'var(--color-text)' }}>
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {feature.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="badge">Preise</span>
              <h2 className="mt-4 text-4xl font-bold display" style={{ color: 'var(--color-text)' }}>
                Fair für jeden Check, ehrlich für Supporter.
              </h2>
              <p className="mt-3 text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Kostenlos starten, monatlich upgraden oder einmalig Lifetime freischalten.
              </p>
            </div>
            <div className="surface-soft max-w-xl px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Monatsabo und Lifetime-Pass bleiben beide sichtbar, damit die Landing-Page auch ohne zusätzliche Konfiguration vollständig wirkt.
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
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
                price: '1,50EUR / Monat',
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
                price: '15EUR einmalig',
                description: 'Einmal zahlen, dauerhaft freischalten.',
                cta: 'Lifetime holen',
                featured: false,
                items: [
                  'Alle Pro-Funktionen inklusive',
                  'Keine wiederkehrenden Kosten',
                  'Ideal für regelmäßige Nutzung über mehrere Schuljahre',
                ],
              },
            ].map((plan) => (
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
                        <CheckCircle2 className="h-3.5 w-3.5" />
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
        </div>
      </section>
    </div>
  );
}
