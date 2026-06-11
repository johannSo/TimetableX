'use client';

interface TimetableSkeletonProps {
  showClassColumn: boolean;
  rows?: number;
  compact?: boolean;
}

const ROW_WIDTHS = [78, 60, 92, 50, 84, 68, 96, 55];

function SkeletonRow({
  showClassColumn,
  compact,
  isLast,
  index,
}: {
  showClassColumn: boolean;
  compact?: boolean;
  isLast: boolean;
  index: number;
}) {
  const subjectWidth = ROW_WIDTHS[index % ROW_WIDTHS.length];
  const infoWidth = ROW_WIDTHS[(index + 3) % ROW_WIDTHS.length];
  const delay = `${(index % ROW_WIDTHS.length) * 0.07}s`;

  return (
    <tr
      className="table-row"
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--color-border-subtle)',
      }}
    >
      <td
        style={{
          padding: compact ? '0.75rem 0.5rem 0.75rem 0.75rem' : '1rem 0.75rem 1rem 1.25rem',
          width: compact ? 38 : 52,
        }}
      >
        <div className="skeleton" style={{ width: compact ? 18 : 26, height: compact ? 16 : 20, margin: '0 auto', animationDelay: delay }} />
      </td>

      <td style={{ padding: compact ? '0.75rem 0.6rem' : '1rem 1rem' }}>
        <div className="skeleton" style={{ width: `${subjectWidth}%`, maxWidth: compact ? 100 : 160, height: compact ? 14 : 18, animationDelay: delay }} />
      </td>

      {showClassColumn && (
        <td style={{ padding: compact ? '0.75rem 0.6rem' : '1rem 1rem' }}>
          <div className="skeleton" style={{ width: compact ? 32 : 46, height: compact ? 12 : 14, animationDelay: delay }} />
        </td>
      )}

      <td style={{ padding: compact ? '0.75rem 0.6rem' : '1rem 1rem' }}>
        <div className="skeleton" style={{ width: compact ? '70%' : '80%', maxWidth: compact ? 90 : 130, height: compact ? 12 : 14, animationDelay: delay }} />
      </td>

      <td style={{ padding: compact ? '0.75rem 0.6rem' : '1rem 1rem' }}>
        <div className="skeleton skeleton-pill" style={{ width: compact ? 36 : 46, height: compact ? 20 : 24, animationDelay: delay }} />
      </td>

      <td style={{ padding: compact ? '0.75rem 0.6rem 0.75rem 0.4rem' : '1rem 1.25rem 1rem 0.75rem' }}>
        <div className="skeleton" style={{ width: `${infoWidth}%`, maxWidth: compact ? 110 : 200, height: compact ? 12 : 14, animationDelay: delay }} />
      </td>
    </tr>
  );
}

export function TimetableSkeleton({ showClassColumn, rows = 7, compact = false }: TimetableSkeletonProps) {
  return (
    <div className={compact ? 'overflow-hidden table-wrap' : 'overflow-x-auto table-wrap'} aria-hidden="true">
      <table
        className="w-full"
        style={{ borderCollapse: 'collapse', tableLayout: compact ? 'fixed' : 'auto' }}
      >
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} showClassColumn={showClassColumn} compact={compact} isLast={i === rows - 1} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WeekTimetableSkeleton({ showClassColumn }: { showClassColumn: boolean }) {
  return (
    <div className="overflow-x-auto overflow-y-visible p-4 sm:p-5" aria-hidden="true">
      <div className="flex flex-nowrap gap-4 min-w-max pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <section
            key={i}
            className="week-day-card panel-muted overflow-hidden shrink-0"
            style={{ width: 'min(82vw, 24rem)', minWidth: '18rem' }}
          >
            <div
              className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5 border-b"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4, animationDelay: `${i * 0.07}s` }} />
                  <div className="skeleton" style={{ width: 110, height: 11, animationDelay: `${i * 0.07}s` }} />
                </div>
                <div className="skeleton" style={{ width: 90, height: 16, animationDelay: `${i * 0.07}s` }} />
              </div>
            </div>

            <div className="overflow-hidden">
              <TimetableSkeleton showClassColumn={showClassColumn} rows={4} compact />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
