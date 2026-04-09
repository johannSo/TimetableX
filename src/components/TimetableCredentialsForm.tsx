'use client';

import { useState } from 'react';
import Image from 'next/image';
import { School, User, Lock, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

interface TimetableCredentialsFormProps {
  onSaved?: () => void;
}

export default function TimetableCredentialsForm({ onSaved }: TimetableCredentialsFormProps) {
  const [school, setSchool] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school, user, pass }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Speichern der Zugangsdaten.');
      return json;
    },
    onSuccess: () => {
      setError(null);
      onSaved?.();
    },
    onError: (err: any) => {
      setError(err?.message || 'Fehler beim Speichern der Zugangsdaten.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="app-shell flex flex-col items-center justify-center min-h-dvh px-4 py-12">
      <div className="w-full max-w-sm panel" style={{ padding: '2.5rem' }}>
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
            Stundenplan-Zugangsdaten
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="school"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              <School className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Schulnummer
            </label>
            <input
              id="school"
              type="text"
              required
              autoComplete="organization"
              placeholder="z.B. 12345678"
              value={school}
              onChange={e => setSchool(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Benutzername
            </label>
            <input
              id="user"
              type="text"
              required
              autoComplete="username"
              placeholder="Benutzername"
              value={user}
              onChange={e => setUser(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pass"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              <Lock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Passwort
            </label>
            <input
              id="pass"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
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
            disabled={mutation.isPending}
          >
            Speichern & Fortfahren
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
