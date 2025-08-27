const redisClient = require("../core/redisClient");

/**
 * Rate limiting for webhook endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = async function webhookRateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute per IP

  const clientData = redisClient.get(clientIP) || {
    count: 0,
    resetTime: currentTime + windowMs,
  };

  // Reset counter if window has passed
  if (currentTime > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = currentTime + windowMs;
  } else {
    clientData.count++;
  }

  await redisClient.set(
    clientIP,
    JSON.stringify(clientData),
    "EX",
    300 // Set to expire in 5 minutes, only if not exists
  );

  if (clientData.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Too many webhook requests. Please try again later.",
    });
  }

  next();
};
