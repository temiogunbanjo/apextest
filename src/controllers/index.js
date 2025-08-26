const STATUS_CODES = require("../constants/statusCodes");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/sendResponses");

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

module.exports = {
  getIndex: (_, res) => {
    return res.status(200).send("Welcome to the API");
  },
  createPaymentIntent: async (req, res) => {
    try {
      const { amount, currency = "NGN", merchantId } = req.body;
      // Simulate some async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return sendSuccessResponse(res, data, STATUS_CODES.OK);
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
};
