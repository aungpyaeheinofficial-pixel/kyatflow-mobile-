
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    // Assuming authenticateToken has already run and populated req.user
    if (!req.user) {
        return next(new AppError('Authentication required', 401));
    }

    // Check if admin email matches. In production, check role from DB or token payload if you add it.
    const ADMIN_EMAILS = ['admin@kyatflow.com'];

    if (!ADMIN_EMAILS.includes(req.user.email)) {
        return next(new AppError('Access Denied: Admin privileges required', 403));
    }

    next();
};
