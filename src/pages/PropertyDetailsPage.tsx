import React, { useEffect, useState } from 'react';
import { CustomerFooter } from '../components/CustomerFooter';
import { CustomerHeader } from '../components/CustomerHeader';
import { SafeImage } from '../components/SafeImage';
import { usePropVisit } from '../context/PropVisitContext';
import { formatPrice } from '../utils/formatters';

export const PropertyDetailsPage: React.FC = () => {
  const {
    properties,
    inquiries,
    selectedPropertyId,
    customerProfile,
    navigate,
    getOpenSlotCountForProperty,
    sendOwnerInquiry,
  } = usePropVisit();

  const property =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Direct owner message state
  const [senderName, setSenderName] = useState(customerProfile?.name || '');
  const [senderPhone, setSenderPhone] = useState(customerProfile?.phone || '');
  const [senderEmail, setSenderEmail] = useState(customerProfile?.email || '');
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [msgSentId, setMsgSentId] = useState<string | null>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setMsgSentId(null);
    setMsgError('');
  }, [property?.id]);

  if (!property) {
    return (
      <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col">
        <CustomerHeader variant="default" />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
          <h1 className="font-headline text-headline-lg text-light-on-background">
            Property Not Found
          </h1>
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="px-5 py-2.5 rounded bg-light-primary text-light-on-primary text-label-lg"
          >
            Back to Properties
          </button>
        </main>
        <CustomerFooter compact />
      </div>
    );
  }

  const gallery = property.images.length > 0 ? property.images : [''];
  const mainImage = gallery[activeImageIndex] || gallery[0];
  const openSlotsCount = getOpenSlotCountForProperty(property.id);
  const propertyInquiries = inquiries.filter((i) => i.propertyId === property.id);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(property.ownerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Clipboard API may be restricted
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError('');
    setMsgSentId(null);

    if (
      !senderName.trim() ||
      senderPhone.replace(/\D/g, '').length < 8 ||
      !senderEmail.includes('@') ||
      !messageText.trim()
    ) {
      setMsgError('Enter your name, valid phone number, email, and message for the owner.');
      return;
    }

    setSendingMsg(true);
    const res = await sendOwnerInquiry({
      propertyId: property.id,
      senderName,
      senderPhone,
      senderEmail,
      message: messageText,
    });
    setSendingMsg(false);

    if (res.ok === false) {
      setMsgError(res.error);
      return;
    }

    setMsgSentId(res.inquiry.id);
    setMessageText('');
  };

  return (
    <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col">
      <CustomerHeader variant="default" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
        {/* Back Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => navigate('explore', { scrollToId: 'properties' })}
            className="inline-flex items-center gap-1.5 text-label-lg text-light-secondary hover:text-light-primary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              arrow_back
            </span>
            <span>Back to Properties</span>
          </button>
        </div>

        {/* Image Gallery */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 rounded-md overflow-hidden border border-light-outline-variant bg-light-surface-container h-80 md:h-[460px]">
            <SafeImage
              src={mainImage}
              alt={`${property.title} view ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            {gallery.slice(0, 3).map((imgUrl, idx) => {
              const isSelected = idx === activeImageIndex;
              return (
                <button
                  key={`${property.id}-thumb-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View gallery photo ${idx + 1}`}
                  className={`rounded-md overflow-hidden h-24 lg:h-36 bg-light-surface-container transition-opacity duration-150 ${
                    isSelected
                      ? 'border-2 border-light-primary opacity-100'
                      : 'border border-light-outline-variant opacity-80 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={imgUrl}
                    alt={`${property.title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Details + Sticky Booking & Direct Owner Contact */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Title & Key Specs */}
            <div className="flex flex-col gap-3 border-b border-light-outline-variant pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-label-sm bg-accent-container text-on-accent-container px-3 py-1 rounded-full">
                  {property.type}
                </span>
                {property.availability === 'Active' ? (
                  <span className="text-label-sm bg-success-container text-on-success-container px-3 py-1 rounded-full">
                    Available for Visits
                  </span>
                ) : (
                  <span className="text-label-sm bg-warning-container text-on-warning-container px-3 py-1 rounded-full">
                    Visits Currently Paused
                  </span>
                )}
              </div>

              <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
                {property.title}
              </h1>

              <p className="text-body-lg text-light-outline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  location_on
                </span>
                <span>{property.address}</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="bg-light-surface border border-light-outline-variant rounded p-4">
                  <span className="text-label-sm text-light-outline block">Bedrooms</span>
                  <span className="font-title text-title-lg text-light-primary tabular-nums">
                    {property.beds} Beds
                  </span>
                </div>
                <div className="bg-light-surface border border-light-outline-variant rounded p-4">
                  <span className="text-label-sm text-light-outline block">Bathrooms</span>
                  <span className="font-title text-title-lg text-light-primary tabular-nums">
                    {property.baths} Baths
                  </span>
                </div>
                <div className="bg-light-surface border border-light-outline-variant rounded p-4">
                  <span className="text-label-sm text-light-outline block">Total Area</span>
                  <span className="font-title text-title-lg text-light-primary tabular-nums">
                    {property.sqft.toLocaleString('en-IN')} sq ft
                  </span>
                </div>
                <div className="bg-light-surface border border-light-outline-variant rounded p-4">
                  <span className="text-label-sm text-light-outline block">Property Type</span>
                  <span className="font-title text-title-lg text-light-primary">
                    {property.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="flex flex-col gap-3">
              <h2 className="font-headline text-headline-md text-light-on-background">
                About This Property
              </h2>
              <p className="text-body-lg text-light-on-surface-variant text-pretty max-w-prose">
                {property.fullDescription}
              </p>
            </div>

            {/* Amenities & Facilities */}
            <div className="flex flex-col gap-4">
              <h2 className="font-headline text-headline-md text-light-on-background">
                Amenities &amp; Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.amenities.map((amenity, i) => (
                  <div
                    key={`${property.id}-amenity-${i}`}
                    className="flex items-center gap-3 p-3.5 rounded bg-light-surface border border-light-outline-variant"
                  >
                    <span className="material-symbols-outlined text-accent" aria-hidden="true">
                      {amenity.icon}
                    </span>
                    <span className="text-body-md text-light-on-surface">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Block */}
            <div className="flex flex-col gap-3">
              <h2 className="font-headline text-headline-md text-light-on-background">Location</h2>
              <div className="rounded-md border border-light-outline-variant bg-light-surface-container p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-full bg-light-primary text-light-on-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                      pin_drop
                    </span>
                  </span>
                  <div>
                    <p className="text-title-md text-light-on-surface">
                      {property.neighborhood}, {property.city}
                    </p>
                    <p className="text-body-md text-light-on-surface-variant">
                      {property.nearbyNote}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                  {property.coordinates}
                </span>
              </div>
            </div>

            {/* Real-Time Owner Replies / Updates */}
            {propertyInquiries.some((inq) => inq.ownerReply) && (
              <div className="flex flex-col gap-3">
                <h2 className="font-headline text-headline-md text-light-on-background">
                  Owner Responses
                </h2>
                <div className="flex flex-col gap-3">
                  {propertyInquiries
                    .filter((inq) => inq.ownerReply)
                    .map((inq) => (
                      <div
                        key={inq.id}
                        className="rounded-md border border-light-outline-variant bg-light-surface p-4 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-label-sm text-light-outline">
                          <span>Question from {inq.senderName}</span>
                          <span className="text-accent">Answered by {inq.ownerName}</span>
                        </div>
                        <p className="text-body-md text-light-on-surface-variant">
                          &ldquo;{inq.message}&rdquo;
                        </p>
                        <p className="text-body-md text-light-primary font-medium bg-light-surface-container-low p-3 rounded">
                          {inq.ownerReply}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Card + Direct Owner Contact */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <aside className="bg-light-surface border border-light-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-5">
              <div className="border-b border-light-outline-variant pb-4">
                <span className="text-label-sm text-light-outline block">Listing Price (INR)</span>
                <p className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-primary tabular-nums mt-1">
                  {formatPrice(property.price)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-body-md text-light-on-surface">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                  <span className="tabular-nums">
                    {property.availability === 'Active'
                      ? `${openSlotsCount} open visit slots available`
                      : 'Walkthrough scheduling is temporarily paused'}
                  </span>
                </div>
                <p className="text-body-md text-light-outline">
                  Private 45-minute walkthroughs hosted directly with the property owner.
                </p>
              </div>

              <button
                type="button"
                disabled={property.availability === 'Paused'}
                onClick={() => navigate('schedule-visit', { propertyId: property.id })}
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded text-label-lg transition-colors duration-150 ${
                  property.availability === 'Paused'
                    ? 'bg-light-surface-container text-light-outline cursor-not-allowed'
                    : 'bg-light-primary text-light-on-primary hover:bg-light-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  calendar_month
                </span>
                <span>
                  {property.availability === 'Paused' ? 'Visits Paused' : 'Schedule Visit'}
                </span>
              </button>
            </aside>

            {/* Direct Property Owner Contact Card */}
            <aside className="bg-light-surface border border-light-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3 border-b border-light-outline-variant pb-4">
                <div>
                  <span className="text-label-sm text-accent block">{property.ownerRole}</span>
                  <h2 className="font-headline text-headline-md text-light-on-background mt-0.5">
                    {property.ownerName}
                  </h2>
                </div>
                <span className="w-10 h-10 rounded-full bg-accent-container text-on-accent-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                    verified_user
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-body-md">
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2 font-mono text-mono-md text-light-primary hover:underline tabular-nums"
                  >
                    <span className="material-symbols-outlined text-title-md text-accent" aria-hidden="true">
                      call
                    </span>
                    <span>{property.ownerPhone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="text-label-sm text-light-secondary hover:text-light-primary px-2 py-1 rounded border border-light-outline-variant"
                  >
                    {copiedPhone ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <a
                  href={`mailto:${property.ownerEmail}?subject=${encodeURIComponent(
                    `Inquiry about ${property.title}`
                  )}`}
                  className="inline-flex items-center gap-2 text-body-md text-light-on-surface-variant hover:text-light-primary break-all"
                >
                  <span className="material-symbols-outlined text-title-md text-accent shrink-0" aria-hidden="true">
                    mail
                  </span>
                  <span>{property.ownerEmail}</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-accent text-on-accent text-label-sm hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-label-lg" aria-hidden="true">
                    call
                  </span>
                  <span>Call Owner</span>
                </a>
                <a
                  href={`mailto:${property.ownerEmail}?subject=${encodeURIComponent(
                    `Property Inquiry: ${property.title}`
                  )}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-sm hover:bg-light-surface-container"
                >
                  <span className="material-symbols-outlined text-label-lg" aria-hidden="true">
                    mail
                  </span>
                  <span>Email Owner</span>
                </a>
              </div>

              {/* Real-Time Direct Message Form */}
              <form
                onSubmit={handleSendMessage}
                className="pt-4 border-t border-light-outline-variant flex flex-col gap-3"
                noValidate
              >
                <span className="text-label-lg text-light-on-surface">
                  Message Owner Directly
                </span>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                  />
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="you@domain.in"
                    className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Ask ${property.ownerName} about registration, parking, or callback time...`}
                  className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />

                {msgError && (
                  <p className="text-label-sm bg-light-error-container text-light-on-error-container px-3 py-2 rounded">
                    {msgError}
                  </p>
                )}

                {msgSentId && (
                  <p className="text-label-sm bg-success-container text-on-success-container px-3 py-2 rounded">
                    Message sent live ({msgSentId}) to {property.ownerName}. They can respond in real time.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-light-primary bg-light-primary-container text-light-on-primary-container text-label-lg hover:bg-light-secondary-container transition-colors duration-150"
                >
                  <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                    send
                  </span>
                  <span>{sendingMsg ? 'Sending...' : 'Send Direct Message'}</span>
                </button>
              </form>
            </aside>
          </div>
        </section>
      </main>

      <CustomerFooter compact />
    </div>
  );
};
