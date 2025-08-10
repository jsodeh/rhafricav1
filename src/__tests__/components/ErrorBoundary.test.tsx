import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ErrorBoundary from '@/components/ErrorBoundary';

function Boom() {
  throw new Error('Kaboom');
}

describe('ErrorBoundary', () => {
  it('renders fallback UI and retry button when child throws', async () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    // Our default heading is "Oops! Something went wrong"
    expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});


