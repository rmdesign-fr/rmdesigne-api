const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');

const optionalAuth = async (req, _res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      req.admin = null;
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    req.admin = admin || null;
    next();
  } catch {
    req.admin = null;
    next();
  }
};

module.exports = optionalAuth;
