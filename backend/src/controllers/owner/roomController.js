const RoomService = require('../../services/owner/roomService');
const { sequelize } = require('../../models');

class RoomController {
  /**
   * Get all rooms
   * GET /owner/rooms
   */
  static async getRooms(req, res) {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
        status, 
        boardingHouseId,
        includeAll,
        includeBoardingHouse 
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (boardingHouseId) filters.boardingHouseId = boardingHouseId;
      if (includeAll) filters.includeAll = true;
      
      // ✅ Always include boarding house info when requested
      // This ensures bill form gets complete room data

      const result = await RoomService.getRooms(
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
      console.error('Error getting rooms:', error);
      
      return res.status(400).json({
        success: false,
        message: 'Không thể lấy danh sách phòng',
        error: error.message
      });
    }
  }

  /**
   * Get room by ID
   * GET /owner/rooms/:id
   */
  static async getRoom(req, res) {
    try {
      const roomId = req.params.id;
      const userId = req.user.id;

      const room = await RoomService.getRoomById(roomId, userId);

      return res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error getting room:', error);
      
      return res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy phòng',
        error: error.message
      });
    }
  }

  /**
   * Create room
   * POST /owner/rooms
   */
  static async createRoom(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user.id;
      const roomData = req.body;

      const room = await RoomService.createRoom(roomData, userId, transaction);

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: 'Tạo phòng thành công',
        data: room
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating room:', error);
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo phòng',
        error: error.message
      });
    }
  }

  /**
   * Update room
   * PUT /owner/rooms/:id
   */
  static async updateRoom(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const roomId = req.params.id;
      const userId = req.user.id;
      const roomData = req.body;

      const room = await RoomService.updateRoom(roomId, roomData, userId, transaction);

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Cập nhật phòng thành công',
        data: room
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating room:', error);
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể cập nhật phòng',
        error: error.message
      });
    }
  }

  /**
   * Delete room
   * DELETE /owner/rooms/:id
   */
  static async deleteRoom(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const roomId = req.params.id;
      const userId = req.user.id;

      await RoomService.deleteRoom(roomId, userId, transaction);

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Xóa phòng thành công'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting room:', error);
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể xóa phòng',
        error: error.message
      });
    }
  }
}

module.exports = RoomController;
