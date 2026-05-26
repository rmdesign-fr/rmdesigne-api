const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const paypalService = require('../services/paypal.service');
const orderService = require('../services/order.service');

/**
 * POST /api/paypal/create-order
 * Receives cart items, computes total server-side, creates a PayPal order.
 * Returns { id } — the PayPal order ID sent back to the frontend SDK.
 */
exports.createOrder = catchAsync(async (req, res) => {
  const { items } = req.body;

  const total = await orderService.calculateTotal(items);
  const paypalOrder = await paypalService.createPayPalOrder(total);

  res.json({ id: paypalOrder.id });
});

/**
 * POST /api/paypal/capture-order
 * Called after buyer approves on PayPal.
 * Captures the payment then creates the DB order.
 */
exports.captureOrder = catchAsync(async (req, res) => {
  const { paypalOrderId, customerName, customerEmail, shippingAddress, items } =
    req.body;

  const capture = await paypalService.capturePayPalOrder(paypalOrderId);

  if (capture.status !== 'COMPLETED') {
    throw new AppError('Paiement PayPal non complété', 400);
  }

  const order = await orderService.createOrder({
    customerName,
    customerEmail,
    shippingAddress,
    items,
    paymentId: paypalOrderId,
  });

  res.status(201).json(order);
});
