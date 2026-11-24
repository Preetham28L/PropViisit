import React, { useState } from 'react';
import { usePropVisit } from '../context/PropVisitContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, signInCustomer, navigate, isAdminAuthenticated } =
    usePropVisit();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('Aarav Mehta');
  const [email, setEmail] = useState('aarav.mehta@bengaluru.in');
  const [phone, setPhone] = useState('+91 98451 10924');
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.includes('@')) {
      setError('Please enter your full name and a valid email address.');
      return;
    }
    signInCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98451 10924',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-light-primary/45 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-light-surface border border-light-outline-variant rounded-md p-6 md:p-8 max-w-md w-full shadow-lg flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-modal-title" className="font-headline text-headline-md text-light-on-background">
              {mode === 'signin' ? 'Visitor Sign In' : 'Create Visitor Profile'}
            </h2>
            <p className="text-body-md text-light-outline mt-1">
              Save your contact details for faster property walkthrough requests.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setAuthModalOpen(false)}
            className="text-light-outline hover:text-light-primary p-1 rounded"
          >
            <span className="material-symbols-outlined text-title-lg" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-light-surface-container rounded">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 rounded text-label-sm transition-colors duration-150 ${
              mode === 'signin'
                ? 'bg-light-surface text-light-primary shadow-sm'
                : 'text-light-on-surface-variant hover:text-light-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded text-label-sm transition-colors duration-150 ${
              mode === 'register'
                ? 'bg-light-surface text-light-primary shadow-sm'
                : 'text-light-on-surface-variant hover:text-light-primary'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-label-lg text-light-on-surface">Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Mehta"
              className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-label-lg text-light-on-surface">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.mehta@bengaluru.in"
              className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            />
          </label>

          {mode === 'register' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-label-lg text-light-on-surface">Phone Number</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98451 10924"
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
            </label>
          )}

          {error && (
            <p className="text-body-md text-light-on-error-container bg-light-error-container px-3.5 py-2 rounded" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150"
          >
            {mode === 'signin' ? 'Continue as Visitor' : 'Create Profile'}
          </button>
        </form>

        <div className="pt-4 border-t border-light-outline-variant flex items-center justify-between text-label-sm">
          <span className="text-light-outline">Staff or Property Owner?</span>
          <button
            type="button"
            onClick={() => {
              setAuthModalOpen(false);
              navigate(isAdminAuthenticated ? 'admin-dashboard' : 'admin-signin');
            }}
            className="text-light-primary hover:underline font-semibold"
          >
            Go to Admin Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
