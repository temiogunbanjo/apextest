const crypto = require("crypto");

module.exports = {
  generateUniqueId: function () {
    return "pi-" + Math.random().toString(36).substring(2, 9);
  },
  /**
   *
   * @param {Object} payload - The payload to sign
   * @param {string} secret - The secret key
   * @returns {string} - The generated signature
   */
  generateWebhookSignature: function (payload, secret) {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");
  },
};
