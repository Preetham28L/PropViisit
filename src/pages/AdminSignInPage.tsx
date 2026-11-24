import React, { useState } from 'react';
import { usePropVisit } from '../context/PropVisitContext';

export const AdminSignInPage: React.FC = () => {
  const { signInAdmin, navigate } = usePropVisit();
  const [email, setEmail] = useState('admin@propvisit.in');
  const [password, setPassword] = useState('propvisit2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.trim().length < 6) {
      setError(true);
      return;
    }
    setError(false);
    signInAdmin(email.trim());
  };

  return (
    <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      <main className="w-full max-w-md bg-light-surface border border-light-outline-variant rounded-md p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="w-12 h-12 rounded bg-light-primary text-light-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-headline-md" aria-hidden="true">
              admin_panel_settings
            </span>
          </span>
          <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
            Admin Portal
          </h1>
          <p className="text-body-md text-light-outline">
            Sign in to manage PropVisit listings, owner contacts, visit slots, and customer appointments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-label-lg text-light-on-surface">Work Email</span>
            <div className="relative flex items-center">
              <span
                className="material-symbols-outlined absolute left-3 text-light-outline text-title-md pointer-events-none"
                aria-hidden="true"
              >
                mail
              </span>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@propvisit.in"
                required
                className="w-full rounded border border-light-outline-variant bg-light-surface pl-10 pr-3.5 py-2.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-label-lg text-light-on-surface">Password</span>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded border border-light-outline-variant bg-light-surface pl-3.5 pr-10 py-2.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 text-light-outline hover:text-light-primary"
              >
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          {error && (
            <p
              className="text-body-md text-light-on-error-container bg-light-error-container px-4 py-2.5 rounded"
              role="alert"
            >
              Enter a valid administrator email and password (minimum 6 characters).
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              lock
            </span>
            <span>Sign In to Dashboard</span>
          </button>
        </form>

        <div className="pt-4 border-t border-light-outline-variant flex items-center justify-between text-label-sm text-light-outline">
          <span>JWT Role-Based Access</span>
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="text-light-primary hover:underline font-semibold"
          >
            Return to Customer Portal
          </button>
        </div>
      </main>
    </div>
  );
};
