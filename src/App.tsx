/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthModal } from './components/AuthModal';
import { PropVisitProvider, usePropVisit } from './context/PropVisitContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminPropertiesPage } from './pages/AdminPropertiesPage';
import { AdminSignInPage } from './pages/AdminSignInPage';
import { AdminTimeSlotsPage } from './pages/AdminTimeSlotsPage';
import { ExplorePropertiesPage } from './pages/ExplorePropertiesPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { ScheduleVisitPage } from './pages/ScheduleVisitPage';

const AppRouter: React.FC = () => {
  const { route, isAdminAuthenticated, liveNotice, dismissLiveNotice } = usePropVisit();

  const renderPage = () => {
    switch (route) {
      case 'explore':
        return <ExplorePropertiesPage />;
      case 'property-details':
        return <PropertyDetailsPage />;
      case 'schedule-visit':
        return <ScheduleVisitPage />;
      case 'my-bookings':
        return <MyBookingsPage />;
      case 'admin-signin':
        return <AdminSignInPage />;
      case 'admin-dashboard':
        return isAdminAuthenticated ? <AdminDashboardPage /> : <AdminSignInPage />;
      case 'admin-properties':
        return isAdminAuthenticated ? <AdminPropertiesPage /> : <AdminSignInPage />;
      case 'admin-slots':
        return isAdminAuthenticated ? <AdminTimeSlotsPage /> : <AdminSignInPage />;
      default:
        return <ExplorePropertiesPage />;
    }
  };

  return (
    <>
      {renderPage()}
      <AuthModal />
      {liveNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-sm bg-light-primary text-light-on-primary px-4 py-3 rounded-md shadow-lg border border-light-secondary flex items-center justify-between gap-3"
        >
          <span className="text-body-md">{liveNotice}</span>
          <button
            type="button"
            onClick={dismissLiveNotice}
            aria-label="Dismiss notification"
            className="text-light-on-primary/80 hover:text-light-on-primary shrink-0"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <PropVisitProvider>
      <AppRouter />
    </PropVisitProvider>
  );
}
