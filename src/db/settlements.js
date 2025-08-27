const { Op } = require("sequelize");
const { Settlements, Merchants } = require("../../models");

/**
 * Create a new settlement record
 * @param {Object} settlementData - Settlement data to create
 * @returns {Promise<Object>} - Created settlement record
 */
async function createSettlement(settlementData) {
  try {
    const settlement = await Settlements.create(settlementData);
    return settlement;
  } catch (error) {
    console.error("Error creating settlement:", error);
    throw error;
  }
}

/**
 * Get settlement by ID
 * @param {string} settlementId - Settlement ID to find
 * @returns {Promise<Object|null>} - Settlement record or null if not found
 */
async function getSettlementById(settlementId) {
  try {
    const settlement = await Settlements.findByPk(settlementId, {
      include: [
        {
          model: Merchants,
          as: "Merchants",
          attributes: ["id", "name", "email", "bankName", "bankAccountNumber"],
        },
      ],
    });
    return settlement;
  } catch (error) {
    console.error("Error fetching settlement by ID:", error);
    throw error;
  }
}

/**
 * Update settlement record
 * @param {string} settlementId - Settlement ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} - Updated settlement record or null if not found
 */
async function updateSettlement(settlementId, updateData) {
  try {
    const settlement = await Settlements.findByPk(settlementId);
    if (!settlement) {
      return null;
    }

    await settlement.update(updateData);
    return settlement;
  } catch (error) {
    console.error("Error updating settlement:", error);
    throw error;
  }
}

/**
 * Get all settlements for a specific merchant
 * @param {string} merchantId - Merchant ID to find settlements for
 * @param {Object} options - Query options (pagination, sorting, etc.)
 * @returns {Promise<Array>} - Array of settlement records
 */
async function getSettlementsByMerchant(merchantId, options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      startDate,
      endDate,
      sortBy = "settlementDate",
      sortOrder = "DESC",
    } = options;

    const whereClause = { merchantId };

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.settlementDate = {};

      if (startDate) {
        whereClause.settlementDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.settlementDate[Op.lte] = new Date(endDate);
      }
    }

    const settlements = await Settlements.findAll({
      where: whereClause,
      limit: Number(limit),
      offset: Number(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Merchants,
          as: "Merchants",
          attributes: ["id", "name", "email", "bankName", "bankAccountNumber"],
        },
      ],
    });

    return settlements;
  } catch (error) {
    console.error("Error fetching settlements by merchant:", error);
    throw error;
  }
}

module.exports = {
  createSettlement,
  getSettlementById,
  updateSettlement,
  getSettlementsByMerchant,
};
