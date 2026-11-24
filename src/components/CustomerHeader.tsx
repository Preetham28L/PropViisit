import React, { useState } from 'react';
import { usePropVisit } from '../context/PropVisitContext';

interface CustomerHeaderProps {
  variant?: 'default' | 'back-to-property' | 'bookings';
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({ variant = 'default' }) => {
  const {
    route,
    navigate,
    selectedPropertyId,
    customerProfile,
    setAuthModalOpen,
    signOutCustomer,
  } = usePropVisit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (
    targetRoute: 'explore' | 'my-bookings',
    scrollToId?: string
  ) => {
    setMobileMenuOpen(false);
    navigate(targetRoute, { scrollToId });
  };

  return (
    <header className="sticky top-0 z-30 bg-light-surface border-b border-light-outline-variant">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => handleNav('explore', 'home')}
          className="flex items-center gap-2.5 text-light-primary whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary rounded"
        >
          <span className="w-9 h-9 rounded bg-light-primary text-light-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-title-lg" aria-hidden="true">
              real_estate_agent
            </span>
          </span>
          <span className="font-headline text-headline-md text-light-primary">PropVisit</span>
        </button>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => handleNav('explore', 'home')}
            className={`text-label-lg whitespace-nowrap shrink-0 transition-colors duration-150 ${
              route === 'explore'
                ? 'text-light-on-surface-variant hover:text-light-primary'
                : 'text-light-on-surface-variant hover:text-light-primary'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNav('explore', 'properties')}
            className={`text-label-lg whitespace-nowrap shrink-0 py-1 transition-colors duration-150 ${
              route === 'explore' || route === 'property-details'
                ? 'text-light-primary border-b-2 border-light-primary'
                : 'text-light-on-surface-variant hover:text-light-primary'
            }`}
          >
            Explore Properties
          </button>
          <button
            type="button"
            onClick={() => handleNav('my-bookings')}
            className={`text-label-lg whitespace-nowrap shrink-0 py-1 transition-colors duration-150 ${
              route === 'my-bookings'
                ? 'text-light-primary border-b-2 border-light-primary'
                : 'text-light-on-surface-variant hover:text-light-primary'
            }`}
          >
            My Bookings
          </button>
          {variant === 'default' && (
            <>
              <button
                type="button"
                onClick={() => handleNav('explore', 'about')}
                className="text-label-lg whitespace-nowrap shrink-0 text-light-on-surface-variant hover:text-light-primary transition-colors duration-150"
              >
                About Us
              </button>
              <button
                type="button"
                onClick={() => handleNav('explore', 'contact')}
                className="text-label-lg whitespace-nowrap shrink-0 text-light-on-surface-variant hover:text-light-primary transition-colors duration-150"
              >
                Contact
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {variant === 'back-to-property' ? (
            <button
              type="button"
              onClick={() => navigate('property-details', { propertyId: selectedPropertyId })}
              className="inline-flex items-center gap-1.5 text-label-lg text-light-secondary hover:text-light-primary whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                arrow_back
              </span>
              <span>Back to Property</span>
            </button>
          ) : variant === 'bookings' ? (
            <button
              type="button"
              onClick={() => navigate('schedule-visit', { propertyId: selectedPropertyId })}
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <span>Book New Visit</span>
            </button>
          ) : customerProfile ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-label-lg text-light-primary whitespace-nowrap">
                {customerProfile.name}
              </span>
              <button
                type="button"
                onClick={signOutCustomer}
                className="inline-flex items-center justify-center px-3.5 py-2 rounded border border-light-outline-variant bg-light-surface text-light-on-surface-variant text-label-sm hover:bg-light-surface-container transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg hover:bg-light-surface-container transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <span>Login / Register</span>
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-light-outline-variant bg-light-surface text-light-on-surface"
          >
            <span className="material-symbols-outlined text-title-lg" aria-hidden="true">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-light-outline-variant bg-light-surface px-4 py-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleNav('explore', 'home')}
            className="text-left text-label-lg text-light-on-surface-variant py-1"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNav('explore', 'properties')}
            className="text-left text-label-lg text-light-primary py-1"
          >
            Explore Properties
          </button>
          <button
            type="button"
            onClick={() => handleNav('my-bookings')}
            className="text-left text-label-lg text-light-on-surface-variant py-1"
          >
            My Bookings
          </button>
          <button
            type="button"
            onClick={() => handleNav('explore', 'about')}
            className="text-left text-label-lg text-light-on-surface-variant py-1"
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleNav('explore', 'contact')}
            className="text-left text-label-lg text-light-on-surface-variant py-1"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setAuthModalOpen(true);
            }}
            className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg"
          >
            {customerProfile ? `Signed in as ${customerProfile.name}` : 'Login / Register'}
          </button>
        </div>
      )}
    </header>
  );
};
