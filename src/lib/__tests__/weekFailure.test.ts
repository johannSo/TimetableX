import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWeekStundenplan } from '../stundenplan';

describe('fetchWeekStundenplan', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('surfaces day-level fetch failures instead of returning empty fallback days', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Verbindung zum Stundenplan fehlgeschlagen.'))
    );

    await expect(fetchWeekStundenplan('school', 'user', 'pass', '20260608')).rejects.toThrow(
      'Verbindung zum Stundenplan fehlgeschlagen.'
    );
  });
});
