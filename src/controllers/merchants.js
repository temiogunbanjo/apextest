const STATUS_CODES = require("../constants/statusCodes");
const logger = require("../events/logger");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendIdempotentErrorResponse,
} = require("../utils/sendResponses");
const { fetchAllMerchants, fetchMerchantById, createMerchant } = require("../db/merchants");

/**
 *
 * @param {Error} error
 * @param {import('express').Response} res
 * @returns
 */
const handleControllerError = (error, res) => {
  return sendErrorResponse(
    res,
    error.message,
    STATUS_CODES.INTERNAL_SERVER_ERROR
  );
};

/**
 *
 * @param {Error} error
 * @param {import('express').Response} res
 * @returns
 */
const handleIdempotentControllerError = (error) => {
  return sendIdempotentErrorResponse(
    error.message,
    STATUS_CODES.INTERNAL_SERVER_ERROR
  );
};

module.exports = {
  createNewMerchant: async (req, res) => {
    try {
      const { name, email } = req.body;
      const existingMerchant = await fetchMerchantById(email);
      if (existingMerchant) {
        return sendErrorResponse(
          res,
          "Merchant with this email already exists",
          STATUS_CODES.CONFLICT
        );
      }
      // Assuming createMerchant is a function that creates a merchant in the DB
      const merchantData = { name, email };
      const merchant = await createMerchant(merchantData);
      if (!merchant) {
        return sendErrorResponse(
          res,
          "Failed to create merchant",
          STATUS_CODES.INTERNAL_SERVER_ERROR
        );
      }
      return sendSuccessResponse(res, merchant, STATUS_CODES.OK);
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
  fetchMerchants: async (req, res) => {
    try {
      const response = await fetchAllMerchants();
      return sendSuccessResponse(res, response, STATUS_CODES.OK);
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
};
