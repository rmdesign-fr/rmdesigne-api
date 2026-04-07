const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const auth = async (req, _res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new AppError('Non authentifié', 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      throw new AppError('Non authentifié', 401);
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Non authentifié', 401));
  }
};

module.exports = auth;
