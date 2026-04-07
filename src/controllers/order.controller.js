const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
});

exports.getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
});

exports.createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json(order);
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.json(order);
});
