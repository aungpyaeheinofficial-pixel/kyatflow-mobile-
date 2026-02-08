
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authReq = req as AuthRequest;
    // Assuming authenticateToken has already run and populated req.user
    if (!authReq.user) {
        return next(new AppError('Authentication required', 401));
    }

    // Check if admin email matches. In production, check role from DB or token payload if you add it.
    const ADMIN_EMAILS = ['admin@kyatflow.com'];

    if (!ADMIN_EMAILS.includes(authReq.user.email)) {
        return next(new AppError('Access Denied: Admin privileges required', 403));
    }

    next();
};
