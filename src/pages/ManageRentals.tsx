import React from 'react';
import StickyNavigation from '@/components/StickyNavigation';

const ManageRentals: React.FC = () => {
  return (
    <div>
      <StickyNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Manage Rentals</h1>
        <p className="mt-4">This page is under construction. Here you will be able to manage your rental properties.</p>
      </div>
    </div>
  );
};

export default ManageRentals; 