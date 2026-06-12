"use client";

import Link from "next/link";

type CookieConsentBannerProps = {
  onAccept: () => void;
  onReject: () => void;
};

export default function CookieConsentBanner({
  onAccept,
  onReject,
}: CookieConsentBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 pt-4 sm:px-6 sm:pb-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="panel border border-[var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-lg sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Cookies
              </p>
              <h2 className="mt-2 text-2xl leading-tight text-[var(--color-text)]">
                Analyse-Cookies aktivieren?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
                Wir nutzen cookies, um die Website zu verbessern. Du kannst die
                Analyse ablehnen.
              </p>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                Mehr dazu in der{" "}
                <Link
                  href="/datenschutz"
                  className="font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={onReject}
                className="btn btn-outline w-full rounded-full px-5 py-3 text-sm sm:w-auto"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="btn btn-primary w-full rounded-full px-5 py-3 text-sm sm:w-auto"
              >
                Analyse akzeptieren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
