export type PropertyType = 'Villa' | 'Penthouse' | 'Townhouse' | 'Modern Home';

export type PropertyAvailability = 'Active' | 'Paused';

export interface PropertyAmenity {
  icon: string;
  label: string;
}

export interface Property {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  address: string;
  nearbyNote: string;
  coordinates: string;
  type: PropertyType;
  price: number; // Stored in Indian Rupees (INR)
  beds: number;
  baths: number;
  sqft: number;
  shortDescription: string;
  fullDescription: string;
  availability: PropertyAvailability;
  ownerName: string;
  ownerRole: string;
  ownerPhone: string;
  ownerEmail: string;
  images: string[];
  amenities: PropertyAmenity[];
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected';

export interface Booking {
  id: string; // e.g. PV-2026-8419
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  visitDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM – 10:15 AM"
  requestedDate: string; // YYYY-MM-DD
  notes?: string;
  status: BookingStatus;
}

export interface TimeSlot {
  id: string;
  propertyId: string;
  date: string; // YYYY-MM-DD
  label: string; // e.g. "09:30 AM – 10:15 AM"
  enabled: boolean;
}

export interface OwnerInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  status: 'New' | 'Responded';
  ownerReply?: string;
}

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
}

export type RoutePath =
  | 'explore'
  | 'property-details'
  | 'schedule-visit'
  | 'my-bookings'
  | 'admin-signin'
  | 'admin-dashboard'
  | 'admin-properties'
  | 'admin-slots';
