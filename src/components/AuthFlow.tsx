'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface AuthFlowProps {
  defaultMode?: 'signup' | 'signin';
  embedded?: boolean;
}

export default function AuthFlow({ defaultMode = 'signup', embedded = false }: AuthFlowProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>(defaultMode);
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const resetErrors = () => setError(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    setIsBusy(true);

    const callbackURL = `${window.location.origin}/?verified=1`;

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL,
    });

    if (error) {
      setIsBusy(false);
      setError(error.message || 'Registrierung fehlgeschlagen.');
      return;
    }

    const verificationResult = await authClient.sendVerificationEmail({
      email,
      callbackURL,
    });

    setIsBusy(false);

    setPendingEmail(email);
    setEmail(email);
    setPassword('');
    setMode('signin');
    setShowVerifyPopup(true);

    if (verificationResult.error) {
      setError(
        verificationResult.error.message ||
          'Account erstellt, aber die Bestätigungs-E-Mail konnte nicht automatisch gesendet werden. Bitte klicke auf "Link erneut senden".'
      );
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    setIsBusy(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setIsBusy(false);

    if (error) {
      setError(error.message || 'Login fehlgeschlagen.');
      return;
    }
  };

  const handleResend = async () => {
    const targetEmail = pendingEmail || email;
    if (!targetEmail) return;
    resetErrors();
    setIsBusy(true);
    const { error } = await authClient.sendVerificationEmail({
      email: targetEmail,
      callbackURL: `${window.location.origin}/?verified=1`,
    });
    setIsBusy(false);
    if (error) {
      setError(error.message || 'Senden fehlgeschlagen.');
    }
  };

  return (
    <div
      className={embedded ? 'w-full' : 'app-shell flex flex-col items-center justify-center min-h-dvh px-4 py-12'}
    >
      <div
        className={`w-full panel ${embedded ? 'max-w-none' : 'max-w-sm'}`}
        style={{ padding: embedded ? '2.125rem' : '2.5rem' }}
      >
        <div className="flex flex-col items-center mb-10">
          <div className="mb-5">
            <Image
              src="/pfp.png"
              alt="TimetableX Logo"
              width={64}
              height={64}
              className="rounded-[10px]"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 display" style={{ color: 'var(--color-text)' }}>
            TimetableX
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            {embedded ? 'In weniger als einer Minute startklar' : mode === 'signup' ? 'Account erstellen' : 'Bitte melde dich an'}
          </p>
        </div>

        <form onSubmit={mode === 'signup' ? handleSignup : handleSignin} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              <Mail className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                <UserIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Dein Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              <Lock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Passwort
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {mode === 'signin' && (
            <button
              type="button"
              className="text-sm underline underline-offset-2"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={handleResend}
              disabled={isBusy || (!email && !pendingEmail)}
            >
              E-Mail noch nicht bestätigt? Link erneut senden
            </button>
          )}

          {error && (
            <div className="text-sm" style={{ color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full text-base"
            style={{ padding: '0.9375rem 1.5rem', marginTop: '0.5rem' }}
            disabled={isBusy}
          >
            {mode === 'signup' ? 'Account erstellen' : 'Anmelden'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="btn btn-outline w-full text-sm"
            onClick={() => {
              resetErrors();
              setMode(mode === 'signup' ? 'signin' : 'signup');
            }}
          >
            {mode === 'signup' ? 'Schon einen Account? Anmelden' : 'Neu hier? Account erstellen'}
          </button>

          {!embedded && (
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              <Link href="/" className="underline underline-offset-2">Zur Startseite</Link>
            </p>
          )}
        </form>
      </div>

      {showVerifyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 palette-backdrop">
          <div className="palette-panel w-full max-w-sm p-5">
            <h2 className="text-lg font-semibold display" style={{ color: 'var(--color-text)' }}>
              Check your email
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Please click the link in your email to verify your account.
              {pendingEmail ? ` (${pendingEmail})` : ''}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                className="btn btn-outline text-sm flex-1"
                onClick={handleResend}
                disabled={isBusy}
              >
                Link erneut senden
              </button>
              <button
                className="btn btn-primary text-sm flex-1"
                onClick={() => setShowVerifyPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
