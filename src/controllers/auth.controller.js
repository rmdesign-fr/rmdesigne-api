const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const env = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  // Get IP address and user agent
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  const { token, admin } = await authService.login(email, password, ipAddress, userAgent);

  res.cookie('token', token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ admin });
});

exports.logout = (_req, res) => {
  res.cookie('token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ message: 'Déconnecté' });
};

exports.getMe = catchAsync(async (req, res) => {
  const admin = await authService.getMe(req.admin.id);
  res.json({ admin });
});

exports.getLoginLogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const { logs, total } = await authService.getLoginLogs(limit, offset);
  
  res.json({ 
    logs, 
    total,
    limit,
    offset,
    hasMore: offset + limit < total
  });
});
