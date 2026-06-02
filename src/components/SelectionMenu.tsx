'use client';

import Image from 'next/image';
import { LogOut, Search, Users, MapPin, User, Star } from 'lucide-react';
import { Favorite, FilterMode } from '@/lib/types';

interface SelectionMenuProps {
  filterMode: FilterMode;
  selectedValue: string;
  onOpenPalette: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onLogout: () => void;
  favorites: Favorite[];
  onSelectFavorite: (mode: FilterMode, value: string) => void;
  onContinue?: () => void;
}

const modeLabel: Record<FilterMode, string> = {
  class: 'Klasse',
  room: 'Raum',
  teacher: 'Lehrer',
};

const ModeIcon = ({ mode, size = 16 }: { mode: FilterMode; size?: number }) => {
  const props = { width: size, height: size, strokeWidth: 1.75 };
  if (mode === 'class') return <Users {...props} />;
  if (mode === 'room') return <MapPin {...props} />;
  return <User {...props} />;
};

export default function SelectionMenu({
  filterMode,
  selectedValue,
  onOpenPalette,
  isFavorite,
  onToggleFavorite,
  onLogout,
  favorites,
  onSelectFavorite,
  onContinue,
}: SelectionMenuProps) {
  return (
    <section className="panel-muted overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/pfp.png"
            alt="TimetableX Logo"
            width={44}
            height={44}
            className="rounded-[10px] flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight tracking-tight truncate display" style={{ color: 'var(--color-text)' }}>
              TimetableX
            </h1>
          </div>
        </div>

      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5 space-y-4">
        <div className="flex flex-row items-stretch gap-3 flex-nowrap">
          <button
            onClick={onOpenPalette}
            aria-label="Klasse, Raum oder Lehrer suchen"
            className="search-trigger flex-1 min-w-0 active:scale-[0.99]"
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              <ModeIcon mode={filterMode} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {modeLabel[filterMode]}
              </p>
              <p className="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {selectedValue || '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <kbd className="hidden sm:flex kbd">⌘K</kbd>
              <Search className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </button>

          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            aria-pressed={isFavorite}
            className="icon-btn"
            style={{ flexShrink: 0 }}
          >
            <Star
              className="w-5 h-5 block"
              fill={isFavorite ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>

          <button
            onClick={onLogout}
            aria-label="Abmelden"
            className="icon-btn icon-btn-danger"
            style={{ flexShrink: 0 }}
          >
            <LogOut className="w-5 h-5 block" strokeWidth={2} />
          </button>
        </div>

        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {favorites.map((f, i) => {
              const isSelected = filterMode === f.mode && selectedValue === f.value;
              return (
                <button
                  key={i}
                  onClick={() => onSelectFavorite(f.mode, f.value)}
                  className={`chip active:scale-[0.97] ${isSelected ? 'chip-active' : ''}`}
                >
                  <ModeIcon mode={f.mode} size={14} />
                  <span>{f.value}</span>
                </button>
              );
            })}
          </div>
        )}

        {onContinue && (
          <button
            onClick={onContinue}
            className="btn btn-primary w-full text-sm"
            style={{ height: 52 }}
          >
            Weiter zum Stundenplan
          </button>
        )}
      </div>
    </section>
  );
}
