/**
 * Database operations related to Payments.
 */
const sequelize = require("../../models");

const { Payments } = sequelize;

const createPayment = async (paymentData) => {
  const payment = await Payments.create(paymentData);
  return payment;
};

const fetchPaymentById = async (id) => {
  const payment = await Payments.findOne({ where: { id } });
  return payment;
};

const updatePayment = async (id, updateData) => {
  const payment = await Payments.update(updateData, { where: { id } });
  return payment;
};

module.exports = {
  createPayment,
  fetchPaymentById,
  updatePayment
};
