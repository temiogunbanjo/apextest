/**
 * Database operations related to Merchants.
 */
const sequelize = require("../../models");

const { Merchants } = sequelize;

const createMerchant = async (merchantData) => {
  const merchant = await Merchants.create(merchantData);
  return merchant;
};

const fetchMerchantById = async (id) => {
  const merchant = await Merchants.findOne({ where: { id } });
  return merchant;
};

const fetchAllMerchants = async (id) => {
  const merchants = await Merchants.findAll();
  return merchants;
};

const updateMerchant = async (id, updateData) => {
  const merchant = await Merchants.update(updateData, { where: { id } });
  return merchant;
};

module.exports = {
  createMerchant,
  fetchMerchantById,
  fetchAllMerchants,
  updateMerchant
};
