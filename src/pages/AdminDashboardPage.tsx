import React, { useMemo, useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { usePropVisit } from '../context/PropVisitContext';
import { Booking, BookingStatus } from '../types';
import { formatDisplayDate } from '../utils/formatters';

function getRowBadgeStyle(status: BookingStatus): string {
  switch (status) {
    case 'Pending':
      return 'bg-warning-container text-on-warning-container';
    case 'Confirmed':
      return 'bg-success-container text-on-success-container';
    case 'Completed':
      return 'bg-light-secondary-container text-light-on-secondary-container';
    case 'Cancelled':
    case 'Rejected':
      return 'bg-light-error-container text-light-on-error-container';
  }
}

export const AdminDashboardPage: React.FC = () => {
  const {
    properties,
    bookings,
    inquiries,
    updateBookingStatus,
    respondToInquiry,
    adminEmail,
  } = usePropVisit();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingAction, setPendingAction] = useState<{
    booking: Booking;
    nextStatus: BookingStatus;
  } | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const metrics = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'Pending').length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const cancelled = bookings.filter(
      (b) => b.status === 'Cancelled' || b.status === 'Rejected'
    ).length;
    return {
      totalProperties: properties.length,
      totalBookings: bookings.length,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }, [properties, bookings]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchQ =
        !q ||
        `${b.id} ${b.customerName} ${b.customerEmail} ${b.propertyTitle}`
          .toLowerCase()
          .includes(q);
      const matchS =
        statusFilter === 'all' ||
        b.status === statusFilter ||
        (statusFilter === 'Cancelled' && b.status === 'Rejected');
      return matchQ && matchS;
    });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <AdminShell activeTab="dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
            Admin Overview
          </h1>
          <p className="text-body-md text-light-outline mt-1">
            Real-time property visit metrics, appointment approvals, and direct owner inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-light-surface border border-light-outline-variant rounded-full px-3.5 py-1.5 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
          <span className="text-label-sm text-light-on-surface whitespace-nowrap">
            {adminEmail || 'admin@propvisit.in'}
          </span>
        </div>
      </div>

      {/* 6 Dynamic Summary Cards */}
      <section aria-label="Dashboard Summary" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <article className="bg-light-surface border border-light-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1">
          <span className="text-label-sm text-light-outline">Total Properties</span>
          <p className="font-headline text-headline-md text-light-primary tabular-nums">
            {metrics.totalProperties}
          </p>
        </article>
        <article className="bg-light-surface border border-light-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1">
          <span className="text-label-sm text-light-outline">Total Bookings</span>
          <p className="font-headline text-headline-md text-light-primary tabular-nums">
            {metrics.totalBookings}
          </p>
        </article>
        <article className="bg-light-surface border border-light-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1">
          <span className="text-label-sm text-light-outline">Pending</span>
          <p className="font-headline text-headline-md text-warning tabular-nums">
            {metrics.pending}
          </p>
        </article>
        <article className="bg-light-surface border border-light-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1">
          <span className="text-label-sm text-light-outline">Confirmed</span>
          <p className="font-headline text-headline-md text-success tabular-nums">
            {metrics.confirmed}
          </p>
        </article>
        <article className="bg-light-surface border border-light-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1">
          <span className="text-label-sm text-light-outline">Completed</span>
          <p className="font-headline text-headline-md text-light-secondary tabular-nums">
            {metrics.completed}
          </p>
        </article>
        <article className="bg-light-surface border border-light-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1">
          <span className="text-label-sm text-light-outline">Cancelled</span>
          <p className="font-headline text-headline-md text-light-error tabular-nums">
            {metrics.cancelled}
          </p>
        </article>
      </section>

      {/* Booking Management Table */}
      <section className="bg-light-surface border border-light-outline-variant rounded-md shadow-sm flex flex-col">
        <div className="p-5 border-b border-light-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-headline text-headline-md text-light-on-background">
            Booking Management
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or ID..."
              className="rounded border border-light-outline-variant bg-light-surface px-3 py-1.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-light-outline-variant bg-light-surface px-3 py-1.5 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-light-outline-variant bg-light-surface-container-low text-label-sm text-light-on-surface-variant">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Visit Date &amp; Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant text-body-md">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-light-outline">
                    No bookings match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-light-surface-container-low/60">
                    <td className="py-3.5 px-4 font-mono text-mono-md text-light-primary tabular-nums whitespace-nowrap">
                      {booking.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block text-light-on-surface font-medium">
                        {booking.customerName}
                      </span>
                      <span className="block text-label-sm text-light-outline tabular-nums">
                        {booking.customerEmail} · {booking.customerPhone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-light-on-surface whitespace-nowrap">
                      {booking.propertyTitle}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                      <span className="block text-light-on-surface">
                        {formatDisplayDate(booking.visitDate)}
                      </span>
                      <span className="block font-mono text-mono-md text-light-outline">
                        {booking.timeSlot}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm ${getRowBadgeStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {booking.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ booking, nextStatus: 'Confirmed' })
                            }
                            className="px-3 py-1 rounded bg-accent text-on-accent text-label-sm hover:opacity-90"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ booking, nextStatus: 'Rejected' })
                            }
                            className="px-3 py-1 rounded border border-light-error text-light-error text-label-sm hover:bg-light-error-container"
                          >
                            Reject
                          </button>
                        </div>
                      ) : booking.status === 'Confirmed' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ booking, nextStatus: 'Completed' })
                            }
                            className="px-3 py-1 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-sm hover:bg-light-surface-container"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ booking, nextStatus: 'Cancelled' })
                            }
                            className="px-3 py-1 rounded border border-light-error text-light-error text-label-sm hover:bg-light-error-container"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-label-sm text-light-outline">Archived</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Direct Owner Inquiries */}
      <section className="bg-light-surface border border-light-outline-variant rounded-md shadow-sm flex flex-col">
        <div className="p-5 border-b border-light-outline-variant flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-md text-light-on-background">
              Direct Owner Inquiries
            </h2>
            <p className="text-body-md text-light-outline mt-0.5">
              Live messages sent by customers to property owners. Replies broadcast back in real time.
            </p>
          </div>
          <span className="text-label-sm text-light-primary bg-light-surface-container px-3 py-1 rounded-full tabular-nums">
            {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
          </span>
        </div>

        <div className="divide-y divide-light-outline-variant">
          {inquiries.length === 0 ? (
            <p className="p-8 text-center text-body-md text-light-outline">
              No direct owner inquiries received yet.
            </p>
          ) : (
            inquiries.map((inq) => (
              <article key={inq.id} className="p-5 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-mono-md text-light-primary bg-light-surface-container px-2 py-0.5 rounded tabular-nums">
                      {inq.id}
                    </span>
                    <span className="text-label-lg text-light-on-surface">
                      {inq.senderName}
                    </span>
                    <span className="text-label-sm text-light-outline tabular-nums">
                      {inq.senderPhone} · {inq.senderEmail}
                    </span>
                  </div>
                  <span
                    className={`text-label-sm px-2.5 py-0.5 rounded-full ${
                      inq.status === 'Responded'
                        ? 'bg-success-container text-on-success-container'
                        : 'bg-warning-container text-on-warning-container'
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>

                <p className="text-label-sm text-accent">
                  For {inq.propertyTitle} · Owner: {inq.ownerName}
                </p>

                <p className="text-body-md text-light-on-surface-variant bg-light-surface-container-low p-3 rounded">
                  {inq.message}
                </p>

                {inq.ownerReply ? (
                  <p className="text-body-md text-light-primary bg-accent-container/40 p-3 rounded">
                    <span className="font-semibold">Owner Reply:</span> {inq.ownerReply}
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={replyDrafts[inq.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [inq.id]: e.target.value }))
                      }
                      placeholder={`Write a direct reply as ${inq.ownerName}...`}
                      className="flex-1 rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const text = (replyDrafts[inq.id] || '').trim();
                        if (!text) return;
                        await respondToInquiry(inq.id, text);
                        setReplyDrafts((prev) => ({ ...prev, [inq.id]: '' }));
                      }}
                      className="px-4 py-2 rounded bg-light-primary text-light-on-primary text-label-sm hover:bg-light-secondary whitespace-nowrap"
                    >
                      Send Reply
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {/* Confirmation Dialog */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 bg-light-primary/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-light-surface border border-light-outline-variant rounded-md p-6 max-w-sm w-full shadow-lg flex flex-col gap-4">
            <h3 className="font-headline text-headline-md text-light-on-background">
              Update Booking Status?
            </h3>
            <p className="text-body-md text-light-on-surface-variant">
              Set booking{' '}
              <span className="font-mono font-semibold text-light-primary tabular-nums">
                {pendingAction.booking.id}
              </span>{' '}
              ({pendingAction.booking.customerName}) to{' '}
              <span className="font-semibold text-light-on-surface">
                {pendingAction.nextStatus}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg hover:bg-light-surface-container"
              >
                Keep Current
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateBookingStatus(pendingAction.booking.id, pendingAction.nextStatus);
                  setPendingAction(null);
                }}
                className="px-4 py-2 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};
