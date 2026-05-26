const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { ORDER_STATUS_MAP, ORDER_STATUS_REVERSE, ORDER_STATUS_TRANSITIONS } = require('../utils/constants');

function serializeOrder(order) {
  return {
    ...order,
    total: Number(order.total),
    status: ORDER_STATUS_REVERSE[order.status] || order.status,
    items: order.items?.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

async function getAllOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(serializeOrder);
}

async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw new AppError('Commande introuvable', 404);
  return serializeOrder(order);
}

async function calculateTotal(items) {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== items.length) {
    throw new AppError('Un ou plusieurs produits sont introuvables ou inactifs', 400);
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  let total = 0;
  for (const item of items) {
    total += Number(productMap[item.productId].price) * item.qty;
  }
  return total;
}

async function createOrder(data) {
  // Validate products and compute total
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== data.items.length) {
    throw new AppError('Un ou plusieurs produits sont introuvables ou inactifs', 400);
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  let total = 0;

  const orderItems = data.items.map((item) => {
    const product = productMap[item.productId];
    if (product.stock < item.qty) {
      throw new AppError(`Stock insuffisant pour ${product.name}`, 400);
    }
    const lineTotal = Number(product.price) * item.qty;
    total += lineTotal;
    return {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      qty: item.qty,
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    return tx.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        shippingLine1: data.shippingAddress.line1,
        shippingCity: data.shippingAddress.city,
        shippingPostalCode: data.shippingAddress.postalCode,
        shippingCountry: data.shippingAddress.country || 'FR',
        total,
        stripePaymentId: data.paymentId || null,
        items: { create: orderItems },
      },
      include: { items: true },
    });
  });

  return serializeOrder(order);
}

async function updateOrderStatus(id, newStatusKey) {
  const dbStatus = ORDER_STATUS_MAP[newStatusKey];
  if (!dbStatus) throw new AppError('Statut invalide', 400);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError('Commande introuvable', 404);

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(dbStatus)) {
    throw new AppError(
      `Transition ${ORDER_STATUS_REVERSE[order.status]} → ${newStatusKey} non autorisée`,
      400
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: dbStatus },
    include: { items: true },
  });

  return serializeOrder(updated);
}

module.exports = {
  getAllOrders,
  getOrderById,
  calculateTotal,
  createOrder,
  updateOrderStatus,
};
