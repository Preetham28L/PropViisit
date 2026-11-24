import type { Booking, OwnerInquiry, Property, TimeSlot } from '../types.ts';

export const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida/ALJJyrCPuFOWyJC7-SDLPxUBlYPc3ZapHgd1kzn_NAN_4u7OCAYMKZR-O-SYOLLYya7n6crVzuK0phzaC5-5rr4NKE0-J9ZZgsK7ZEog0jp1maNNXx0O5j1ylIlaVHpm7vq2kXAg0Qo0o-jwdIRkj2d7yo-f8FRBlRqlZuhPowoPln83Z01lq0tGW07s0fnWPErroTat-QWhw-CqpJNbEf18hx1_UPoOIVVXjqV9gsNFD5MaJ0ULcDsArFFT';

export const IMG_LAUREL =
  'https://lh3.googleusercontent.com/aida/ALJJyrC7TLtFQmDIWSBcVHMGsDSNsOICdPwIDcBx6yFy6CtFXp5VhinInJr3d0moNltr1dFyARWmLAgiEr1qh1rGy5yC6zxVFWxzOddjZHHYT4eKs3VlWFgacSz-jEXlmr8Ih9b13RBJEx3g3Zh1mkOleR3JQ6RP8_oz-SY7rdb2c9NZf7fEA0eYZUmUPrSi0QNtVYAZ4G9U5VXSgZl3k3xzesB-uQqw3OmMyxQ_Joe0sEzDUyMjI_g';

export const IMG_MERCER =
  'https://lh3.googleusercontent.com/aida/ALJJyrA1zn4UYLM7R8bsM7VGodjW4QfcSm29GS-_K6QRHVFirnj1ei8_HXs3SMD0w4tNoLl9onVZqc1Y7hblRhWitMGLn6z8bB3lAcrBY_fdK90bHzHxll_0kDncGAKDHYqm9xdRdX5kk8gikMNwExcv-7Hga6kKlmjpyUJB5POzNaYdeyH1A6NQ3AF1btv2NFwOqwVrgLTK3Tt4QHo2RXpt1BR58UGSi0bzFzNUfnRbeCCKZpKRBHs';

export const IMG_HARBOR =
  'https://lh3.googleusercontent.com/aida/ALJJyrDOLM64MR8DEs9iGzD2E5bdQHUEzIGK3979lYKsVp9CeNtzgI3-wj0zo3poew7yUHLK-ossuVgx7zINFkdR097XPT-T7GXW8igLsKK-xY5N7YTvIOmLQ5a5D8Gg_me4osle368u6DUHbTTbV6HrEeshPd_bdi68RP-5KalmT0UhUIpmVG7LzIR_SZcxhqhyHUMPJEA-mamYo5FPjs6WuFNiY51UbOpReOkPlzGCxMFqfYutPw';

export const IMG_OAKRIDGE =
  'https://lh3.googleusercontent.com/aida/ALJJyrDPD3UZRKKZLpULDBzockGc-DS3JbvICRhmWISYh7r33OUF1106OL4ZudDmxpk7trlTPHYvV3XRqctS_r_dlFFBzsMFKXSVL-tGsob5t9ZZvn4MYKXz93ncW9BU4k4wHmKUof1ZMtSo8C6o4fHK3wVaBW0bRMLImCsvIfM8OIz80UhbqLPzYTe7nXf4zk7ILZ0ytl4Rp3UroZxDxLIP81BBsWN1c-9HdzGuH3EcZCsrcPD7Y6K3';

export const IMG_KITCHEN =
  'https://lh3.googleusercontent.com/aida/ALJJyrBpK-8Q6QhrHGFD7Ux1Ekwwg1rfJkudn4pwHU37V5xwZ8R8i8si829EJPwYtSBHYcqjp0XBowdM2RHATuLcoDX4QtIr1WlinW6fsnEyJYcUMVAh71zIL1_tPyQGYSgq1IwFJAHXSbqH7-VRwTdIUMKEE8POWeYk35E1aZb_h9aKJYTjkocoa1YuzuW-ccvfFidHcoNhJeQI1rIY_LKdZbkegeseGuRp5f5HvM5JIoPLnUJQFp41cDEtjajK7KFEVw';

export const SEED_PROPERTIES: Property[] = [
  {
    id: 'prop-laurel',
    title: 'The Indiranagar Villa',
    city: 'Bangalore',
    neighborhood: 'Indiranagar',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    nearbyNote: '100 Feet Road · 6 min walk to Indiranagar Metro Station',
    coordinates: '12.9784° N, 77.6408° E',
    type: 'Villa',
    price: 24500000,
    beds: 4,
    baths: 3.5,
    sqft: 2840,
    shortDescription:
      "Sunlit contemporary residence featuring Burma teak framing, chef's kitchen, and a private courtyard garden.",
    fullDescription:
      'Designed around a sheltered rainwater courtyard in the heart of Indiranagar, this residence pairs quiet architectural proportions with cross-ventilated daylight. Double-height living spaces open directly onto Kota stone verandas, while the upper level houses four private bedroom suites and a sunlit study.',
    availability: 'Active',
    ownerName: 'Rajeshwari Nair',
    ownerRole: 'Direct Property Owner',
    ownerPhone: '+91 98450 22190',
    ownerEmail: 'rajeshwari.nair@propvisit.in',
    images: [IMG_LAUREL, IMG_KITCHEN, IMG_MERCER],
    amenities: [
      { icon: 'yard', label: 'Private Landscaped Courtyard' },
      { icon: 'ev_station', label: '2-Car Covered Porch with EV Point' },
      { icon: 'kitchen', label: "Honed Italian Marble Chef's Kitchen" },
      { icon: 'solar_power', label: 'Solar Water & Backup Inverter' },
    ],
  },
  {
    id: 'prop-mercer',
    title: 'Jubilee Sky Penthouse',
    city: 'Hyderabad',
    neighborhood: 'Jubilee Hills',
    address: 'Road No. 45, Jubilee Hills, Hyderabad, Telangana 500033',
    nearbyNote: 'Road No. 45 · 4 min walk to KBR National Park',
    coordinates: '17.4319° N, 78.4071° E',
    type: 'Penthouse',
    price: 19500000,
    beds: 3,
    baths: 2.5,
    sqft: 2120,
    shortDescription:
      'Corner sky residence overlooking KBR canopy with wide-plank oak floors and private lift lobby access.',
    fullDescription:
      'Commanding uninterrupted views across the Jubilee Hills canopy and Durgam Cheruvu skyline, Jubilee Sky Penthouse occupies the entire south-west corner of the top floor. Custom teak millwork, acoustic glazing, and a wrap-around sunset deck define a calm urban sanctuary.',
    availability: 'Active',
    ownerName: 'Vikramaditya Rao',
    ownerRole: 'Direct Property Owner',
    ownerPhone: '+91 98490 77312',
    ownerEmail: 'vikram.rao@propvisit.in',
    images: [IMG_MERCER, IMG_KITCHEN, HERO_IMAGE],
    amenities: [
      { icon: 'elevator', label: 'Keyed Private Lift Lobby' },
      { icon: 'balcony', label: 'Wrap-Around Sunset Terrace' },
      { icon: 'kitchen', label: 'Integrated Modular Kitchen' },
      { icon: 'ac_unit', label: 'VRV Zoned Central Air Conditioning' },
    ],
  },
  {
    id: 'prop-harbor',
    title: 'Pali Hill Courtyard Townhouse',
    city: 'Mumbai',
    neighborhood: 'Bandra West',
    address: '14 Pali Hill, Bandra West, Mumbai, Maharashtra 400050',
    nearbyNote: 'Pali Hill · 5 min walk to Carter Road Promenade',
    coordinates: '19.0607° N, 72.8295° E',
    type: 'Townhouse',
    price: 32000000,
    beds: 3,
    baths: 3,
    sqft: 2410,
    shortDescription:
      'Sea-breeze limestone townhouse featuring a private rooftop terrace, study mezzanine, and two-car parking.',
    fullDescription:
      'Crafted in warm Jaisalmer limestone and brushed brass, Pali Hill Courtyard Townhouse balances coastal breeze with structured three-level living. The top floor opens onto an outdoor entertaining deck overlooking lush banyan canopies.',
    availability: 'Active',
    ownerName: 'Siddharth Kulkarni',
    ownerRole: 'Direct Property Owner',
    ownerPhone: '+91 98201 54088',
    ownerEmail: 'siddharth.k@propvisit.in',
    images: [IMG_HARBOR, IMG_KITCHEN, IMG_LAUREL],
    amenities: [
      { icon: 'deck', label: 'Private Rooftop Sea-Breeze Deck' },
      { icon: 'thermostat', label: 'Automated Climate & Lighting' },
      { icon: 'directions_car', label: 'Covered Two-Car Parking' },
      { icon: 'security', label: '24/7 Gated Perimeter Security' },
    ],
  },
  {
    id: 'prop-oakridge',
    title: 'Koregaon Park Pavilion',
    city: 'Pune',
    neighborhood: 'Koregaon Park',
    address: 'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
    nearbyNote: 'Lane 7 · 7 min walk to Osho Teerth Park',
    coordinates: '18.5362° N, 73.8940° E',
    type: 'Modern Home',
    price: 14500000,
    beds: 4,
    baths: 3,
    sqft: 2690,
    shortDescription:
      'Mid-century concrete and timber home shaded by heritage rain trees with a detached guest studio.',
    fullDescription:
      'Set beneath a canopy of mature rain trees in Koregaon Park, this pavilion extends horizontally across a landscaped plot. Architectural board-formed concrete walls frame seamless views of the lap pool court and a detached guest studio.',
    availability: 'Active',
    ownerName: 'Ananya Deshmukh',
    ownerRole: 'Direct Property Owner',
    ownerPhone: '+91 98220 61945',
    ownerEmail: 'ananya.deshmukh@propvisit.in',
    images: [IMG_OAKRIDGE, IMG_KITCHEN, HERO_IMAGE],
    amenities: [
      { icon: 'pool', label: 'Lap Pool & Limestone Patio' },
      { icon: 'cottage', label: 'Detached Teak Guest Studio' },
      { icon: 'solar_power', label: 'Rooftop Solar & Rainwater Harvesting' },
      { icon: 'park', label: 'Mature Rain Tree Garden' },
    ],
  },
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'PV-2026-8419',
    propertyId: 'prop-laurel',
    propertyTitle: 'The Indiranagar Villa',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@bengaluru.in',
    customerPhone: '+91 98451 10924',
    visitDate: '2026-11-28',
    timeSlot: '09:30 AM – 10:15 AM',
    requestedDate: '2026-11-24',
    notes: 'Interested in inspecting the courtyard rainwater system and kitchen finishes.',
    status: 'Confirmed',
  },
  {
    id: 'PV-2026-7902',
    propertyId: 'prop-mercer',
    propertyTitle: 'Jubilee Sky Penthouse',
    customerName: 'Meera Krishnan',
    customerEmail: 'meera.krishnan@hyderabad.co.in',
    customerPhone: '+91 98492 33410',
    visitDate: '2026-12-02',
    timeSlot: '03:00 PM – 03:45 PM',
    requestedDate: '2026-11-23',
    notes: 'Looking for late-afternoon sunlight angle from the terrace.',
    status: 'Pending',
  },
  {
    id: 'PV-2026-6514',
    propertyId: 'prop-harbor',
    propertyTitle: 'Pali Hill Courtyard Townhouse',
    customerName: 'Rohan Deshpande',
    customerEmail: 'rohan.d@mumbaicapital.in',
    customerPhone: '+91 98204 88123',
    visitDate: '2026-11-18',
    timeSlot: '11:00 AM – 11:45 AM',
    requestedDate: '2026-11-12',
    status: 'Completed',
  },
  {
    id: 'PV-2026-8105',
    propertyId: 'prop-oakridge',
    propertyTitle: 'Koregaon Park Pavilion',
    customerName: 'Divya Subramanian',
    customerEmail: 'divya.s@punestudio.in',
    customerPhone: '+91 98224 77611',
    visitDate: '2026-11-29',
    timeSlot: '11:00 AM – 11:45 AM',
    requestedDate: '2026-11-24',
    status: 'Pending',
  },
];

export const SEED_INQUIRIES: OwnerInquiry[] = [
  {
    id: 'INQ-2026-401',
    propertyId: 'prop-laurel',
    propertyTitle: 'The Indiranagar Villa',
    ownerName: 'Rajeshwari Nair',
    senderName: 'Karthik Reddy',
    senderPhone: '+91 99001 44521',
    senderEmail: 'karthik.reddy@techblr.in',
    message: 'Is the Indiranagar property available for immediate registration and bank loan processing?',
    createdAt: '2026-11-24T05:15:00Z',
    status: 'New',
  },
];

export const DEFAULT_SLOT_TEMPLATES = [
  '09:30 AM – 10:15 AM',
  '11:00 AM – 11:45 AM',
  '01:30 PM – 02:15 PM',
  '03:00 PM – 03:45 PM',
];

export const SEED_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-laurel-1', propertyId: 'prop-laurel', date: '2026-11-28', label: '09:30 AM – 10:15 AM', enabled: true },
  { id: 'slot-laurel-2', propertyId: 'prop-laurel', date: '2026-11-28', label: '11:00 AM – 11:45 AM', enabled: true },
  { id: 'slot-laurel-3', propertyId: 'prop-laurel', date: '2026-11-28', label: '01:30 PM – 02:15 PM', enabled: false },
  { id: 'slot-laurel-4', propertyId: 'prop-laurel', date: '2026-11-28', label: '03:00 PM – 03:45 PM', enabled: true },

  { id: 'slot-mercer-1', propertyId: 'prop-mercer', date: '2026-12-02', label: '09:30 AM – 10:15 AM', enabled: true },
  { id: 'slot-mercer-2', propertyId: 'prop-mercer', date: '2026-12-02', label: '11:00 AM – 11:45 AM', enabled: true },
  { id: 'slot-mercer-3', propertyId: 'prop-mercer', date: '2026-12-02', label: '01:30 PM – 02:15 PM', enabled: true },
  { id: 'slot-mercer-4', propertyId: 'prop-mercer', date: '2026-12-02', label: '03:00 PM – 03:45 PM', enabled: true },

  { id: 'slot-oak-1', propertyId: 'prop-oakridge', date: '2026-11-29', label: '09:30 AM – 10:15 AM', enabled: true },
  { id: 'slot-oak-2', propertyId: 'prop-oakridge', date: '2026-11-29', label: '11:00 AM – 11:45 AM', enabled: true },
  { id: 'slot-oak-3', propertyId: 'prop-oakridge', date: '2026-11-29', label: '01:30 PM – 02:15 PM', enabled: true },
  { id: 'slot-oak-4', propertyId: 'prop-oakridge', date: '2026-11-29', label: '03:00 PM – 03:45 PM', enabled: true },
];
