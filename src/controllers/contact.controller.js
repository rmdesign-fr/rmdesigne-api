const prisma = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const emailService = require('../services/email.service');
const AppError = require('../utils/AppError');

exports.createContactMessage = catchAsync(async (req, res) => {
  const { name, phone, email, message } = req.body;

  const contact = await prisma.contactMessage.create({
    data: { name, phone, email, message },
  });

  // Fire-and-forget email notification
  emailService.sendContactNotification(contact).catch(() => {});

  res.status(201).json({ message: 'Message envoyé avec succès' });
});

exports.getAllMessages = catchAsync(async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(messages);
});

exports.deleteMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const message = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!message) {
    throw new AppError('Message introuvable', 404);
  }

  await prisma.contactMessage.delete({
    where: { id },
  });

  res.status(204).send();
});
