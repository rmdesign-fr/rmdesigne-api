const { Router } = require('express');
const { z } = require('zod');
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = Router();

const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
});

const createBookingSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim(),
  phone: z.string().max(20).trim().optional().or(z.literal('')),
  service: z.enum([
    'Préparation moteur',
    'Sablage / Microbillage',
    'Peinture automobile',
    'Restauration',
    'Autre',
  ]),
  description: z.string().max(2000).trim().optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

const blockSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

router.get('/available', validate(dateQuerySchema, 'query'), bookingController.getAvailableSlots);
router.post('/', bookingLimiter, validate(createBookingSchema), bookingController.createBooking);
router.get('/', auth, bookingController.getAllBookings);
router.put('/:id/status', auth, validate(updateStatusSchema), bookingController.updateStatus);
router.delete('/:id', auth, bookingController.deleteBooking);
router.post('/block', auth, validate(blockSlotSchema), bookingController.blockSlot);

module.exports = router;
