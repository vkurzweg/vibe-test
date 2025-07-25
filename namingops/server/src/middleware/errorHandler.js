import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err.stack);

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    success,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export class ApiError extends Error {
  statusCode;
  isOperational;

  constructor(
    statusCode,
    message,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};
