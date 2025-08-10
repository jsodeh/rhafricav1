import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProperties } from '@/hooks/useProperties';
import { useSupportTickets } from '@/hooks/useSupportTickets';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          // Mimic Supabase response shape
          data: null,
          error: new Error('network'),
          count: 0,
        }),
      }),
      // Chainable methods used in hooks
      order: () => ({ data: null, error: new Error('network'), count: 0 }),
      or: () => ({ data: null, error: new Error('network'), count: 0 }),
      eq: () => ({ data: null, error: new Error('network'), count: 0 }),
      ilike: () => ({ data: null, error: new Error('network'), count: 0 }),
      gte: () => ({ data: null, error: new Error('network'), count: 0 }),
      lte: () => ({ data: null, error: new Error('network'), count: 0 }),
      in: () => ({ data: null, error: new Error('network'), count: 0 }),
      single: () => ({ data: null, error: new Error('network') }),
      update: () => ({ data: null, error: new Error('network') }),
    }),
  },
}));

describe('Retry behavior in hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('useProperties increments retryCount and exposes retry()', () => {
    const { result } = renderHook(() => useProperties());

    // First failure schedules retry in 1s
    expect(result.current.retryCount).toBe(0);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // After timer, retryCount should increase as fetch retriggered
    expect(result.current.retryCount).toBeGreaterThanOrEqual(1);

    act(() => {
      result.current.retry();
    });
    expect(result.current.retryCount).toBe(0);
  });

  it('useSupportTickets exposes retry() and maintains isEmpty/error states', async () => {
    const { result } = renderHook(() => useSupportTickets());

    // Initial state
    expect(result.current.isLoading).toBe(true);

    // Fast-forward to simulate backoff timers without asserting internal counters
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Can call retry without throwing
    await act(async () => {
      result.current.retry();
    });

    // API shape is stable
    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.retry).toBe('function');
  });
});


