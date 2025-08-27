const STATUS_CODES = require("../constants/statusCodes");
const logger = require("../events/logger");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendIdempotentErrorResponse,
} = require("../utils/sendResponses");
const { fetchAllMerchants, fetchMerchantById } = require("../db/merchants");

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
  fetchMerchants: async (req, res) => {
    try {
      const response = await fetchAllMerchants();
      return sendSuccessResponse(res, response, STATUS_CODES.OK);
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
};
