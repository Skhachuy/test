const { body, param, validationResult } = require('express-validator');

/**
 * Validator for adding payment to bill
 */
const addPaymentValidator = [
  param('id')
    .notEmpty()
    .withMessage('Bill ID is required')
    .isUUID()
    .withMessage('Invalid Bill ID format'),
  
  body('tenantId')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isUUID()
    .withMessage('Invalid Tenant ID format'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return true;
    }),
  
  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'bank_transfer', 'momo', 'zalopay', 'vnpay'])
    .withMessage('Invalid payment method'),
  
  body('note')
    .optional()
    .isString()
    .withMessage('Note must be a string')
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validator for deleting payment
 */
const deletePaymentValidator = [
  param('billId')
    .notEmpty()
    .withMessage('Bill ID is required')
    .isUUID()
    .withMessage('Invalid Bill ID format'),
  
  param('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isUUID()
    .withMessage('Invalid Payment ID format'),

  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  addPaymentValidator,
  deletePaymentValidator
};
