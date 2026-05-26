const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');

async function login(email, password, ipAddress, userAgent) {
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      // Log failed attempt
      await prisma.loginLog.create({
        data: {
          email,
          success: false,
          ipAddress,
          userAgent,
          errorMsg: 'Email ou mot de passe incorrect',
          timestamp: new Date(),
        },
      });
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Log failed attempt
      await prisma.loginLog.create({
        data: {
          email,
          success: false,
          ipAddress,
          userAgent,
          errorMsg: 'Email ou mot de passe incorrect',
          timestamp: new Date(),
        },
      });
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const token = jwt.sign({ id: admin.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Log successful login
    await prisma.loginLog.create({
      data: {
        email,
        success: true,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      },
    });

    return {
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Erreur lors de la connexion', 500);
  }
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

async function getLoginLogs(limit = 50, offset = 0) {
  const logs = await prisma.loginLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
  });
  
  const total = await prisma.loginLog.count();
  
  return { logs, total };
}

module.exports = { login, getMe, getLoginLogs };
