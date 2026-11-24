import React, { useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { SafeImage } from '../components/SafeImage';
import { usePropVisit } from '../context/PropVisitContext';
import { IMG_KITCHEN, IMG_LAUREL, IMG_MERCER } from '../data/seedData';
import { Property, PropertyAvailability, PropertyType } from '../types';
import { formatPrice } from '../utils/formatters';

interface PropertyFormState {
  title: string;
  city: string;
  neighborhood: string;
  address: string;
  type: PropertyType;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  availability: PropertyAvailability;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  shortDescription: string;
  fullDescription: string;
}

const EMPTY_FORM: PropertyFormState = {
  title: '',
  city: 'Bangalore',
  neighborhood: '',
  address: '',
  type: 'Villa',
  price: '18500000',
  beds: '3',
  baths: '2.5',
  sqft: '2200',
  availability: 'Active',
  ownerName: '',
  ownerPhone: '+91 ',
  ownerEmail: '',
  shortDescription: '',
  fullDescription: '',
};

export const AdminPropertiesPage: React.FC = () => {
  const { properties, addProperty, updateProperty, deleteProperty } = usePropVisit();
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setEditingProperty(null);
    setFormError('');
    setModalMode('add');
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setForm({
      title: prop.title,
      city: prop.city,
      neighborhood: prop.neighborhood,
      address: prop.address,
      type: prop.type,
      price: String(prop.price),
      beds: String(prop.beds),
      baths: String(prop.baths),
      sqft: String(prop.sqft),
      availability: prop.availability,
      ownerName: prop.ownerName,
      ownerPhone: prop.ownerPhone,
      ownerEmail: prop.ownerEmail,
      shortDescription: prop.shortDescription,
      fullDescription: prop.fullDescription,
    });
    setFormError('');
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.city.trim() ||
      !form.neighborhood.trim() ||
      !form.ownerName.trim() ||
      !form.ownerPhone.trim()
    ) {
      setFormError('Please provide property title, neighborhood, Indian city, and owner contact details.');
      return;
    }

    const numericPrice = Number(form.price) || 15000000;
    const numericBeds = Number(form.beds) || 3;
    const numericBaths = Number(form.baths) || 2;
    const numericSqft = Number(form.sqft) || 2000;

    if (modalMode === 'add') {
      await addProperty({
        title: form.title.trim(),
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim(),
        address:
          form.address.trim() || `${form.neighborhood.trim()}, ${form.city.trim()}`,
        nearbyNote: `${form.neighborhood.trim()} · Private guided walkthroughs`,
        coordinates: '12.9716° N, 77.5946° E',
        type: form.type,
        price: numericPrice,
        beds: numericBeds,
        baths: numericBaths,
        sqft: numericSqft,
        shortDescription:
          form.shortDescription.trim() ||
          'Architectural residence curated for private in-person site visits.',
        fullDescription:
          form.fullDescription.trim() ||
          form.shortDescription.trim() ||
          'Thoughtfully designed contemporary residence featuring generous natural light and tailored finishes.',
        availability: form.availability,
        ownerName: form.ownerName.trim(),
        ownerRole: 'Direct Property Owner',
        ownerPhone: form.ownerPhone.trim(),
        ownerEmail: form.ownerEmail.trim() || 'owner@propvisit.in',
        images: [IMG_LAUREL, IMG_KITCHEN, IMG_MERCER],
        amenities: [
          { icon: 'yard', label: 'Private Landscaped Grounds' },
          { icon: 'kitchen', label: "Designer Chef's Kitchen" },
          { icon: 'thermostat', label: 'Zoned Climate Control' },
          { icon: 'directions_car', label: 'Dedicated Car Parking' },
        ],
      });
    } else if (modalMode === 'edit' && editingProperty) {
      await updateProperty(editingProperty.id, {
        title: form.title.trim(),
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim(),
        address:
          form.address.trim() || `${form.neighborhood.trim()}, ${form.city.trim()}`,
        type: form.type,
        price: numericPrice,
        beds: numericBeds,
        baths: numericBaths,
        sqft: numericSqft,
        availability: form.availability,
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(),
        ownerEmail: form.ownerEmail.trim() || editingProperty.ownerEmail,
        shortDescription: form.shortDescription.trim() || editingProperty.shortDescription,
        fullDescription: form.fullDescription.trim() || editingProperty.fullDescription,
      });
    }

    setModalMode(null);
    setEditingProperty(null);
  };

  return (
    <AdminShell activeTab="properties">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-background">
            Property Management
          </h1>
          <p className="text-body-md text-light-outline mt-1">
            Update Indian city listings, INR prices, and direct property owner contacts in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary transition-colors duration-150 self-start sm:self-auto whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-title-md" aria-hidden="true">
            add_home
          </span>
          <span>Add Property</span>
        </button>
      </div>

      {/* Properties Table */}
      <section className="bg-light-surface border border-light-outline-variant rounded-md shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-outline-variant bg-light-surface-container-low text-label-sm text-light-on-surface-variant">
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Owner Contact</th>
              <th className="py-3 px-4">Price (INR)</th>
              <th className="py-3 px-4">Specs</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-outline-variant text-body-md">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 px-4 text-center text-light-outline">
                  No properties configured yet. Click &ldquo;Add Property&rdquo; to create your first listing.
                </td>
              </tr>
            ) : (
              properties.map((prop) => (
                <tr key={prop.id} className="hover:bg-light-surface-container-low/60">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-14 h-10 rounded object-cover shrink-0"
                      />
                      <div>
                        <span className="block text-light-on-surface font-semibold">
                          {prop.title}
                        </span>
                        <span className="block text-label-sm text-light-outline">
                          {prop.neighborhood}, {prop.city} · {prop.type}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="block text-light-on-surface font-medium">
                      {prop.ownerName}
                    </span>
                    <span className="block font-mono text-mono-md text-light-outline tabular-nums">
                      {prop.ownerPhone}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-mono-md text-light-primary tabular-nums whitespace-nowrap">
                    {formatPrice(prop.price)}
                  </td>
                  <td className="py-4 px-4 text-light-on-surface-variant tabular-nums whitespace-nowrap">
                    {prop.beds} bd · {prop.baths} ba · {prop.sqft.toLocaleString('en-IN')} sq ft
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      title="Click to toggle Active / Paused"
                      onClick={() =>
                        updateProperty(prop.id, {
                          availability: prop.availability === 'Active' ? 'Paused' : 'Active',
                        })
                      }
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm transition-opacity hover:opacity-85 ${
                        prop.availability === 'Active'
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {prop.availability}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(prop)}
                        className="px-3 py-1 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-sm hover:bg-light-surface-container"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(prop)}
                        className="px-3 py-1 rounded border border-light-error text-light-error text-label-sm hover:bg-light-error-container"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-light-primary/40 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-light-surface border border-light-outline-variant rounded-md p-6 max-w-lg w-full shadow-lg flex flex-col gap-5 my-8">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-md text-light-on-background">
                {modalMode === 'add' ? 'Add New Property' : 'Edit Property & Owner Details'}
              </h2>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-light-outline hover:text-light-primary"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-title-lg" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-label-sm text-light-on-surface">Property Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="The Sadashivanagar Villa"
                  required
                  className="rounded border border-light-outline-variant px-3 py-2 text-body-md"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Neighborhood</span>
                  <input
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    placeholder="Indiranagar"
                    required
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Indian City</span>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Bangalore, Hyderabad, Mumbai..."
                    required
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Property Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md bg-light-surface"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Modern Home">Modern Home</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Price (INR ₹)</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md tabular-nums"
                  />
                </label>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Beds</span>
                  <input
                    type="number"
                    value={form.beds}
                    onChange={(e) => setForm({ ...form, beds: e.target.value })}
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md tabular-nums"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Baths</span>
                  <input
                    type="number"
                    step="0.5"
                    value={form.baths}
                    onChange={(e) => setForm({ ...form, baths: e.target.value })}
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md tabular-nums"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Sq Ft</span>
                  <input
                    type="number"
                    value={form.sqft}
                    onChange={(e) => setForm({ ...form, sqft: e.target.value })}
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md tabular-nums"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Status</span>
                  <select
                    value={form.availability}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        availability: e.target.value as PropertyAvailability,
                      })
                    }
                    className="rounded border border-light-outline-variant px-2 py-2 text-body-md bg-light-surface"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </label>
              </div>

              {/* Direct Property Owner Details */}
              <div className="border-t border-light-outline-variant pt-3 flex flex-col gap-3">
                <span className="text-label-sm text-accent">
                  Direct Property Owner Contact (Visible to Customers Live)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-label-sm text-light-on-surface">Owner Name</span>
                    <input
                      type="text"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      placeholder="Rajeshwari Nair"
                      required
                      className="rounded border border-light-outline-variant px-3 py-2 text-body-md"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-label-sm text-light-on-surface">Owner Phone</span>
                    <input
                      type="tel"
                      value={form.ownerPhone}
                      onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                      placeholder="+91 98450 22190"
                      required
                      className="rounded border border-light-outline-variant px-3 py-2 text-body-md tabular-nums"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-light-on-surface">Owner Email</span>
                  <input
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    placeholder="owner@propvisit.in"
                    className="rounded border border-light-outline-variant px-3 py-2 text-body-md"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-label-sm text-light-on-surface">Short Summary</span>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Architectural highlights for listing cards..."
                  className="rounded border border-light-outline-variant px-3 py-2 text-body-md"
                />
              </label>

              {formError && (
                <p className="text-body-md bg-light-error-container text-light-on-error-container px-3 py-2 rounded">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-light-primary text-light-on-primary text-label-lg hover:bg-light-secondary"
                >
                  {modalMode === 'add' ? 'Create Property' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-light-primary/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-light-surface border border-light-outline-variant rounded-md p-6 max-w-sm w-full shadow-lg flex flex-col gap-4">
            <h3 className="font-headline text-headline-md text-light-on-background">
              Delete Property?
            </h3>
            <p className="text-body-md text-light-on-surface-variant">
              Remove <span className="font-semibold text-light-on-surface">{deleteTarget.title}</span> from active listings?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded border border-light-outline-variant bg-light-surface text-light-primary text-label-lg"
              >
                Keep Property
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteProperty(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded bg-light-error text-light-on-error text-label-lg hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};
