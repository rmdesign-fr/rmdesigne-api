const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const {
  ALL_SLOTS,
  WORKING_DAYS,
  SERVICE_MAP,
  SERVICE_MAP_REVERSE,
  BOOKING_STATUS_MAP,
  BOOKING_STATUS_REVERSE,
  BOOKING_STATUS_TRANSITIONS,
} = require('../utils/constants');

function serializeBooking(booking) {
  return {
    id: booking.id,
    date: booking.date.toISOString().split('T')[0],
    time: booking.time,
    name: booking.name,
    email: booking.email,
    phone: booking.phone || '',
    service: SERVICE_MAP_REVERSE[booking.service],
    description: booking.description || '',
    status: BOOKING_STATUS_REVERSE[booking.status],
    createdAt: booking.createdAt.toISOString(),
  };
}

async function getAvailableSlots(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) {
    throw new AppError('Date invalide', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    throw new AppError('La date ne peut pas être dans le passé', 400);
  }

  const dayOfWeek = date.getDay();
  if (!WORKING_DAYS.includes(dayOfWeek)) {
    throw new AppError('Ce jour n\'est pas un jour ouvrable', 400);
  }

  const bookings = await prisma.booking.findMany({
    where: {
      date,
      status: { not: 'CANCELLED' },
    },
    select: { time: true },
  });

  const booked = new Set(bookings.map((b) => b.time));
  let available = ALL_SLOTS.filter((slot) => !booked.has(slot));

  // If today, remove past slots
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    const currentHour = now.getHours();
    available = available.filter((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      return hour > currentHour;
    });
  }

  return { slots: available };
}

async function createBooking(data) {
  const date = new Date(data.date + 'T00:00:00');
  if (isNaN(date.getTime())) {
    throw new AppError('Date invalide', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    throw new AppError('La date ne peut pas être dans le passé', 400);
  }

  if (!WORKING_DAYS.includes(date.getDay())) {
    throw new AppError('Ce jour n\'est pas un jour ouvrable', 400);
  }

  const serviceEnum = SERVICE_MAP[data.service];
  if (!serviceEnum) {
    throw new AppError('Service invalide', 400);
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        date,
        time: data.time,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        service: serviceEnum,
        description: data.description || null,
        status: 'PENDING',
      },
    });
    return serializeBooking(booking);
  } catch (err) {
    if (err.code === 'P2002') {
      // Unique constraint on (date, time) — check if cancelled
      const existing = await prisma.booking.findFirst({
        where: { date, time: data.time },
      });
      if (existing && existing.status === 'CANCELLED') {
        await prisma.booking.delete({ where: { id: existing.id } });
        // Retry create
        const booking = await prisma.booking.create({
          data: {
            date,
            time: data.time,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            service: serviceEnum,
            description: data.description || null,
            status: 'PENDING',
          },
        });
        return serializeBooking(booking);
      }
      throw new AppError('Ce créneau est déjà réservé', 409);
    }
    throw err;
  }
}

async function getAllBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
  });
  return bookings.map(serializeBooking);
}

async function updateStatus(id, status) {
  const newStatusEnum = BOOKING_STATUS_MAP[status];
  if (!newStatusEnum) {
    throw new AppError('Statut invalide', 400);
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new AppError('Réservation introuvable', 404);
  }

  const allowed = BOOKING_STATUS_TRANSITIONS[booking.status];
  if (!allowed || !allowed.includes(newStatusEnum)) {
    throw new AppError('Transition de statut invalide', 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: newStatusEnum },
  });

  return serializeBooking(updated);
}

async function deleteBooking(id) {
  await prisma.booking.delete({ where: { id } });
  return { message: 'Supprimé' };
}

async function blockSlot(date, time) {
  const dateObj = new Date(date + 'T00:00:00');
  try {
    const booking = await prisma.booking.create({
      data: {
        date: dateObj,
        time,
        name: 'BLOQUÉ',
        email: 'blocked@system',
        service: 'AUTRE',
        status: 'CONFIRMED',
      },
    });
    return serializeBooking(booking);
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('Ce créneau est déjà réservé ou bloqué', 409);
    }
    throw err;
  }
}

module.exports = {
  getAvailableSlots,
  createBooking,
  getAllBookings,
  updateStatus,
  deleteBooking,
  blockSlot,
};
