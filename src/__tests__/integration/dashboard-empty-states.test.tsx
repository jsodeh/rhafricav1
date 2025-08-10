import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import OwnerDashboard from '@/pages/OwnerDashboard';
import ServiceProviderDashboard from '@/pages/ServiceProviderDashboard';

vi.mock('@/components/StickyNavigation', () => ({ default: () => <div /> }));

describe('Dashboard Empty States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Admin dashboard empty states are covered elsewhere and rely on async data; focusing here on owner and service provider

  it('shows empty states in OwnerDashboard when no properties/tenants/financials', async () => {
    const { user } = render(<OwnerDashboard />);

    const propertiesTab = screen.getByRole('tab', { name: /Properties/i });
    await user.click(propertiesTab);
    expect(await screen.findByText(/Ready to List Your First Property\?/i)).toBeInTheDocument();

    const tenantsTab = screen.getByRole('tab', { name: /Tenants/i });
    await user.click(tenantsTab);
    expect(await screen.findByText(/No Tenants Yet/i)).toBeInTheDocument();

    const financialsTab = screen.getByRole('tab', { name: /Financials/i });
    await user.click(financialsTab);
    expect(await screen.findByText(/No Income Data Yet/i)).toBeInTheDocument();
  });

  it('shows empty states in ServiceProviderDashboard when no services/reviews', async () => {
    const { user } = render(<ServiceProviderDashboard />);

    const servicesTab = screen.getByRole('tab', { name: /Services/i });
    await user.click(servicesTab);
    expect(await screen.findByText(/No Service Requests Yet/i)).toBeInTheDocument();

    const reviewsTab = screen.getByRole('tab', { name: /Reviews/i });
    await user.click(reviewsTab);
    expect(await screen.findByText(/No Reviews Yet/i)).toBeInTheDocument();
  });
});


