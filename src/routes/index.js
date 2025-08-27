const express = require("express");
const router = express.Router();
const controllers = require("../controllers");
const validateRequestBody = require("../middlewares/validateRequestBody");
const authMiddleware = require("../middlewares/authMiddleware");
const webhookRateLimit = require("../middlewares/webhookRateLimit");

router.get("/", controllers.getIndex);
router.get("/merchants", controllers.fetchMerchants);
router.post(
  "/merchants",
  validateRequestBody(["name", "email"]),
  controllers.createNewMerchant
);

router.get("/transactions", authMiddleware, controllers.fetchTransactions);
router.post(
  "/transactions/initiate",
  validateRequestBody(["isoMessage"]),
  controllers.initiateTransaction
);

router.post(
  "/transactions/:id/authorize",
  validateRequestBody(["emvData"]),
  controllers.authorizeTransaction
);

// TODO: Add capture and refund endpoints

router.get("/transactions/:id/status", controllers.fetchSingleTransaction);

router.post(
  "/settlements/webhook",
  webhookRateLimit,
  validateRequestBody([
    "settlementId",
    "merchantId",
    "totalAmount",
    "settlementDate",
  ]),
  controllers.settlementWebhook
);

router.get("/settlements/:id", authMiddleware, controllers.getSettlementStatus);

router.get(
  "/settlements/:merchantId/merchants",
  authMiddleware,
  controllers.getMerchantSettlements
);

module.exports = router;
