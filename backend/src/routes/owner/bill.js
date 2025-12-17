const express = require('express');
const router = express.Router();
const BillController = require('../../controllers/owner/billController');
const { addPaymentValidator, deletePaymentValidator } = require('../../middleware/validators/billValidators');

/**
 * Bill routes for owners
 * Base path: /api/owner/bills
 */

// Get all bills
router.get('/', BillController.getBills);

// Get bill by ID
router.get('/:id', BillController.getBill);

// Add payment to bill
router.post('/:id/payments', addPaymentValidator, BillController.addPayment);

// Delete payment from bill
router.delete('/:billId/payments/:paymentId', deletePaymentValidator, BillController.deletePayment);

module.exports = router;
