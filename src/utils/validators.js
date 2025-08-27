function isValidCardNumber(cardNumber) {
  if (!cardNumber || typeof cardNumber !== "string") {
    return false;
  }

  const s = String(cardNumber).replace(/(\s+)|-/g, "");
  if (!/^\d+$/.test(s)) return false;

  let sum = 0;

  for (let i = 0; i < s.length; i++) {
    const digit = Number(s[s.length - 1 - i]);

    if (i % 2 === 1) {
      let doubled = digit * 2;
      if (doubled > 9) doubled -= 9;
      sum += doubled;
    } else {
      sum += digit;
    }
  }

  return sum % 10 === 0;
}

function isValidISOMessage(msg) {
  if (!msg || typeof msg !== "string") {
    return false;
  }

  const [mti, cardNumber, amount, merchantId] = msg.split("|");
  if (!mti || !cardNumber || !amount || !merchantId) {
    return false;
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    return false;
  }

  if (!isValidCardNumber(cardNumber)) {
    return false;
  }

  if (!merchantId.trim()) {
    return false;
  }

  if (mti.length !== 4) {
    return false;
  }

  return true;
}

/**
 * 
 * @param {Object} payload - The webhook payload
 * @returns {Object} - Validation result with isValid and errors
 */
function validateWebhookPayload(payload) {
  const errors = [];
  const requiredFields = [
    "settlementId",
    "merchantId",
    "totalAmount",
    "settlementDate",
    "status",
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!payload[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate status values
  const validStatuses = ["initiated", "processing", "completed", "failed"];
  if (payload.status && !validStatuses.includes(payload.status)) {
    errors.push(
      `Invalid status: ${payload.status}. Must be one of: ${validStatuses.join(
        ", "
      )}`
    );
  }

  // Validate amount format
  if (
    payload.totalAmount &&
    (isNaN(payload.totalAmount) || Number(payload.totalAmount) <= 0)
  ) {
    errors.push("totalAmount must be a positive number");
  }

  // Validate date format
  if (payload.settlementDate) {
    const date = new Date(payload.settlementDate);
    if (isNaN(date.getTime())) {
      errors.push("settlementDate must be a valid date");
    }
  }

  // Validate transactionIds if present
  if (payload.transactionIds && !Array.isArray(payload.transactionIds)) {
    errors.push("transactionIds must be an array");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isValidISOMessage,
  isValidCardNumber,
  validateWebhookPayload,
  checkRequiredFields: function (requiredFields, obj) {
    const missingFields = [];
    requiredFields.forEach((field) => {
      if (!(field in obj)) {
        missingFields.push(field);
      }
    });
    return missingFields;
  },
};
