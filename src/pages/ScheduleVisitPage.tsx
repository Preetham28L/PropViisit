import React, { useEffect, useState } from 'react';
import { CustomerFooter } from '../components/CustomerFooter';
import { CustomerHeader } from '../components/CustomerHeader';
import { SafeImage } from '../components/SafeImage';
import { usePropVisit } from '../context/PropVisitContext';
import { formatDisplayDate, formatPrice } from '../utils/formatters';

const MIN_DATE = '2026-11-24';

export const ScheduleVisitPage: React.FC = () => {
  const {
    properties,
    selectedPropertyId,
    customerProfile,
    getSlotsForPropertyDate,
    isDateHoliday,
    createBooking,
    navigate,
  } = usePropVisit();

  const [propertyId, setPropertyId] = useState(selectedPropertyId);
  const property =
    properties.find((p) => p.id === propertyId) || properties[0];

  const [visitDate, setVisitDate] = useState('2026-11-28');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [visitorName, setVisitorName] = useState(customerProfile?.name || '');
  const [visitorPhone, setVisitorPhone] = useState(customerProfile?.phone || '');
  const [visitorEmail, setVisitorEmail] = useState(customerProfile?.email || '');
  const [visitorNotes, setVisitorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  useEffect(() => {
    setPropertyId(selectedPropertyId);
  }, [selectedPropertyId]);

  const slots = property ? getSlotsForPropertyDate(property.id, visitDate) : [];
  const holiday = property ? isDateHoliday(property.id, visitDate) : false;
  const isPastDate = Boolean(visitDate && visitDate < MIN_DATE);

  useEffect(() => {
    if (!slots.some((s) => s.label === selectedSlot && s.isAvailable)) {
      const firstOpen = slots.find((s) => s.isAvailable);
      setSelectedSlot(firstOpen ? firstOpen.label : '');
    }
  }, [property?.id, visitDate, slots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!property) {
      setFormError('Please select a property.');
      return;
    }

    if (isPastDate) {
      setFormError('Past dates cannot be booked. Please select an upcoming date.');
      return;
    }

    if (holiday) {
      setFormError('The selected date is marked as a holiday. Please choose another date.');
      return;
    }

    if (!selectedSlot) {
      setFormError('Please select an available time slot.');
      return;
    }

    const digits = visitorPhone.replace(/\D/g, '');
    if (!visitorName.trim() || !visitorEmail.includes('@') || digits.length < 8) {
      setFormError(
        'Please provide your full name, a valid email address, and a valid phone number.'
      );
      return;
    }

    setSubmitting(true);
    const result = await createBooking({
      propertyId: property.id,
      visitDate,
      timeSlot: selectedSlot,
      customerName: visitorName,
      customerEmail: visitorEmail,
      customerPhone: visitorPhone,
      notes: visitorNotes,
    });
    setSubmitting(false);

    if (result.ok === false) {
      setFormError(result.error);
      return;
    }

    setConfirmedRef(result.booking.id);
  };

  return (
    <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col">
      <CustomerHeader variant="back-to-property" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-10 flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
            Schedule Your Property Visit
          </h1>
          <p className="text-body-md text-light-outline mt-1">
            Select an available date and time slot. Slots update in real time across all visitors to prevent double bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Booking Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-light-surface border border-light-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-6"
            noValidate
          >
            {/* Property Switcher */}
            <label className="flex flex-col gap-1.5">
              <span className="text-label-lg text-light-on-surface">Property</span>
              <select
                value={property?.id || ''}
                disabled={Boolean(confirmedRef)}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  setConfirmedRef(null);
                }}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2.5 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.availability === 'Paused'}>
                    {p.title} ({p.city}) — {formatPrice(p.price)}
                    {p.availability === 'Paused' ? ' — Visits Paused' : ''}
                  </option>
                ))}
              </select>
            </label>

            {/* Step 1: Date & Time Slot */}
            <div className="flex flex-col gap-4 border-b border-light-outline-variant pb-6">
              <h2 className="font-headline text-headline-md text-light-on-background">
                1. Date &amp; Time Slot
              </h2>

              <label className="flex flex-col gap-1.5 max-w-xs">
                <span className="text-label-lg text-light-on-surface">Preferred Visit Date</span>
                <input
                  type="date"
                  value={visitDate}
                  min={MIN_DATE}
                  disabled={Boolean(confirmedRef)}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2.5 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary tabular-nums"
                />
                {isPastDate && (
                  <span className="text-label-sm text-light-error" role="alert">
                    Past dates cannot be booked.
                  </span>
                )}
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-label-lg text-light-on-surface">Available Time Slots</span>

                {holiday ? (
                  <div className="rounded border border-light-error bg-light-error-container text-light-on-error-container p-4 text-body-md">
                    Visits are unavailable on {formatDisplayDate(visitDate)} (marked as a holiday). Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot.label && slot.isAvailable;
                      if (!slot.isAvailable) {
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled
                            className="text-left p-3.5 rounded border border-light-outline-variant bg-light-surface-container text-light-on-surface-variant cursor-not-allowed"
                          >
                            <span className="font-mono text-mono-md block tabular-nums line-through">
                              {slot.label}
                            </span>
                            <span className="text-label-sm text-light-on-surface-variant">
                              {slot.bookedByBookingId ? 'Already Booked' : 'Unavailable'}
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={Boolean(confirmedRef)}
                          onClick={() => setSelectedSlot(slot.label)}
                          className={`text-left p-3.5 rounded transition-colors duration-150 ${
                            isSelected
                              ? 'border-2 border-light-primary bg-light-primary-container text-light-on-primary-container'
                              : 'border border-light-outline-variant bg-light-surface text-light-on-surface hover:border-light-primary'
                          }`}
                        >
                          <span className="font-mono text-mono-md block tabular-nums">
                            {slot.label}
                          </span>
                          <span className="text-label-sm text-accent">
                            {isSelected ? 'Selected · Available' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Visitor Information */}
            <div className="flex flex-col gap-4">
              <h2 className="font-headline text-headline-md text-light-on-background">
                2. Visitor Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-label-lg text-light-on-surface">Full Name</span>
                  <input
                    type="text"
                    value={visitorName}
                    disabled={Boolean(confirmedRef)}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Aarav Mehta"
                    required
                    className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-label-lg text-light-on-surface">Phone Number</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={visitorPhone}
                    disabled={Boolean(confirmedRef)}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    required
                    className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-label-lg text-light-on-surface">Email Address</span>
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
                    value={visitorEmail}
                    disabled={Boolean(confirmedRef)}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="aarav.mehta@bengaluru.in"
                    required
                    className="w-full rounded border border-light-outline-variant bg-light-surface pl-10 pr-3.5 py-2.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-label-lg text-light-on-surface">
                  Additional Message (Optional)
                </span>
                <textarea
                  rows={3}
                  value={visitorNotes}
                  disabled={Boolean(confirmedRef)}
                  onChange={(e) => setVisitorNotes(e.target.value)}
                  placeholder="Any specific areas of the property you would like to inspect..."
                  className="w-full rounded border border-light-outline-variant bg-light-surface px-3.5 py-2.5 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />
              </label>
            </div>

            {formError && (
              <p
                className="text-body-md bg-light-error-container text-light-on-error-container px-4 py-3 rounded"
                role="alert"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={Boolean(confirmedRef) || submitting}
              className={`w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-light-primary text-light-on-primary text-label-lg transition-colors duration-150 ${
                confirmedRef || submitting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-light-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                event_available
              </span>
              <span>{submitting ? 'Confirming...' : 'Confirm Property Visit'}</span>
            </button>

            {confirmedRef && property && (
              <div className="rounded-md bg-success-container text-on-success-container p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-title-lg" aria-hidden="true">
                    check_circle
                  </span>
                  <h3 className="font-title text-title-lg">Visit Request Confirmed</h3>
                </div>
                <p className="text-body-md">
                  Your booking reference is{' '}
                  <span className="font-mono text-mono-md font-bold tabular-nums">
                    {confirmedRef}
                  </span>
                  . Direct owner contact:{' '}
                  <span className="font-semibold">{property.ownerName}</span> (
                  <a
                    href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                    className="underline tabular-nums"
                  >
                    {property.ownerPhone}
                  </a>
                  ). View anytime in{' '}
                  <button
                    type="button"
                    onClick={() => navigate('my-bookings')}
                    className="underline font-semibold"
                  >
                    My Bookings
                  </button>
                  .
                </p>
              </div>
            )}
          </form>

          {/* Selected Property Summary + Owner Details */}
          {property && (
            <aside className="bg-light-surface border border-light-outline-variant rounded-md overflow-hidden shadow-sm flex flex-col">
              <SafeImage
                src={property.images[0]}
                alt={property.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5 flex flex-col gap-3">
                <span className="text-label-sm text-accent uppercase">Selected Property</span>
                <h3 className="font-headline text-headline-md text-light-on-surface">
                  {property.title}
                </h3>
                <p className="text-body-md text-light-outline">
                  {property.neighborhood}, {property.city} ·{' '}
                  <span className="font-semibold text-light-primary tabular-nums">
                    {formatPrice(property.price)}
                  </span>
                </p>
                <div className="border-t border-light-outline-variant pt-3 flex flex-col gap-1.5 text-body-md">
                  <div className="flex justify-between gap-2">
                    <span className="text-light-outline">Date</span>
                    <span className="text-light-on-surface tabular-nums font-medium">
                      {formatDisplayDate(visitDate)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-light-outline">Time Slot</span>
                    <span className="font-mono text-mono-md text-light-primary tabular-nums text-right">
                      {selectedSlot || 'None selected'}
                    </span>
                  </div>
                </div>

                {/* Direct Owner Details */}
                <div className="border-t border-light-outline-variant pt-3 flex flex-col gap-1.5">
                  <span className="text-label-sm text-light-outline">Property Owner Contact</span>
                  <span className="text-body-md font-semibold text-light-on-surface">
                    {property.ownerName}
                  </span>
                  <a
                    href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                    className="text-body-md font-mono text-accent hover:underline tabular-nums"
                  >
                    {property.ownerPhone}
                  </a>
                  <a
                    href={`mailto:${property.ownerEmail}`}
                    className="text-label-sm text-light-on-surface-variant hover:underline break-all"
                  >
                    {property.ownerEmail}
                  </a>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      <CustomerFooter compact />
    </div>
  );
};
