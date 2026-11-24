import React, { useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { usePropVisit } from '../context/PropVisitContext';
import { formatDisplayDate, formatTimeRange } from '../utils/formatters';

export const AdminTimeSlotsPage: React.FC = () => {
  const {
    properties,
    getSlotsForPropertyDate,
    isDateHoliday,
    toggleHoliday,
    addTimeSlot,
    toggleSlotEnabled,
  } = usePropVisit();

  const [selectedPropertyId, setSelectedPropertyId] = useState(
    properties[0]?.id || 'prop-laurel'
  );
  const [selectedDate, setSelectedDate] = useState('2026-11-28');
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('17:15');
  const [slotMessage, setSlotMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const slots = selectedProperty
    ? getSlotsForPropertyDate(selectedProperty.id, selectedDate)
    : [];
  const holiday = selectedProperty
    ? isDateHoliday(selectedProperty.id, selectedDate)
    : false;

  const bookedCount = slots.filter((s) => Boolean(s.bookedByBookingId)).length;
  const openCount = slots.filter((s) => s.isAvailable).length;

  const handleAddSlot = async () => {
    setSlotMessage(null);
    if (!selectedProperty) return;
    if (!startTime || !endTime || endTime <= startTime) {
      setSlotMessage({
        type: 'error',
        text: 'End time must be later than start time.',
      });
      return;
    }
    const label = formatTimeRange(startTime, endTime);
    const res = await addTimeSlot(selectedProperty.id, selectedDate, label);
    if (!res.ok) {
      setSlotMessage({ type: 'error', text: res.error || 'Could not add time slot.' });
      return;
    }
    setSlotMessage({ type: 'success', text: `Added slot ${label}.` });
  };

  return (
    <AdminShell activeTab="slots">
      <div>
        <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
          Time Slot Configuration
        </h1>
        <p className="text-body-md text-light-outline mt-1">
          Configure daily visiting hours, block holidays, and inspect live slot occupancy in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Slot Generator Form */}
        <section className="bg-light-surface border border-light-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-headline text-headline-md text-light-on-background">
            Create Visit Slot
          </h2>

          <label className="flex flex-col gap-1.5">
            <span className="text-label-lg text-light-on-surface">Property</span>
            <select
              value={selectedProperty?.id || ''}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setSlotMessage(null);
              }}
              className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-label-lg text-light-on-surface">Visit Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSlotMessage(null);
              }}
              className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary tabular-nums"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-light-on-surface">Start Time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface tabular-nums"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-light-on-surface">End Time</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface tabular-nums"
              />
            </label>
          </div>

          {slotMessage && (
            <p
              className={`text-body-md px-3 py-2 rounded ${
                slotMessage.type === 'error'
                  ? 'bg-light-error-container text-light-on-error-container'
                  : 'bg-success-container text-on-success-container'
              }`}
            >
              {slotMessage.text}
            </p>
          )}

          <button
            type="button"
            onClick={handleAddSlot}
            className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              add
            </span>
            <span>Add Time Slot</span>
          </button>
        </section>

        {/* Live Slot Schedule */}
        <section className="lg:col-span-2 bg-light-surface border border-light-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-outline-variant pb-4">
            <div>
              <h2 className="font-headline text-headline-md text-light-on-background">
                {selectedProperty?.title || 'Select Property'} ·{' '}
                <span className="tabular-nums">{formatDisplayDate(selectedDate)}</span>
              </h2>
              <p className="text-body-md text-light-outline tabular-nums">
                {holiday
                  ? 'Date marked as holiday · all slots blocked'
                  : `${slots.length} configured slots · ${bookedCount} booked · ${openCount} open`}
              </p>
            </div>
            {selectedProperty && (
              <button
                type="button"
                onClick={() => toggleHoliday(selectedProperty.id, selectedDate)}
                className={`px-3.5 py-1.5 rounded text-label-sm whitespace-nowrap transition-colors duration-150 ${
                  holiday
                    ? 'bg-light-primary text-light-on-primary hover:bg-light-secondary'
                    : 'border border-light-error text-light-error hover:bg-light-error-container'
                }`}
              >
                {holiday ? 'Reopen Date for Visits' : 'Mark Date as Holiday'}
              </button>
            )}
          </div>

          {holiday ? (
            <div className="p-6 rounded border border-light-outline-variant bg-light-surface-container text-center text-body-md text-light-on-surface-variant">
              All visiting hours for {selectedProperty?.title} on{' '}
              {formatDisplayDate(selectedDate)} are paused for a holiday.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot) => {
                if (slot.bookedByBookingId) {
                  return (
                    <div
                      key={slot.id}
                      className="p-4 rounded border border-light-outline-variant bg-light-surface-container flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-mono text-mono-md text-light-on-surface-variant block tabular-nums">
                          {slot.label}
                        </span>
                        <span className="text-label-sm text-on-success-container bg-success-container px-2 py-0.5 rounded-full inline-block mt-1 tabular-nums">
                          Booked · {slot.bookedByBookingId}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded border border-light-outline-variant flex items-center justify-between gap-3 ${
                      slot.enabled ? 'bg-light-surface' : 'bg-light-surface-container-low'
                    }`}
                  >
                    <div>
                      <span
                        className={`font-mono text-mono-md block tabular-nums ${
                          slot.enabled
                            ? 'text-light-primary'
                            : 'text-light-outline line-through'
                        }`}
                      >
                        {slot.label}
                      </span>
                      <span
                        className={`text-label-sm ${
                          slot.enabled ? 'text-accent' : 'text-light-outline'
                        }`}
                      >
                        {slot.enabled ? 'Available' : 'Disabled'}
                      </span>
                    </div>
                    {selectedProperty && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleSlotEnabled(selectedProperty.id, selectedDate, slot.label)
                        }
                        className={`text-label-sm hover:underline ${
                          slot.enabled ? 'text-light-error' : 'text-light-primary'
                        }`}
                      >
                        {slot.enabled ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
};
