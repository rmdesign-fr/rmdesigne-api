const { Router } = require('express');
const { z } = require('zod');
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

const createOrderSchema = z.object({
  customerName: z.string().min(2).max(200).trim(),
  customerEmail: z.string().email().trim(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1),
      })
    )
    .min(1),
  shippingAddress: z.object({
    line1: z.string().min(2).max(500).trim(),
    city: z.string().min(2).max(200).trim(),
    postalCode: z.string().min(2).max(20).trim(),
    country: z.string().length(2).default('FR'),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered']),
});

router.get('/', auth, orderController.getAllOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.put('/:id/status', auth, validate(updateStatusSchema), orderController.updateOrderStatus);

module.exports = router;
