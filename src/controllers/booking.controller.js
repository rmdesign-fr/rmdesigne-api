const catchAsync = require('../utils/catchAsync');
const bookingService = require('../services/booking.service');
const emailService = require('../services/email.service');

exports.getAvailableSlots = catchAsync(async (req, res) => {
  const result = await bookingService.getAvailableSlots(req.query.date);
  res.json(result);
});

exports.createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);

  // Fire-and-forget emails
  emailService.sendBookingConfirmation(booking).catch(() => {});
  emailService.sendBookingNotificationToAdmin(booking).catch(() => {});

  res.status(201).json(booking);
});

exports.getAllBookings = catchAsync(async (_req, res) => {
  const bookings = await bookingService.getAllBookings();
  res.json(bookings);
});

exports.updateStatus = catchAsync(async (req, res) => {
  const booking = await bookingService.updateStatus(req.params.id, req.body.status);

  // Send email on confirmation
  if (req.body.status === 'confirmed') {
    emailService.sendBookingStatusUpdate({ ...booking, status: 'confirmed' }).catch(() => {});
  }
  if (req.body.status === 'cancelled') {
    emailService.sendBookingStatusUpdate({ ...booking, status: 'cancelled' }).catch(() => {});
  }

  res.json(booking);
});

exports.deleteBooking = catchAsync(async (req, res) => {
  const result = await bookingService.deleteBooking(req.params.id);
  res.json(result);
});

exports.blockSlot = catchAsync(async (req, res) => {
  const booking = await bookingService.blockSlot(req.body.date, req.body.time);
  res.status(201).json(booking);
});
