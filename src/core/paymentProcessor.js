const crypto = require("node:crypto");

/**
 *
 * @param {string} prefix
 * @returns {string}
 */
function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

const processor = {
  /**
   *
   * @param {{
   * amount: number;
   * currency: string;
   * emvPayload: string;
   * merchantRef: string;
   * idempotencyKey: string;
   * }} payload
   * @returns
   */
  async authorize(payload) {
    return {
      status: "approved", // or "declined"
      authCode: "A12345",
      processorTxnId: generateId("ptxn"),
      raw: { network: "VISA" },
    };
  },
  /**
   *
   * @param {string} processorTxnId
   * @param {number} amount
   * @returns
   */
  async capture(processorTxnId, amount) {
    return { status: "captured", captureId: generateId("cap") };
  },
};

module.exports = processor;
