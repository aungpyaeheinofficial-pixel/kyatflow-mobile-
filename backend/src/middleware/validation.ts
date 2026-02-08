import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    next();
  };
};

// Validation rules
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

export const validateTransaction = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
];

export const validateParty = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['customer', 'supplier']).withMessage('Type must be customer or supplier'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

