import React from 'react';
import { usePropVisit } from '../context/PropVisitContext';

interface AdminShellProps {
  activeTab: 'dashboard' | 'properties' | 'slots';
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ activeTab, children }) => {
  const { navigate, signOutAdmin } = usePropVisit();

  return (
    <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col lg:flex-row">
      {/* Shared Admin Sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 bg-light-primary text-light-on-primary min-h-screen flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          <button
            type="button"
            onClick={() => navigate('admin-dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="w-9 h-9 rounded bg-accent text-on-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-title-lg" aria-hidden="true">
                real_estate_agent
              </span>
            </span>
            <span className="font-headline text-headline-md text-light-on-primary">PropVisit</span>
          </button>

          <nav aria-label="Admin Navigation" className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => navigate('admin-dashboard')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-label-lg transition-colors duration-150 text-left ${
                activeTab === 'dashboard'
                  ? 'bg-light-secondary text-light-on-secondary'
                  : 'text-light-on-primary/85 hover:bg-light-secondary/60'
              }`}
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                dashboard
              </span>
              <span className="whitespace-nowrap">Overview &amp; Bookings</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('admin-properties')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-label-lg transition-colors duration-150 text-left ${
                activeTab === 'properties'
                  ? 'bg-light-secondary text-light-on-secondary'
                  : 'text-light-on-primary/85 hover:bg-light-secondary/60'
              }`}
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                home_work
              </span>
              <span className="whitespace-nowrap">Properties</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('admin-slots')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-label-lg transition-colors duration-150 text-left ${
                activeTab === 'slots'
                  ? 'bg-light-secondary text-light-on-secondary'
                  : 'text-light-on-primary/85 hover:bg-light-secondary/60'
              }`}
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                schedule
              </span>
              <span className="whitespace-nowrap">Time Slots</span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-light-secondary">
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="flex items-center gap-2.5 text-body-md text-light-on-primary/85 hover:text-light-on-primary text-left"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              open_in_new
            </span>
            <span>Customer Portal</span>
          </button>
          <button
            type="button"
            onClick={signOutAdmin}
            className="flex items-center gap-2.5 text-body-md text-light-on-primary/85 hover:text-light-on-primary text-left"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              logout
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <header className="lg:hidden bg-light-primary text-light-on-primary px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('admin-dashboard')}
          className="font-headline text-title-lg whitespace-nowrap"
        >
          PropVisit Admin
        </button>
        <nav className="flex items-center gap-4 text-label-sm">
          <button
            type="button"
            onClick={() => navigate('admin-dashboard')}
            className={activeTab === 'dashboard' ? 'underline' : 'opacity-85'}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => navigate('admin-properties')}
            className={activeTab === 'properties' ? 'underline' : 'opacity-85'}
          >
            Properties
          </button>
          <button
            type="button"
            onClick={() => navigate('admin-slots')}
            className={activeTab === 'slots' ? 'underline' : 'opacity-85'}
          >
            Slots
          </button>
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="opacity-85"
          >
            Portal
          </button>
        </nav>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 p-4 md:p-8 flex flex-col gap-8">{children}</main>
    </div>
  );
};
