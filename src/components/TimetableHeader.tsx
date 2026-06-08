'use client';

import {
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  ShieldBan,
} from 'lucide-react';
import { ViewMode } from '@/lib/types';

interface TimetableHeaderProps {
  isLoading: boolean;
  dateText?: string;
  selectionLabel: string;
  onNavigate: (offset: number) => void;
  onBackToSelection?: () => void;
  onOpenBlacklist: () => void;
  isToday: boolean;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onToday: () => void;
}

export default function TimetableHeader({
  isLoading,
  dateText,
  selectionLabel,
  onNavigate,
  onBackToSelection,
  onOpenBlacklist,
  isToday,
  viewMode,
  onChangeViewMode,
  onToday,
}: TimetableHeaderProps) {
  const cleanDate = dateText ? dateText.replace(/\s*\(Aktualisiert:.*\)\s*$/u, '') : '';
  const navigateLabel = viewMode === 'week' ? 'Woche' : 'Tag';

  return (
    <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToSelection && (
            <button
              onClick={onBackToSelection}
              aria-label="Zur Auswahl"
              className="icon-btn"
            >
              <Home className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
              {selectionLabel}
            </p>
            <h2 className="text-base font-bold leading-tight truncate display" style={{ color: 'var(--color-text)' }}>
              {isLoading ? 'Aktualisiere…' : cleanDate || 'Stundenplan'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-1 p-1 rounded-[var(--radius-md)] border"
               style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)' }}>
            <button
              onClick={() => onChangeViewMode('day')}
              className={`btn text-sm ${viewMode === 'day' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: 48, padding: '0 0.9rem' }}
            >
              Tag
            </button>
            <button
              onClick={() => onChangeViewMode('week')}
              className={`btn text-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: 48, padding: '0 0.9rem' }}
            >
              Woche
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(-1)}
              aria-label={`Vorherige ${navigateLabel}`}
              className="icon-btn"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>

          <button
            onClick={onToday}
            aria-label="Heute"
            className={`btn ${isToday ? 'btn-primary' : 'btn-ghost'} text-sm`}
            style={{ height: 48, padding: '0 0.9rem' }}
          >
            Heute
          </button>

            <button
              onClick={() => onNavigate(1)}
              aria-label={`Nächste ${navigateLabel}`}
              className="icon-btn"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <button
            onClick={onOpenBlacklist}
            aria-label="Fächer verbergen"
            className="icon-btn"
          >
            <ShieldBan className="w-5 h-5 block" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
