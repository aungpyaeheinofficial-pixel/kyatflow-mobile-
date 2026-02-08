import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  const authHeader = authReq.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  const jwtSecret: string = (process.env.JWT_SECRET || 'your-secret-key-change-in-production') as string;

  jwt.verify(token, jwtSecret, (err, decoded: any) => {
    if (err) {
      return next(new AppError('Invalid or expired token', 401));
    }

    authReq.userId = decoded.userId;
    authReq.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  });
};

