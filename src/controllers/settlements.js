const STATUS_CODES = require("../constants/statusCodes");
const logger = require("../events/logger");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/sendResponses");
const { fetchMerchantById } = require("../db/merchants");
const {
  fetchTransactionById,
  updateTransaction,
} = require("../db/transactions");
const {
  createSettlement,
  updateSettlement,
  getSettlementById,
  getSettlementsByMerchant,
} = require("../db/settlements");
const { verifyWebhookSignature } = require("../utils/webhookVerification");
const transactionStatus = require("../constants/transactionStatus");

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
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const settlementWebhook = async (req, res) => {
  try {
    const { settlementId, merchantId, status, signature, timestamp } = req.body;

    // Verify webhook signature for security
    if (!verifyWebhookSignature(req.body, signature, timestamp)) {
      logger("webhook.invalid_signature", { settlementId, merchantId });
      return sendErrorResponse(
        res,
        "Invalid webhook signature",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    // Verify merchant exists
    const merchant = await fetchMerchantById(merchantId);
    if (!merchant) {
      logger("webhook.merchant_not_found", { settlementId, merchantId });
      return sendErrorResponse(
        res,
        "Merchant not found",
        STATUS_CODES.NOT_FOUND
      );
    }

    // Process settlement based on status
    switch (status) {
      case transactionStatus.INITIATED:
        return handleSettlementInitiated(req, res);

      case "processing":
        return handleSettlementProcessing(req, res);

      case transactionStatus.COMPLETED:
        return handleSettlementCompleted(req, res);

      case transactionStatus.FAILED:
        return handleSettlementFailed(req, res);

      default:
        return sendErrorResponse(
          res,
          "Invalid settlement status",
          STATUS_CODES.BAD_REQUEST
        );
    }
  } catch (error) {
    return handleControllerError(error, res);
  }
};

/**
 * Handle settlement initiation
 */
const handleSettlementInitiated = async (req, res) => {
  const { settlementId, merchantId, totalAmount, settlementDate, reference } =
    req.body;

  try {
    // Create settlement record
    const settlement = await createSettlement({
      id: settlementId,
      merchantId,
      totalAmount,
      settlementDate,
      reference,
      status: "pending",
    });

    logger("settlement.initiated", {
      settlementId,
      merchantId,
      totalAmount,
      reference,
    });

    return sendSuccessResponse(
      res,
      { settlementId: settlement.id, status: "initiated" },
      STATUS_CODES.OK
    );
  } catch (error) {
    return handleControllerError(error, res);
  }
};

/**
 * Handle settlement processing
 */
const handleSettlementProcessing = async (req, res) => {
  const { settlementId, transactionIds } = req.body;

  try {
    // Update settlement status to processing
    await updateSettlement(settlementId, { status: "processing" });

    // Update related transactions to settled
    if (transactionIds && Array.isArray(transactionIds)) {
      await Promise.all(
        transactionIds.map(async (transactionId) =>
          updateTransaction(transactionId, {
            status: transactionStatus.SETTLED,
            settledAt: new Date(),
          })
        )
      );
    }

    logger("settlement.processing", { settlementId, transactionIds });

    return sendSuccessResponse(
      res,
      { settlementId, status: "processing" },
      STATUS_CODES.OK
    );
  } catch (error) {
    return handleControllerError(error, res);
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const handleSettlementCompleted = async (req, res) => {
  const { settlementId, reference, completedAt } = req.body;

  try {
    // Update settlement status to completed
    await updateSettlement(settlementId, {
      status: "completed",
      completedAt: completedAt || new Date(),
    });

    logger("settlement.completed", { settlementId, reference, completedAt });

    return sendSuccessResponse(
      res,
      { settlementId, status: "completed" },
      STATUS_CODES.OK
    );
  } catch (error) {
    return handleControllerError(error, res);
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const handleSettlementFailed = async (req, res) => {
  const { settlementId, failureReason, failedAt } = req.body;

  try {
    // Update settlement status to failed
    await updateSettlement(settlementId, {
      status: "failed",
      failureReason,
      failedAt: failedAt || new Date(),
    });

    logger("settlement.failed", {
      settlementId,
      failureReason,
      failedAt,
    });

    return sendSuccessResponse(
      res,
      { settlementId, status: "failed", failureReason },
      STATUS_CODES.OK
    );
  } catch (error) {
    return handleControllerError(error, res);
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSettlementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendErrorResponse(
        res,
        "Settlement ID is required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const settlement = await getSettlementById(id);
    if (!settlement) {
      return sendErrorResponse(
        res,
        "Settlement not found",
        STATUS_CODES.NOT_FOUND
      );
    }

    return sendSuccessResponse(res, settlement, STATUS_CODES.OK);
  } catch (error) {
    logger("settlement.status_error", {
      error: error.message,
      id: req.params.id,
    });
    return sendErrorResponse(
      res,
      "Internal server error",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Get all settlements for a merchant
 */
const getMerchantSettlements = async (req, res) => {
  try {
    const { merchantId } = req.params;

    if (!merchantId) {
      return sendErrorResponse(
        res,
        "Merchant ID is required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Verify merchant exists
    const merchant = await fetchMerchantById(merchantId);
    if (!merchant) {
      return sendErrorResponse(
        res,
        "Merchant not found",
        STATUS_CODES.NOT_FOUND
      );
    }

    const settlements = await getSettlementsByMerchant(merchantId);

    return sendSuccessResponse(res, settlements, STATUS_CODES.OK);
  } catch (error) {
    logger("settlement.merchant_error", {
      error: error.message,
      merchantId: req.params.merchantId,
    });
    return sendErrorResponse(
      res,
      "Internal server error",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  settlementWebhook,
  getSettlementStatus,
  getMerchantSettlements,
};
