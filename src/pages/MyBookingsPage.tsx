import React, { useMemo, useState } from 'react';
import { CustomerFooter } from '../components/CustomerFooter';
import { CustomerHeader } from '../components/CustomerHeader';
import { usePropVisit } from '../context/PropVisitContext';
import { BookingStatus } from '../types';
import { formatDisplayDate } from '../utils/formatters';

function getStatusBadge(status: BookingStatus): {
  classes: string;
  icon: string;
  label: string;
} {
  switch (status) {
    case 'Confirmed':
      return {
        classes: 'bg-success-container text-on-success-container',
        icon: 'check_circle',
        label: 'Confirmed',
      };
    case 'Pending':
      return {
        classes: 'bg-warning-container text-on-warning-container',
        icon: 'schedule',
        label: 'Pending',
      };
    case 'Completed':
      return {
        classes: 'bg-light-secondary-container text-light-on-secondary-container',
        icon: 'task_alt',
        label: 'Completed',
      };
    case 'Cancelled':
      return {
        classes: 'bg-light-error-container text-light-on-error-container',
        icon: 'cancel',
        label: 'Cancelled',
      };
    case 'Rejected':
      return {
        classes: 'bg-light-error-container text-light-on-error-container',
        icon: 'cancel',
        label: 'Rejected',
      };
  }
}

export const MyBookingsPage: React.FC = () => {
  const { bookings, properties, navigate, updateBookingStatus, selectedPropertyId } =
    usePropVisit();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) =>
      `${b.id} ${b.propertyTitle} ${b.customerName} ${b.status}`.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  return (
    <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col">
      <CustomerHeader variant="bookings" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
              My Bookings
            </h1>
            <p className="text-body-md text-light-outline mt-1">
              Track your upcoming property walkthroughs, contact the property owner directly, or release a slot in real time.
            </p>
          </div>

          {/* Lookup by Reference */}
          <div className="relative flex items-center w-full md:w-72">
            <span
              className="material-symbols-outlined absolute left-3 text-light-outline text-title-md pointer-events-none"
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lookup reference (PV-...)"
              className="w-full rounded border border-light-outline-variant bg-light-surface pl-10 pr-3.5 py-2 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <section className="bg-light-surface border border-light-outline-variant rounded-md p-10 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-light-outline" aria-hidden="true">
              event_busy
            </span>
            <h2 className="font-headline text-headline-md text-light-on-surface">
              {searchQuery ? 'No matching bookings found' : 'No property visits booked yet'}
            </h2>
            <p className="text-body-md text-light-outline max-w-md">
              {searchQuery
                ? 'Verify your booking reference number or clear your search to view all appointments.'
                : 'Explore our curated listings and schedule a private 45-minute site visit.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 px-5 py-2.5 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg hover:bg-light-surface-container"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('schedule-visit', { propertyId: selectedPropertyId })}
                className="mt-2 px-5 py-2.5 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary"
              >
                Schedule a Visit
              </button>
            )}
          </section>
        ) : (
          <section className="flex flex-col gap-4">
            {filteredBookings.map((booking) => {
              const badge = getStatusBadge(booking.status);
              const canCancel =
                booking.status === 'Confirmed' || booking.status === 'Pending';
              const prop = properties.find((p) => p.id === booking.propertyId);

              return (
                <article
                  key={booking.id}
                  className="bg-light-surface border border-light-outline-variant rounded-md p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-mono-md text-light-primary bg-light-surface-container px-2.5 py-0.5 rounded tabular-nums">
                        {booking.id}
                      </span>
                      <span
                        role="status"
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full ${badge.classes}`}
                      >
                        <span className="material-symbols-outlined text-label-sm" aria-hidden="true">
                          {badge.icon}
                        </span>
                        <span className="text-label-sm">{badge.label}</span>
                      </span>
                    </div>
                    <h2 className="font-headline text-headline-md text-light-on-surface">
                      {booking.propertyTitle}
                    </h2>
                    <p className="text-body-md text-light-on-surface-variant tabular-nums">
                      Visit: {formatDisplayDate(booking.visitDate)} · {booking.timeSlot} · Requested{' '}
                      {formatDisplayDate(booking.requestedDate)}
                    </p>
                    {prop && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-label-sm text-light-on-surface-variant">
                        <span className="font-semibold text-light-primary">
                          Owner: {prop.ownerName}
                        </span>
                        <a
                          href={`tel:${prop.ownerPhone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 text-accent hover:underline font-mono tabular-nums"
                        >
                          <span className="material-symbols-outlined text-label-sm" aria-hidden="true">
                            call
                          </span>
                          {prop.ownerPhone}
                        </a>
                        <a
                          href={`mailto:${prop.ownerEmail}`}
                          className="inline-flex items-center gap-1 text-light-secondary hover:underline"
                        >
                          <span className="material-symbols-outlined text-label-sm" aria-hidden="true">
                            mail
                          </span>
                          {prop.ownerEmail}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        navigate('property-details', { propertyId: booking.propertyId })
                      }
                      className="px-4 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg hover:bg-light-surface-container transition-colors duration-150 whitespace-nowrap"
                    >
                      View Property
                    </button>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                        className="px-4 py-2 rounded border border-light-error text-light-error text-label-lg hover:bg-light-error-container transition-colors duration-150 whitespace-nowrap"
                      >
                        Cancel Visit
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <CustomerFooter compact />
    </div>
  );
};
