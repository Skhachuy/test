const { Bill, Payment, Room, BoardingHouse, Tenant } = require('../../models');
const { Op } = require('sequelize');

class BillService {
  /**
   * Get bill by ID with full details
   */
  static async getBillById(billId, userId) {
    const bill = await Bill.findOne({
      where: { id: billId, is_active: true },
      include: [
        {
          model: Room,
          as: 'room',
          include: [
            {
              model: BoardingHouse,
              as: 'boardingHouse',
              where: { owner_id: userId },
              attributes: ['id', 'name']
            }
          ],
          attributes: ['id', 'name']
        },
        {
          model: Payment,
          as: 'payments',
          include: [
            {
              model: Tenant,
              as: 'tenant',
              attributes: ['id', 'name']
            }
          ],
          order: [['paid_at', 'DESC']]
        }
      ]
    });

    if (!bill) {
      throw new Error('Không tìm thấy hóa đơn');
    }

    return bill;
  }

  /**
   * Add payment to bill
   */
  static async addPaymentToBill(billId, paymentData, userId, transaction) {
    const { tenantId, amount, method, note, imageUrl } = paymentData;

    // Validate bill ownership
    const bill = await Bill.findOne({
      where: { id: billId, is_active: true },
      include: [
        {
          model: Room,
          as: 'room',
          include: [
            {
              model: BoardingHouse,
              as: 'boardingHouse',
              where: { owner_id: userId }
            }
          ]
        }
      ],
      transaction
    });

    if (!bill) {
      throw new Error('Không tìm thấy hóa đơn');
    }

    // Validate tenant
    const tenant = await Tenant.findByPk(tenantId, { transaction });
    if (!tenant) {
      throw new Error('Không tìm thấy khách thuê');
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Số tiền không hợp lệ');
    }

    // Create payment
    const payment = await Payment.create(
      {
        bill_id: billId,
        tenant_id: tenantId,
        amount: parsedAmount,
        method: method || 'cash',
        note: note || null,
        image_url: imageUrl || null,
        paid_at: new Date()
      },
      { transaction }
    );

    // Recalculate bill status
    await this.recalculateBillStatus(billId, transaction);

    // Return updated bill
    return await this.getBillById(billId, userId);
  }

  /**
   * Delete payment
   */
  static async deletePayment(paymentId, billId, ownerId, transaction) {
    // Validate payment exists and owner has permission
    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [
        {
          model: Bill,
          as: 'bill',
          where: { id: billId, is_active: true },
          include: [
            {
              model: Room,
              as: 'room',
              include: [
                {
                  model: BoardingHouse,
                  as: 'boardingHouse',
                  where: { owner_id: ownerId }
                }
              ]
            }
          ]
        }
      ],
      transaction
    });

    if (!payment) {
      throw new Error('Không tìm thấy thanh toán');
    }

    const relatedBillId = payment.bill_id;

    // Delete payment
    await payment.destroy({ transaction });

    // Recalculate bill status
    await this.recalculateBillStatus(relatedBillId, transaction);

    // Return updated bill
    return await this.getBillById(relatedBillId, ownerId);
  }

  /**
   * Recalculate bill status based on payments
   */
  static async recalculateBillStatus(billId, transaction) {
    const bill = await Bill.findByPk(billId, {
      include: [
        {
          model: Payment,
          as: 'payments'
        }
      ],
      transaction
    });

    if (!bill) {
      return;
    }

    // Calculate total paid amount
    const totalPaid = bill.payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    const totalAmount = parseFloat(bill.total_amount);

    // Determine status
    let status = 'unpaid';
    if (totalPaid >= totalAmount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    // Update bill status
    await bill.update({ status }, { transaction });

    return bill;
  }

  /**
   * Get all bills for owner
   */
  static async getBills(userId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    const where = { is_active: true };
    
    // Add filters if provided
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.fromDate) {
      where.created_at = { [Op.gte]: filters.fromDate };
    }
    if (filters.toDate) {
      where.created_at = { ...where.created_at, [Op.lte]: filters.toDate };
    }

    const { count, rows } = await Bill.findAndCountAll({
      where,
      include: [
        {
          model: Room,
          as: 'room',
          include: [
            {
              model: BoardingHouse,
              as: 'boardingHouse',
              where: { owner_id: userId }
            }
          ]
        },
        {
          model: Payment,
          as: 'payments',
          include: [
            {
              model: Tenant,
              as: 'tenant',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }
}

module.exports = BillService;
