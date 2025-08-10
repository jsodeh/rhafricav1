import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import EmptyState from '@/components/EmptyState';

const MockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg data-testid="mock-icon" className={className} />
);

describe('EmptyState', () => {
  it('renders title and description with icon', () => {
    render(
      <EmptyState
        icon={MockIcon}
        title="No Data"
        description="There is nothing here yet."
      />
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing here yet.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders illustration instead of icon when provided', () => {
    render(
      <EmptyState
        icon={MockIcon}
        title="Empty"
        description="Nothing to show"
        illustration="/placeholder.svg"
      />
    );

    expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/placeholder.svg');
    expect(img).toHaveAttribute('alt', 'Empty');
  });

  it('calls action onClick when action button is clicked', async () => {
    const onClick = vi.fn();
    const { user } = render(
      <EmptyState
        icon={MockIcon}
        title="Get Started"
        description="Click the button"
        action={{ label: 'Do it', onClick }}
      />
    );

    const button = screen.getByRole('button', { name: /do it/i });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});


