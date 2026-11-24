import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Booking,
  BookingStatus,
  CustomerProfile,
  OwnerInquiry,
  Property,
  RoutePath,
  TimeSlot,
} from '../types';
import {
  DEFAULT_SLOT_TEMPLATES,
  SEED_BOOKINGS,
  SEED_INQUIRIES,
  SEED_PROPERTIES,
  SEED_TIME_SLOTS,
} from '../data/seedData';

const AUTH_STORAGE_KEY = 'propvisit_auth_v1';

interface AuthState {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  customerProfile: CustomerProfile | null;
}

function loadAuthState(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      return {
        isAdminAuthenticated: Boolean(parsed.isAdminAuthenticated),
        adminEmail: parsed.adminEmail ?? null,
        customerProfile: parsed.customerProfile ?? null,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    isAdminAuthenticated: false,
    adminEmail: null,
    customerProfile: null,
  };
}

interface ServerStorePayload {
  properties: Property[];
  bookings: Booking[];
  timeSlots: TimeSlot[];
  holidays: string[];
  inquiries: OwnerInquiry[];
}

interface PropVisitContextValue {
  route: RoutePath;
  selectedPropertyId: string;
  navigate: (route: RoutePath, options?: { propertyId?: string; scrollToId?: string }) => void;
  properties: Property[];
  bookings: Booking[];
  timeSlots: TimeSlot[];
  holidays: string[];
  inquiries: OwnerInquiry[];
  liveNotice: string | null;
  dismissLiveNotice: () => void;
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  customerProfile: CustomerProfile | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  signInCustomer: (profile: CustomerProfile) => void;
  signOutCustomer: () => void;
  signInAdmin: (email: string) => void;
  signOutAdmin: () => void;
  getSlotsForPropertyDate: (
    propertyId: string,
    date: string
  ) => Array<{
    id: string;
    label: string;
    enabled: boolean;
    bookedByBookingId: string | null;
    isAvailable: boolean;
  }>;
  getOpenSlotCountForProperty: (propertyId: string) => number;
  isDateHoliday: (propertyId: string, date: string) => boolean;
  toggleHoliday: (propertyId: string, date: string) => Promise<void>;
  addTimeSlot: (
    propertyId: string,
    date: string,
    label: string
  ) => Promise<{ ok: boolean; error?: string }>;
  toggleSlotEnabled: (propertyId: string, date: string, label: string) => Promise<void>;
  createBooking: (input: {
    propertyId: string;
    visitDate: string;
    timeSlot: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
  }) => Promise<{ ok: true; booking: Booking } | { ok: false; error: string }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  addProperty: (property: Omit<Property, 'id'>) => Promise<Property | null>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  sendOwnerInquiry: (input: {
    propertyId: string;
    senderName: string;
    senderPhone: string;
    senderEmail: string;
    message: string;
  }) => Promise<{ ok: true; inquiry: OwnerInquiry } | { ok: false; error: string }>;
  respondToInquiry: (inquiryId: string, ownerReply: string) => Promise<void>;
}

const PropVisitContext = createContext<PropVisitContextValue | null>(null);

function parseRouteFromHash(): { route: RoutePath; propertyId?: string } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { route: 'explore' };
  const [pathPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart || '');
  const propId = params.get('property') || undefined;
  const validRoutes: RoutePath[] = [
    'explore',
    'property-details',
    'schedule-visit',
    'my-bookings',
    'admin-signin',
    'admin-dashboard',
    'admin-properties',
    'admin-slots',
  ];
  const matched = validRoutes.includes(pathPart as RoutePath)
    ? (pathPart as RoutePath)
    : 'explore';
  return { route: matched, propertyId: propId };
}

export const PropVisitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<ServerStorePayload>({
    properties: SEED_PROPERTIES,
    bookings: SEED_BOOKINGS,
    timeSlots: SEED_TIME_SLOTS,
    holidays: [],
    inquiries: SEED_INQUIRIES,
  });

  const [auth, setAuth] = useState<AuthState>(loadAuthState);
  const initialHash = parseRouteFromHash();
  const [route, setRoute] = useState<RoutePath>(initialHash.route);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialHash.propertyId || SEED_PROPERTIES[0].id
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const showNotice = (text: string) => {
    setLiveNotice(text);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setLiveNotice(null);
    }, 5000);
  };

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // Ignore storage errors
    }
  }, [auth]);

  // Initial state fetch + real-time WebSocket subscription with auto-reconnect
  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok && !cancelled) {
          const data = (await res.json()) as ServerStorePayload;
          setStore(data);
        }
      } catch {
        // Initial fallback to seed data
      }
    };

    const connectWs = () => {
      if (cancelled) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data) as {
            type: string;
            payload?: ServerStorePayload;
            event?: { kind: string; summary: string };
          };
          if (parsed.type === 'state:sync' && parsed.payload) {
            setStore(parsed.payload);
            if (parsed.event && parsed.event.kind !== 'init' && parsed.event.summary) {
              showNotice(parsed.event.summary);
            }
          }
        } catch {
          // Ignore malformed WS payloads
        }
      };

      ws.onclose = () => {
        if (!cancelled) {
          reconnectTimer = window.setTimeout(connectWs, 2000);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    fetchInitial();
    connectWs();

    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      ws?.close();
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseRouteFromHash();
      setRoute(parsed.route);
      if (parsed.propertyId) {
        setSelectedPropertyId(parsed.propertyId);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (
    nextRoute: RoutePath,
    options?: { propertyId?: string; scrollToId?: string }
  ) => {
    const propId = options?.propertyId || selectedPropertyId;
    if (options?.propertyId) {
      setSelectedPropertyId(options.propertyId);
    }

    let finalRoute = nextRoute;
    if (
      (nextRoute === 'admin-dashboard' ||
        nextRoute === 'admin-properties' ||
        nextRoute === 'admin-slots') &&
      !auth.isAdminAuthenticated
    ) {
      finalRoute = 'admin-signin';
    }

    setRoute(finalRoute);
    const needsPropQuery = finalRoute === 'property-details' || finalRoute === 'schedule-visit';
    const nextHash = needsPropQuery ? `#/${finalRoute}?property=${propId}` : `#/${finalRoute}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }

    if (options?.scrollToId) {
      setTimeout(() => {
        const el = document.getElementById(options.scrollToId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const signInCustomer = (profile: CustomerProfile) => {
    setAuth((prev) => ({ ...prev, customerProfile: profile }));
    setAuthModalOpen(false);
  };

  const signOutCustomer = () => {
    setAuth((prev) => ({ ...prev, customerProfile: null }));
  };

  const signInAdmin = (email: string) => {
    setAuth((prev) => ({
      ...prev,
      isAdminAuthenticated: true,
      adminEmail: email,
    }));
    setRoute('admin-dashboard');
    window.location.hash = '#/admin-dashboard';
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const signOutAdmin = () => {
    setAuth((prev) => ({
      ...prev,
      isAdminAuthenticated: false,
      adminEmail: null,
    }));
    navigate('admin-signin');
  };

  const isDateHoliday = (propertyId: string, date: string): boolean => {
    return store.holidays.includes(`${propertyId}|${date}`);
  };

  const toggleHoliday = async (propertyId: string, date: string) => {
    await fetch('/api/holidays/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, date }),
    });
  };

  const getSlotsForPropertyDate = (propertyId: string, date: string) => {
    const holiday = isDateHoliday(propertyId, date);
    const configured = store.timeSlots.filter(
      (s) => s.propertyId === propertyId && s.date === date
    );

    const baseSlots: TimeSlot[] =
      configured.length > 0
        ? configured
        : DEFAULT_SLOT_TEMPLATES.map((label, idx) => ({
            id: `default-${propertyId}-${date}-${idx}`,
            propertyId,
            date,
            label,
            enabled: true,
          }));

    return baseSlots.map((slot) => {
      const activeBooking = store.bookings.find(
        (b) =>
          b.propertyId === propertyId &&
          b.visitDate === date &&
          b.timeSlot === slot.label &&
          (b.status === 'Pending' || b.status === 'Confirmed')
      );
      return {
        id: slot.id,
        label: slot.label,
        enabled: slot.enabled && !holiday,
        bookedByBookingId: activeBooking ? activeBooking.id : null,
        isAvailable: slot.enabled && !holiday && !activeBooking,
      };
    });
  };

  const getOpenSlotCountForProperty = (propertyId: string): number => {
    const slots = getSlotsForPropertyDate(propertyId, '2026-11-28');
    const openOnNov28 = slots.filter((s) => s.isAvailable).length;
    const extraSlots = store.timeSlots.filter(
      (s) => s.propertyId === propertyId && s.date !== '2026-11-28' && s.enabled
    ).length;
    return openOnNov28 + (extraSlots > 0 ? Math.min(extraSlots, 4) : 2);
  };

  const addTimeSlot = async (
    propertyId: string,
    date: string,
    label: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, date, label }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Could not add time slot.' };
    }
    return { ok: true };
  };

  const toggleSlotEnabled = async (propertyId: string, date: string, label: string) => {
    await fetch('/api/slots/toggle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, date, label }),
    });
  };

  const createBooking = async (input: {
    propertyId: string;
    visitDate: string;
    timeSlot: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
  }): Promise<{ ok: true; booking: Booking } | { ok: false; error: string }> => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Could not create booking.' };
      }
      return { ok: true, booking: data.booking };
    } catch {
      return { ok: false, error: 'Network error while confirming booking.' };
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  const addProperty = async (propertyInput: Omit<Property, 'id'>): Promise<Property | null> => {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyInput),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.property as Property;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    await fetch(`/api/properties/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  };

  const deleteProperty = async (id: string) => {
    await fetch(`/api/properties/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  };

  const sendOwnerInquiry = async (input: {
    propertyId: string;
    senderName: string;
    senderPhone: string;
    senderEmail: string;
    message: string;
  }): Promise<{ ok: true; inquiry: OwnerInquiry } | { ok: false; error: string }> => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Failed to send message.' };
      }
      return { ok: true, inquiry: data.inquiry };
    } catch {
      return { ok: false, error: 'Network error while contacting owner.' };
    }
  };

  const respondToInquiry = async (inquiryId: string, ownerReply: string) => {
    await fetch(`/api/inquiries/${encodeURIComponent(inquiryId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Responded', ownerReply }),
    });
  };

  return (
    <PropVisitContext.Provider
      value={{
        route,
        selectedPropertyId,
        navigate,
        properties: store.properties,
        bookings: store.bookings,
        timeSlots: store.timeSlots,
        holidays: store.holidays,
        inquiries: store.inquiries,
        liveNotice,
        dismissLiveNotice: () => setLiveNotice(null),
        isAdminAuthenticated: auth.isAdminAuthenticated,
        adminEmail: auth.adminEmail,
        customerProfile: auth.customerProfile,
        authModalOpen,
        setAuthModalOpen,
        signInCustomer,
        signOutCustomer,
        signInAdmin,
        signOutAdmin,
        getSlotsForPropertyDate,
        getOpenSlotCountForProperty,
        isDateHoliday,
        toggleHoliday,
        addTimeSlot,
        toggleSlotEnabled,
        createBooking,
        updateBookingStatus,
        addProperty,
        updateProperty,
        deleteProperty,
        sendOwnerInquiry,
        respondToInquiry,
      }}
    >
      {children}
    </PropVisitContext.Provider>
  );
};

export function usePropVisit(): PropVisitContextValue {
  const ctx = useContext(PropVisitContext);
  if (!ctx) {
    throw new Error('usePropVisit must be used inside PropVisitProvider');
  }
  return ctx;
}
