const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');

async function login(email, password) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const token = jwt.sign({ id: admin.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
}

async function getMe(adminId) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true },
  });

  if (!admin) {
    throw new AppError('Admin not found', 401);
  }

  return admin;
}

module.exports = { login, getMe };
