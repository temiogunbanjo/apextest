const { v4: uuidv4 } = require("uuid");
const STATUS_CODES = require("../constants/statusCodes");
const logger = require("../events/logger");
const { generateUniqueId } = require("../utils/generate");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendIdempotentSuccessResponse,
  sendIdempotentErrorResponse,
} = require("../utils/sendResponses");
const idempotentMiddleware = require("../middlewares/idemMiddleware");
const { fetchMerchantById } = require("../db/merchants");
const {
  createTransaction,
  fetchTransactionById,
  fetchAllTransactions,
  updateTransaction,
} = require("../db/transactions");
const transactionStatus = require("../constants/transactionStatus");
const { isValidISOMessage, isValidCardNumber } = require("../utils/validators");
const { parseIsoMessage } = require("../utils/parsers");
const processor = require("../core/paymentProcessor");

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
  initiateTransaction: idempotentMiddleware(async (req, res) => {
    try {
      const { currency = "NGN", isoMessage } = req.body;
      const id = generateUniqueId();

      if (!isValidISOMessage(isoMessage)) {
        return sendIdempotentErrorResponse(
          "Invalid ISO message format",
          STATUS_CODES.BAD_REQUEST
        );
      }

      const { amount, merchantId, cardNumber } = parseIsoMessage(isoMessage);

      // Check if merchant exists
      const merchantInfo = await fetchMerchantById(merchantId);
      if (!merchantInfo) {
        return sendIdempotentErrorResponse(
          "Merchant not found",
          STATUS_CODES.NOT_FOUND
        );
      }

      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return sendIdempotentErrorResponse(
          "Amount must be a positive number",
          STATUS_CODES.BAD_REQUEST
        );
      }

      if (!isValidCardNumber(cardNumber)) {
        return sendIdempotentErrorResponse(
          "Invalid card number",
          STATUS_CODES.BAD_REQUEST
        );
      }

      const newTransaction = {
        uniqueId: uuidv4(),
        cardPanMasked: cardNumber,
        amount,
        currency,
        merchantId,
        status: transactionStatus.INITIATED,
      };
      // payments.set(id, intent);
      logger("payment.initiated", { id, amount, currency, merchantId });
      // Simulate some async operation
      const response = await createTransaction(newTransaction);

      return sendIdempotentSuccessResponse(response, STATUS_CODES.OK);
    } catch (error) {
      return handleIdempotentControllerError(error);
    }
  }),
  authorizeTransaction: idempotentMiddleware(async (req, res) => {
    try {
      const { id } = req.params;
      const { emvData } = req.body;
      console.log("Authorizing transaction:", id, emvData);

      const tx = await fetchTransactionById(id);
      if (!tx) {
        return sendIdempotentErrorResponse(
          "Transaction not found",
          STATUS_CODES.NOT_FOUND
        );
      }

      if (tx.status !== transactionStatus.INITIATED) {
        return sendIdempotentErrorResponse(
          `Transaction cannot be authorized in its current state: ${tx.transactionStatus}`,
          STATUS_CODES.BAD_REQUEST
        );
      }

      const updatedTx = {
        authCode: null,
        status: tx.status,
        transactionStatus: tx.transactionStatus,
      };

      const paymentProcessorResponse = await processor.authorize(emvData);

      if (paymentProcessorResponse.status !== "approved") {
        return sendIdempotentErrorResponse(
          "Authorization failed",
          STATUS_CODES.BAD_REQUEST
        );
      }

      updatedTx.authCode = paymentProcessorResponse.authCode;
      updatedTx.status = transactionStatus.AUTHORIZED;

      const updateResponse = await updateTransaction(id, updatedTx);
      if (!updateResponse) {
        return sendIdempotentErrorResponse(
          "Failed to update transaction",
          STATUS_CODES.INTERNAL_SERVER_ERROR
        );
      }
      logger("payment.authorized", { id, ...updatedTx });

      return sendIdempotentSuccessResponse(updatedTx, STATUS_CODES.OK);
    } catch (error) {
      return handleIdempotentControllerError(error);
    }
  }),
  fetchSingleTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(
          res,
          "Transaction ID is required",
          STATUS_CODES.BAD_REQUEST
        );
      }

      const transaction = await fetchTransactionById(id);
      if (!transaction) {
        return sendErrorResponse(
          res,
          "Transaction not found",
          STATUS_CODES.NOT_FOUND
        );
      }

      return sendSuccessResponse(res, transaction, STATUS_CODES.OK);
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
  fetchTransactions: async (req, res) => {
    try {
      const response = await fetchAllTransactions();
      return sendSuccessResponse(res, response, STATUS_CODES.OK);
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
};
