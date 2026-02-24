import { addDuration } from '../src/lib/time';

describe('Time utilities', () => {
  it('adds minutes correctly', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const result = addDuration(now, '15m');

    expect(result.toISOString()).toBe('2026-01-01T00:15:00.000Z');
  });

  it('falls back to 7 days when duration is invalid', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const result = addDuration(now, 'invalid');

    expect(result.toISOString()).toBe('2026-01-08T00:00:00.000Z');
  });
});
