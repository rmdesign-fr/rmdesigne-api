const env = require('../config/env');

// ─── Dynamic slot generation ─────────────────────────────
function generateSlots(startHour, endHour, intervalMinutes) {
  const slots = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      if (h === endHour && m > 0) break;
      slots.push(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      );
    }
  }
  return slots;
}

const ALL_SLOTS = generateSlots(
  env.BOOKING_SLOT_START,
  env.BOOKING_SLOT_END,
  env.BOOKING_SLOT_INTERVAL
);

const WORKING_DAYS = env.BOOKING_WORKING_DAYS.split(',').map(Number);

// ─── Service enum mapping ────────────────────────────────
const SERVICE_MAP = {
  'Préparation moteur': 'PREPARATION_MOTEUR',
  'Sablage / Microbillage': 'SABLAGE_MICROBILLAGE',
  'Peinture automobile': 'PEINTURE_AUTOMOBILE',
  'Restauration': 'RESTAURATION',
  'Autre': 'AUTRE',
};

const SERVICE_MAP_REVERSE = Object.fromEntries(
  Object.entries(SERVICE_MAP).map(([k, v]) => [v, k])
);

// ─── Category enum mapping ───────────────────────────────
const CATEGORY_MAP = {
  vetements: 'VETEMENTS',
  accessoires: 'ACCESSOIRES',
  stickers: 'STICKERS',
  lifestyle: 'LIFESTYLE',
};

const CATEGORY_MAP_REVERSE = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);

// ─── Booking status mapping ──────────────────────────────
const BOOKING_STATUS_MAP = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
};

const BOOKING_STATUS_REVERSE = Object.fromEntries(
  Object.entries(BOOKING_STATUS_MAP).map(([k, v]) => [v, k])
);

// ─── Order status mapping ────────────────────────────────
const ORDER_STATUS_MAP = {
  pending: 'PENDING',
  paid: 'PAID',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
};

const ORDER_STATUS_REVERSE = Object.fromEntries(
  Object.entries(ORDER_STATUS_MAP).map(([k, v]) => [v, k])
);

// ─── Status transition rules ─────────────────────────────
const BOOKING_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: [],
};

const ORDER_STATUS_TRANSITIONS = {
  PENDING: ['PAID'],
  PAID: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
};

module.exports = {
  ALL_SLOTS,
  WORKING_DAYS,
  SERVICE_MAP,
  SERVICE_MAP_REVERSE,
  CATEGORY_MAP,
  CATEGORY_MAP_REVERSE,
  BOOKING_STATUS_MAP,
  BOOKING_STATUS_REVERSE,
  ORDER_STATUS_MAP,
  ORDER_STATUS_REVERSE,
  BOOKING_STATUS_TRANSITIONS,
  ORDER_STATUS_TRANSITIONS,
};
