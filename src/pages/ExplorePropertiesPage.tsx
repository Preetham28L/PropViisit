import React, { useMemo, useState } from 'react';
import { CustomerFooter } from '../components/CustomerFooter';
import { CustomerHeader } from '../components/CustomerHeader';
import { SafeImage } from '../components/SafeImage';
import { usePropVisit } from '../context/PropVisitContext';
import { HERO_IMAGE } from '../data/seedData';
import { PropertyType } from '../types';
import { formatPrice } from '../utils/formatters';

function getTypeBadgeClasses(type: PropertyType): string {
  switch (type) {
    case 'Villa':
      return 'bg-accent-container text-on-accent-container';
    case 'Penthouse':
      return 'bg-light-primary-container text-light-on-primary-container';
    case 'Townhouse':
      return 'bg-light-secondary-container text-light-on-secondary-container';
    case 'Modern Home':
      return 'bg-light-tertiary-container text-light-on-tertiary-container';
    default:
      return 'bg-light-surface-container text-light-on-surface-variant';
  }
}

export const ExplorePropertiesPage: React.FC = () => {
  const { properties, navigate, selectedPropertyId } = usePropVisit();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [minBeds, setMinBeds] = useState(0);
  const [sortPrice, setSortPrice] = useState<'featured' | 'asc' | 'desc'>('featured');

  const cities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.city))),
    [properties]
  );

  const filteredProperties = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = properties.filter((p) => {
      const text = `${p.title} ${p.neighborhood} ${p.city} ${p.shortDescription} ${p.type} ${p.ownerName}`.toLowerCase();
      const matchQ = !q || text.includes(q);
      const matchLoc = locationFilter === 'all' || p.city === locationFilter;
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      const matchBeds = p.beds >= minBeds;
      return matchQ && matchLoc && matchType && matchBeds;
    });

    if (sortPrice === 'asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortPrice === 'desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [properties, search, locationFilter, typeFilter, minBeds, sortPrice]);

  const resetFilters = () => {
    setSearch('');
    setLocationFilter('all');
    setTypeFilter('all');
    setMinBeds(0);
    setSortPrice('featured');
  };

  return (
    <div className="bg-light-background text-light-on-surface font-body min-h-screen flex flex-col">
      <CustomerHeader variant="default" />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative overflow-hidden bg-light-primary">
          <SafeImage
            src={HERO_IMAGE}
            alt="Modern architectural residence illuminated at twilight"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-light-primary/75" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
            <div className="max-w-2xl flex flex-col gap-5">
              <h1 className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-primary text-balance">
                Find Your Dream Property. Experience It Before You Decide.
              </h1>
              <p className="text-body-lg text-light-on-primary/90 text-pretty max-w-prose">
                Discover curated homes across Bangalore, Hyderabad, Mumbai, and Pune—connect directly with property owners and book live site visits.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('properties');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-accent text-on-accent text-label-lg hover:opacity-90 transition-opacity duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Explore Properties</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate('schedule-visit', {
                      propertyId:
                        properties.find((p) => p.availability === 'Active')?.id ||
                        selectedPropertyId,
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-light-surface text-light-primary text-label-lg hover:bg-light-surface-container transition-colors duration-150 whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                    calendar_month
                  </span>
                  <span>Schedule a Visit</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Search, Filter & Sort Section */}
        <section id="properties" className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
                Available Properties
              </h2>
              <p className="text-body-md text-light-outline mt-1">
                Filter by Indian city, price in INR, or layout—contact owners directly or book an in-person walkthrough.
              </p>
            </div>
            <span className="text-label-lg text-light-on-surface-variant tabular-nums">
              Showing {filteredProperties.length}{' '}
              {filteredProperties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>

          {/* Filter Bar */}
          <div className="bg-light-surface border border-light-outline-variant rounded-md p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <label className="flex flex-col gap-1.5 lg:col-span-2">
              <span className="text-label-sm text-light-on-surface">Search</span>
              <div className="relative flex items-center">
                <span
                  className="material-symbols-outlined absolute left-3 text-light-outline text-title-md pointer-events-none"
                  aria-hidden="true"
                >
                  search
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Property, city, or owner name..."
                  className="w-full rounded border border-light-outline-variant bg-light-surface pl-10 pr-3 py-2 text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-light-on-surface">City</span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              >
                <option value="all">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-light-on-surface">Property Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              >
                <option value="all">All Types</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Modern Home">Modern Home</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-light-on-surface">Bedrooms</span>
              <select
                value={minBeds}
                onChange={(e) => setMinBeds(Number(e.target.value))}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              >
                <option value={0}>Any Beds</option>
                <option value={2}>2+ Beds</option>
                <option value={3}>3+ Beds</option>
                <option value={4}>4+ Beds</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-light-on-surface">Sort by Price (₹)</span>
              <select
                value={sortPrice}
                onChange={(e) => setSortPrice(e.target.value as 'featured' | 'asc' | 'desc')}
                className="w-full rounded border border-light-outline-variant bg-light-surface px-3 py-2 text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              >
                <option value="featured">Featured</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {/* Property Grid */}
          {filteredProperties.length === 0 ? (
            <div className="bg-light-surface border border-light-outline-variant rounded-md p-10 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-light-outline" aria-hidden="true">
                search_off
              </span>
              <h3 className="font-headline text-headline-md text-light-on-surface">
                No properties match your criteria
              </h3>
              <p className="text-body-md text-light-outline max-w-md">
                Try clearing one or more filters to view all available listings.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-5 py-2.5 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {filteredProperties.map((property) => (
                <article
                  key={property.id}
                  className="bg-light-surface border border-light-outline-variant rounded-md overflow-hidden shadow-sm flex flex-col h-full transition-shadow duration-150 hover:shadow-md"
                >
                  <div className="relative h-64 bg-light-surface-container overflow-hidden">
                    <SafeImage
                      src={property.images[0]}
                      alt={`${property.title} exterior`}
                      className="w-full h-full object-cover"
                    />
                    {property.availability === 'Paused' && (
                      <span className="absolute top-3 left-3 text-label-sm bg-warning-container text-on-warning-container px-2.5 py-0.5 rounded-full shadow-sm">
                        Visits Paused
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1 gap-3">
                    <header className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-title text-title-lg text-light-primary tabular-nums">
                          {formatPrice(property.price)}
                        </span>
                        <span
                          className={`text-label-sm px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${getTypeBadgeClasses(
                            property.type
                          )}`}
                        >
                          {property.type}
                        </span>
                      </div>
                      <h3 className="font-headline text-headline-md text-light-on-surface">
                        {property.title}
                      </h3>
                      <p className="text-body-md text-light-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-body-md" aria-hidden="true">
                          location_on
                        </span>
                        <span>
                          {property.neighborhood}, {property.city}
                        </span>
                      </p>
                    </header>

                    <p className="text-body-md text-light-on-surface-variant text-pretty">
                      {property.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-light-outline-variant text-body-md text-light-on-surface-variant tabular-nums">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-title-md text-light-outline" aria-hidden="true">
                          bed
                        </span>
                        {property.beds} Beds
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-title-md text-light-outline" aria-hidden="true">
                          bathtub
                        </span>
                        {property.baths} Baths
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-title-md text-light-outline" aria-hidden="true">
                          square_foot
                        </span>
                        {property.sqft.toLocaleString('en-IN')} sq ft
                      </span>
                    </div>

                    {/* Direct Property Owner Strip */}
                    <div className="pt-2.5 border-t border-light-outline-variant flex flex-wrap items-center justify-between gap-2 text-label-sm text-light-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-title-md text-accent" aria-hidden="true">
                          person
                        </span>
                        <span>Owner: {property.ownerName}</span>
                      </span>
                      <a
                        href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 text-accent hover:underline font-mono text-mono-md tabular-nums"
                      >
                        <span className="material-symbols-outlined text-label-lg" aria-hidden="true">
                          call
                        </span>
                        {property.ownerPhone}
                      </a>
                    </div>

                    <footer className="mt-auto pt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('property-details', { propertyId: property.id })}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg hover:bg-light-surface-container transition-colors duration-150 whitespace-nowrap"
                      >
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('schedule-visit', { propertyId: property.id })}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150 whitespace-nowrap"
                      >
                        <span>Book a Visit</span>
                      </button>
                    </footer>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* About PropVisit Section */}
        <section id="about" className="border-t border-light-outline-variant bg-light-surface">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
              <h2 className="font-headline text-headline-md text-light-on-background">
                Direct Owner Access, Real-Time Scheduling
              </h2>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-label-lg text-light-primary">Direct Owner Contact</span>
                <p className="text-body-md text-light-on-surface-variant">
                  Every listing includes verified owner phone and email details so you can call or message directly without intermediaries.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-label-lg text-light-primary">Live Slot Sync</span>
                <p className="text-body-md text-light-on-surface-variant">
                  45-minute private windows update live across all visitors the moment a slot is booked or adjusted.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-label-lg text-light-primary">Transparent INR Pricing</span>
                <p className="text-body-md text-light-on-surface-variant">
                  All properties across Bangalore, Hyderabad, Mumbai, and Pune display live pricing in Indian Rupees.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
};
