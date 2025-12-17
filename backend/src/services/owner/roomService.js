const { Room, BoardingHouse } = require('../../models');
const { Op } = require('sequelize');

class RoomService {
  /**
   * Get rooms with boarding house information
   * Fixed: Now includes boarding house name in response
   */
  static async getRooms(userId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    const where = { is_active: true };
    
    // Add filters if provided
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.boardingHouseId) {
      where.boarding_house_id = filters.boardingHouseId;
    }

    // Build include options
    const include = [
      {
        model: BoardingHouse,
        as: 'boardingHouse',
        where: { owner_id: userId, is_active: true },
        attributes: ['id', 'name', 'address'] // ✅ Include boarding house info
      }
    ];

    const { count, rows } = await Room.findAndCountAll({
      where,
      include,
      limit: filters.includeAll ? undefined : limit,
      offset: filters.includeAll ? undefined : offset,
      order: [['created_at', 'DESC']]
    });

    // Map rooms to include boardingHouseName at root level for easier access
    const mappedRows = rows.map(room => {
      const roomData = room.toJSON();
      return {
        ...roomData,
        boardingHouseName: roomData.boardingHouse?.name || null // ✅ Add at root level
      };
    });

    return {
      data: mappedRows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get room by ID with boarding house info
   */
  static async getRoomById(roomId, userId) {
    const room = await Room.findOne({
      where: { id: roomId, is_active: true },
      include: [
        {
          model: BoardingHouse,
          as: 'boardingHouse',
          where: { owner_id: userId, is_active: true },
          attributes: ['id', 'name', 'address']
        }
      ]
    });

    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }

    const roomData = room.toJSON();
    return {
      ...roomData,
      boardingHouseName: roomData.boardingHouse?.name || null
    };
  }

  /**
   * Create new room
   */
  static async createRoom(roomData, userId, transaction) {
    const { boardingHouseId, name, floor, area, price, status } = roomData;

    // Validate boarding house ownership
    const boardingHouse = await BoardingHouse.findOne({
      where: { id: boardingHouseId, owner_id: userId, is_active: true },
      transaction
    });

    if (!boardingHouse) {
      throw new Error('Không tìm thấy nhà trọ');
    }

    const room = await Room.create(
      {
        boarding_house_id: boardingHouseId,
        name,
        floor,
        area,
        price,
        status: status || 'available'
      },
      { transaction }
    );

    return await this.getRoomById(room.id, userId);
  }

  /**
   * Update room
   */
  static async updateRoom(roomId, roomData, userId, transaction) {
    const room = await Room.findOne({
      where: { id: roomId, is_active: true },
      include: [
        {
          model: BoardingHouse,
          as: 'boardingHouse',
          where: { owner_id: userId, is_active: true }
        }
      ],
      transaction
    });

    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }

    await room.update(roomData, { transaction });

    return await this.getRoomById(roomId, userId);
  }

  /**
   * Delete room (soft delete)
   */
  static async deleteRoom(roomId, userId, transaction) {
    const room = await Room.findOne({
      where: { id: roomId, is_active: true },
      include: [
        {
          model: BoardingHouse,
          as: 'boardingHouse',
          where: { owner_id: userId, is_active: true }
        }
      ],
      transaction
    });

    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }

    await room.update({ is_active: false }, { transaction });
  }
}

module.exports = RoomService;
