'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface AuthFlowProps {
  defaultMode?: 'signup' | 'signin';
  embedded?: boolean;
}

export default function AuthFlow({ defaultMode = 'signup', embedded = false }: AuthFlowProps) {
  const [mode, setMode] = useState<'signup' | 'signin' | 'verify'>(defaultMode);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const resetErrors = () => setError(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    setIsBusy(true);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: `${window.location.origin}/?verified=1`,
    });

    setIsBusy(false);

    if (error) {
      setError(error.message || 'Registrierung fehlgeschlagen.');
      return;
    }

    setPendingEmail(email);
    setPendingName(name);
    setMode('verify');
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
    if (!pendingEmail) return;
    resetErrors();
    setIsBusy(true);
    const { error } = await authClient.sendVerificationEmail({
      email: pendingEmail,
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
            {mode === 'verify' ? 'E-Mail bestätigen' : embedded ? 'In weniger als einer Minute startklar' : 'Bitte melde dich an'}
          </p>
        </div>

        {mode === 'verify' ? (
          <div className="space-y-5">
            <div className="text-sm" style={{ color: 'var(--color-text)' }}>
              <p className="font-semibold mb-2">Check deine Inbox</p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Wir haben einen Bestätigungslink an <strong>{pendingEmail}</strong> geschickt.
                Sobald du verifiziert hast, kannst du dich anmelden.
              </p>
            </div>
            <button
              className="btn btn-primary w-full text-base"
              style={{ padding: '0.9375rem 1.5rem' }}
              onClick={handleResend}
              disabled={isBusy}
            >
              Link erneut senden
            </button>
            <button
              className="btn btn-outline w-full text-sm"
              type="button"
              onClick={() => {
                setMode('signin');
                setEmail(pendingEmail);
                setName(pendingName);
              }}
            >
              Zur Anmeldung
            </button>
          </div>
        ) : (
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
          </form>
        )}
      </div>
    </div>
  );
}
