import React from 'react';
import { usePropVisit } from '../context/PropVisitContext';

interface CustomerFooterProps {
  compact?: boolean;
}

export const CustomerFooter: React.FC<CustomerFooterProps> = ({ compact = false }) => {
  const { navigate, selectedPropertyId, isAdminAuthenticated } = usePropVisit();

  if (compact) {
    return (
      <footer id="contact" className="bg-light-surface border-t border-light-outline-variant mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-headline text-title-lg text-light-primary">PropVisit</span>
          <div className="flex flex-wrap items-center gap-4 text-body-md text-light-outline">
            <span>Concierge Desk · visits@propvisit.in · +91 80 4120 8890</span>
            <button
              type="button"
              onClick={() => navigate(isAdminAuthenticated ? 'admin-dashboard' : 'admin-signin')}
              className="text-label-sm text-light-primary hover:underline"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="bg-light-surface border-t border-light-outline-variant mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="font-headline text-headline-md text-light-primary">PropVisit</span>
          <p className="text-body-md text-light-outline mt-2 max-w-xs">
            Verified property walkthroughs across India with real-time slot scheduling and direct property owner contact.
          </p>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <span className="text-label-lg text-light-on-surface">Explore</span>
          <button
            type="button"
            onClick={() => navigate('explore', { scrollToId: 'properties' })}
            className="text-body-md text-light-outline hover:text-light-primary"
          >
            Explore Properties
          </button>
          <button
            type="button"
            onClick={() => navigate('my-bookings')}
            className="text-body-md text-light-outline hover:text-light-primary"
          >
            My Bookings
          </button>
          <button
            type="button"
            onClick={() => navigate('schedule-visit', { propertyId: selectedPropertyId })}
            className="text-body-md text-light-outline hover:text-light-primary"
          >
            Schedule a Visit
          </button>
          <button
            type="button"
            onClick={() => navigate(isAdminAuthenticated ? 'admin-dashboard' : 'admin-signin')}
            className="text-body-md text-light-outline hover:text-light-primary"
          >
            Admin Portal
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-label-lg text-light-on-surface">Concierge Desk</span>
          <span className="text-body-md text-light-outline">visits@propvisit.in</span>
          <span className="text-body-md text-light-outline tabular-nums">+91 80 4120 8890</span>
        </div>
      </div>
    </footer>
  );
};
