const BillService = require('../../services/owner/billService');
const { sequelize } = require('../../models');

class BillController {
  /**
   * Add payment to bill
   * POST /owner/bills/:id/payments
   */
  static async addPayment(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const billId = req.params.id;
      const userId = req.user.id; // Assuming user is attached by auth middleware
      const paymentData = req.body;

      const updatedBill = await BillService.addPaymentToBill(
        billId,
        paymentData,
        userId,
        transaction
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Thêm thanh toán thành công',
        data: updatedBill
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error adding payment:', error);
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể thêm thanh toán',
        error: error.message
      });
    }
  }

  /**
   * Delete payment
   * DELETE /owner/bills/:billId/payments/:paymentId
   */
  static async deletePayment(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { billId, paymentId } = req.params;
      const userId = req.user.id;

      const updatedBill = await BillService.deletePayment(
        paymentId,
        billId,
        userId,
        transaction
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Xóa thanh toán thành công',
        data: updatedBill
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting payment:', error);
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể xóa thanh toán',
        error: error.message
      });
    }
  }

  /**
   * Get bill by ID
   * GET /owner/bills/:id
   */
  static async getBill(req, res) {
    try {
      const billId = req.params.id;
      const userId = req.user.id;

      const bill = await BillService.getBillById(billId, userId);

      return res.status(200).json({
        success: true,
        data: bill
      });
    } catch (error) {
      console.error('Error getting bill:', error);
      
      return res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy hóa đơn',
        error: error.message
      });
    }
  }

  /**
   * Get all bills
   * GET /owner/bills
   */
  static async getBills(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status, fromDate, toDate } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;

      const result = await BillService.getBills(
        userId,
        parseInt(page),
        parseInt(limit),
        filters
      );

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting bills:', error);
      
      return res.status(400).json({
        success: false,
        message: 'Không thể lấy danh sách hóa đơn',
        error: error.message
      });
    }
  }
}

module.exports = BillController;
