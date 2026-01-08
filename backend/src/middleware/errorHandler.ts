import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  // Handle PostgreSQL errors
  if (err.name === 'PostgresError') {
    const pgError = err as any;
    if (pgError.code === '23505') { // Unique violation
      return res.status(409).json({
        error: {
          message: 'Resource already exists',
          statusCode: 409,
        },
      });
    }
    if (pgError.code === '23503') { // Foreign key violation
      return res.status(400).json({
        error: {
          message: 'Invalid reference',
          statusCode: 400,
        },
      });
    }
  }

  // Default error
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      statusCode: 500,
    },
  });
};

