import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import {
  DEFAULT_SLOT_TEMPLATES,
  IMG_KITCHEN,
  IMG_LAUREL,
  IMG_MERCER,
  SEED_BOOKINGS,
  SEED_INQUIRIES,
  SEED_PROPERTIES,
  SEED_TIME_SLOTS,
} from './src/data/seedData.ts';
import type {
  Booking,
  BookingStatus,
  OwnerInquiry,
  Property,
  TimeSlot,
} from './src/types.ts';

interface ServerStore {
  properties: Property[];
  bookings: Booking[];
  timeSlots: TimeSlot[];
  holidays: string[];
  inquiries: OwnerInquiry[];
}

const DB_FILE = path.resolve(process.cwd(), '.propvisit-db.json');

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ServerStore>;
      if (parsed.properties && parsed.bookings && parsed.timeSlots) {
        return {
          properties: parsed.properties,
          bookings: parsed.bookings,
          timeSlots: parsed.timeSlots,
          holidays: parsed.holidays ?? [],
          inquiries: parsed.inquiries ?? SEED_INQUIRIES,
        };
      }
    }
  } catch (err) {
    console.warn('Could not read persisted store, seeding defaults:', err);
  }
  return {
    properties: SEED_PROPERTIES,
    bookings: SEED_BOOKINGS,
    timeSlots: SEED_TIME_SLOTS,
    holidays: [],
    inquiries: SEED_INQUIRIES,
  };
}

let store: ServerStore = loadStore();

function persistStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastSync(eventKind: string, summary: string) {
    const message = JSON.stringify({
      type: 'state:sync',
      event: { kind: eventKind, summary, timestamp: Date.now() },
      payload: store,
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  wss.on('connection', (ws) => {
    ws.send(
      JSON.stringify({
        type: 'state:sync',
        event: { kind: 'init', summary: 'Connected to real-time PropVisit server', timestamp: Date.now() },
        payload: store,
      })
    );
  });

  // --- REST API Routes ---

  app.get('/api/state', (_req, res) => {
    res.json(store);
  });

  app.post('/api/bookings', (req, res) => {
    const {
      propertyId,
      visitDate,
      timeSlot,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = req.body || {};

    const property = store.properties.find((p) => p.id === propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Selected property could not be found.' });
    }
    if (property.availability === 'Paused') {
      return res.status(400).json({ error: 'Visits are currently paused for this property.' });
    }
    if (store.holidays.includes(`${propertyId}|${visitDate}`)) {
      return res.status(400).json({ error: 'Selected date is marked as a holiday.' });
    }

    const configured = store.timeSlots.filter(
      (s) => s.propertyId === propertyId && s.date === visitDate
    );
    const effectiveSlots =
      configured.length > 0
        ? configured
        : DEFAULT_SLOT_TEMPLATES.map((label, idx) => ({
            id: `default-${propertyId}-${visitDate}-${idx}`,
            propertyId,
            date: visitDate,
            label,
            enabled: true,
          }));

    const slotEntry = effectiveSlots.find((s) => s.label === timeSlot);
    if (!slotEntry || !slotEntry.enabled) {
      return res.status(400).json({ error: 'Selected time slot is unavailable.' });
    }

    const alreadyBooked = store.bookings.some(
      (b) =>
        b.propertyId === propertyId &&
        b.visitDate === visitDate &&
        b.timeSlot === timeSlot &&
        (b.status === 'Pending' || b.status === 'Confirmed')
    );
    if (alreadyBooked) {
      return res.status(409).json({
        error: 'This time slot was just booked by another visitor. Please choose another slot.',
      });
    }

    if (!customerName?.trim() || !customerEmail?.includes('@') || !customerPhone?.trim()) {
      return res.status(400).json({ error: 'Valid visitor name, email, and phone are required.' });
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      id: `PV-2026-${randomDigits}`,
      propertyId: property.id,
      propertyTitle: property.title,
      customerName: String(customerName).trim(),
      customerEmail: String(customerEmail).trim(),
      customerPhone: String(customerPhone).trim(),
      visitDate: String(visitDate),
      timeSlot: String(timeSlot),
      requestedDate: new Date().toISOString().slice(0, 10),
      notes: notes ? String(notes).trim() : undefined,
      status: 'Confirmed',
    };

    store.bookings = [newBooking, ...store.bookings];
    persistStore();
    broadcastSync('booking:created', `${newBooking.customerName} booked ${property.title}`);
    return res.status(201).json({ booking: newBooking });
  });

  app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status?: BookingStatus };
    const existing = store.bookings.find((b) => b.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }
    store.bookings = store.bookings.map((b) => (b.id === id ? { ...b, status } : b));
    persistStore();
    broadcastSync('booking:updated', `Booking ${id} marked ${status}`);
    return res.json({ booking: store.bookings.find((b) => b.id === id) });
  });

  app.post('/api/properties', (req, res) => {
    const body = req.body || {};
    if (!body.title?.trim() || !body.city?.trim() || !body.neighborhood?.trim()) {
      return res.status(400).json({ error: 'Title, city, and neighborhood are required.' });
    }
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title: String(body.title).trim(),
      city: String(body.city).trim(),
      neighborhood: String(body.neighborhood).trim(),
      address: body.address?.trim() || `${body.neighborhood.trim()}, ${body.city.trim()}`,
      nearbyNote: body.nearbyNote?.trim() || `${body.neighborhood.trim()} · Private guided walkthroughs`,
      coordinates: body.coordinates?.trim() || '12.9716° N, 77.5946° E',
      type: body.type || 'Villa',
      price: Number(body.price) || 15000000,
      beds: Number(body.beds) || 3,
      baths: Number(body.baths) || 2.5,
      sqft: Number(body.sqft) || 2200,
      shortDescription:
        body.shortDescription?.trim() ||
        'Architectural residence curated for private in-person site visits.',
      fullDescription:
        body.fullDescription?.trim() ||
        body.shortDescription?.trim() ||
        'Thoughtfully designed contemporary residence featuring generous natural light and tailored finishes.',
      availability: body.availability === 'Paused' ? 'Paused' : 'Active',
      ownerName: body.ownerName?.trim() || 'Rajeshwari Nair',
      ownerRole: body.ownerRole?.trim() || 'Direct Property Owner',
      ownerPhone: body.ownerPhone?.trim() || '+91 98450 22190',
      ownerEmail: body.ownerEmail?.trim() || 'owner@propvisit.in',
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : [IMG_LAUREL, IMG_KITCHEN, IMG_MERCER],
      amenities:
        Array.isArray(body.amenities) && body.amenities.length > 0
          ? body.amenities
          : [
              { icon: 'yard', label: 'Private Landscaped Grounds' },
              { icon: 'kitchen', label: "Designer Chef's Kitchen" },
              { icon: 'thermostat', label: 'Zoned Climate Control' },
              { icon: 'directions_car', label: 'Covered Car Parking' },
            ],
    };

    store.properties = [newProperty, ...store.properties];
    persistStore();
    broadcastSync('property:created', `New listing added: ${newProperty.title}`);
    return res.status(201).json({ property: newProperty });
  });

  app.patch('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body || {};
    const existing = store.properties.find((p) => p.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    const updated: Property = { ...existing, ...updates, id };
    store.properties = store.properties.map((p) => (p.id === id ? updated : p));
    if (updates.title) {
      store.bookings = store.bookings.map((b) =>
        b.propertyId === id ? { ...b, propertyTitle: updated.title } : b
      );
      store.inquiries = store.inquiries.map((inq) =>
        inq.propertyId === id ? { ...inq, propertyTitle: updated.title } : inq
      );
    }
    if (updates.ownerName) {
      store.inquiries = store.inquiries.map((inq) =>
        inq.propertyId === id ? { ...inq, ownerName: updated.ownerName } : inq
      );
    }
    persistStore();
    broadcastSync('property:updated', `Updated listing & owner details: ${updated.title}`);
    return res.json({ property: updated });
  });

  app.delete('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    const existing = store.properties.find((p) => p.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    store.properties = store.properties.filter((p) => p.id !== id);
    persistStore();
    broadcastSync('property:deleted', `Removed listing: ${existing.title}`);
    return res.json({ ok: true });
  });

  app.post('/api/slots', (req, res) => {
    const { propertyId, date, label } = req.body || {};
    if (!propertyId || !date || !label) {
      return res.status(400).json({ error: 'propertyId, date, and label are required.' });
    }

    const existingForDate = store.timeSlots.filter(
      (s) => s.propertyId === propertyId && s.date === date
    );
    const effectiveList =
      existingForDate.length > 0
        ? existingForDate
        : DEFAULT_SLOT_TEMPLATES.map((tpl, idx) => ({
            id: `slot-${propertyId}-${date}-${idx}`,
            propertyId,
            date,
            label: tpl,
            enabled: true,
          }));

    if (effectiveList.some((s) => s.label === label)) {
      return res.status(409).json({
        error: 'This time slot already exists for the selected date.',
      });
    }

    const seeded =
      existingForDate.length > 0
        ? store.timeSlots
        : [...store.timeSlots, ...effectiveList];

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      propertyId,
      date,
      label,
      enabled: true,
    };

    store.timeSlots = [...seeded, newSlot];
    persistStore();
    broadcastSync('slot:created', `Added visit slot ${label}`);
    return res.status(201).json({ slot: newSlot });
  });

  app.patch('/api/slots/toggle', (req, res) => {
    const { propertyId, date, label } = req.body || {};
    if (!propertyId || !date || !label) {
      return res.status(400).json({ error: 'propertyId, date, and label are required.' });
    }

    const hasConfigured = store.timeSlots.some(
      (s) => s.propertyId === propertyId && s.date === date
    );
    if (!hasConfigured) {
      store.timeSlots = [
        ...store.timeSlots,
        ...DEFAULT_SLOT_TEMPLATES.map((tpl, idx) => ({
          id: `slot-${propertyId}-${date}-${idx}`,
          propertyId,
          date,
          label: tpl,
          enabled: true,
        })),
      ];
    }

    store.timeSlots = store.timeSlots.map((slot) =>
      slot.propertyId === propertyId && slot.date === date && slot.label === label
        ? { ...slot, enabled: !slot.enabled }
        : slot
    );
    persistStore();
    broadcastSync('slot:toggled', `Updated slot ${label}`);
    return res.json({ ok: true });
  });

  app.post('/api/holidays/toggle', (req, res) => {
    const { propertyId, date } = req.body || {};
    if (!propertyId || !date) {
      return res.status(400).json({ error: 'propertyId and date are required.' });
    }
    const key = `${propertyId}|${date}`;
    const exists = store.holidays.includes(key);
    store.holidays = exists
      ? store.holidays.filter((h) => h !== key)
      : [...store.holidays, key];
    persistStore();
    broadcastSync('holiday:toggled', exists ? `Reopened ${date}` : `Marked ${date} as holiday`);
    return res.json({ holiday: !exists });
  });

  app.post('/api/inquiries', (req, res) => {
    const { propertyId, senderName, senderPhone, senderEmail, message } = req.body || {};
    const property = store.properties.find((p) => p.id === propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    if (!senderName?.trim() || !senderPhone?.trim() || !senderEmail?.includes('@') || !message?.trim()) {
      return res.status(400).json({
        error: 'Please fill in your name, phone number, valid email, and message.',
      });
    }

    const newInquiry: OwnerInquiry = {
      id: `INQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      propertyId: property.id,
      propertyTitle: property.title,
      ownerName: property.ownerName,
      senderName: String(senderName).trim(),
      senderPhone: String(senderPhone).trim(),
      senderEmail: String(senderEmail).trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      status: 'New',
    };

    store.inquiries = [newInquiry, ...store.inquiries];
    persistStore();
    broadcastSync(
      'inquiry:created',
      `Direct message from ${newInquiry.senderName} to ${property.ownerName}`
    );
    return res.status(201).json({ inquiry: newInquiry });
  });

  app.patch('/api/inquiries/:id', (req, res) => {
    const { id } = req.params;
    const { status, ownerReply } = req.body || {};
    const existing = store.inquiries.find((i) => i.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    store.inquiries = store.inquiries.map((i) =>
      i.id === id
        ? {
            ...i,
            status: status || 'Responded',
            ownerReply: ownerReply !== undefined ? String(ownerReply).trim() : i.ownerReply,
          }
        : i
    );
    persistStore();
    broadcastSync('inquiry:updated', `Owner replied to inquiry ${id}`);
    return res.json({ inquiry: store.inquiries.find((i) => i.id === id) });
  });

  // --- Vite / Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PropVisit real-time server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PropVisit server:', err);
  process.exit(1);
});
