const express = require("express");
const router = express.Router();
const controllers = require("../controllers");
const idempotentMiddleware = require("../middlewares/idpMiddleware");
const validateRequestBody = require("../middlewares/validateRequestBody");

router.get("/", controllers.getIndex);

router.post(
  "/payments/create-intent",
  validateRequestBody(["amount", "merchantId"]),
  idempotentMiddleware(controllers.createPaymentIntent)
);

module.exports = router;
