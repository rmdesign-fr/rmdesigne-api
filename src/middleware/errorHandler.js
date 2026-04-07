const { ZodError } = require('zod');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error({ err, method: req.method, url: req.url });

  // AppError (our custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      message: 'Données invalides',
      errors,
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Resource already exists',
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Resource not found',
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Fichier trop volumineux (max 5MB)',
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Trop de fichiers (max 5)',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token invalide' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expiré' });
  }

  // Fallback
  return res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
