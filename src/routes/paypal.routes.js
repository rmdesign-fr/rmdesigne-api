const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const paypalController = require('../controllers/paypal.controller');

const router = Router();

const itemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      qty: z.number().int().min(1),
    })
  )
  .min(1);

const createOrderSchema = z.object({ items: itemsSchema });

const captureOrderSchema = z.object({
  paypalOrderId: z.string().min(1),
  customerName: z.string().min(2).max(200).trim(),
  customerEmail: z.string().email().trim(),
  items: itemsSchema,
  shippingAddress: z.object({
    line1: z.string().min(2).max(500).trim(),
    city: z.string().min(2).max(200).trim(),
    postalCode: z.string().min(2).max(20).trim(),
    country: z.string().length(2).default('FR'),
  }),
});

router.post('/create-order', validate(createOrderSchema), paypalController.createOrder);
router.post('/capture-order', validate(captureOrderSchema), paypalController.captureOrder);

module.exports = router;
