const crypto = require("crypto");

/**
 *
 * @param {Object} payload - The webhook payload
 * @param {string} signature - The signature to verify
 * @param {string|number} timestamp - The timestamp of the webhook
 * @returns {boolean} - True if signature is valid, false otherwise
 */
function verifyWebhookSignature(payload, signature, timestamp) {
  try {
    // Check if required parameters exist
    if (!signature || !timestamp) {
      return false;
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("WEBHOOK_SECRET not configured");
      return false;
    }

    // Check if timestamp is recent (within 5 minutes)
    const webhookTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - webhookTime);
    const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (timeDiff > maxAge) {
      console.warn("Webhook timestamp too old:", timeDiff, "ms");
      return false;
    }

    // Create the expected signature
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadString)
      .digest("hex");

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );

    return isValid;
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
}

module.exports = {
  verifyWebhookSignature,
};
