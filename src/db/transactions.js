/**
 * Database operations related to Transactions.
 */
const { Op } = require("sequelize");
const sequelize = require("../../models");

const { Transactions } = sequelize;

const createTransaction = async (transactionData) => {
  const transaction = await Transactions.create(transactionData);
  return transaction;
};

const fetchTransactionById = async (id) => {
  const transaction = await Transactions.findByPk(id);
  return transaction;
};

const fetchAllTransactions = async (filters = {}) => {
  const QUERY = [];
  const transaction = await Transactions.findAll({
    where: {
      [Op.and]: QUERY,
    },
  });
  return transaction;
};

const updateTransaction = async (id, updateData) => {
  const transaction = await Transactions.update(updateData, { where: { id } });
  return transaction;
};

module.exports = {
  createTransaction,
  fetchTransactionById,
  fetchAllTransactions,
  updateTransaction,
};
