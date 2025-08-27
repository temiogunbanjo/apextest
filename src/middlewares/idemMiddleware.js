const STATUS_CODES = require("../constants/statusCodes");
const redisClient = require("../core/redisClient");
const { hashRequest } = require("../utils/encryption");
const { sendErrorResponse } = require("../utils/sendResponses");

/**
 *
 * @param {(request: any, response: any) => Promise<any>} handler
 * @returns
 */
function idempotent(handler) {
  return async (request, response) => {
    try {
      const key = request.headers["idempotency-key"];

      if (!key) {
        return sendErrorResponse(
          response,
          "Missing Idempotency-Key header",
          STATUS_CODES.BAD_REQUEST
        );
      }

      const requestHash = hashRequest(request.body);
      const redisKey = `idempotency:${key}`;
      const expiryDuration = 300; // 5 minute

      const existing = await redisClient.get(redisKey);

      if (existing) {
        const record = JSON.parse(existing);

        if (record.hash === requestHash) {
          return response
            .status(record.cachedResponse?.code || STATUS_CODES.OK)
            .json(record.cachedResponse);
        }

        return sendErrorResponse(
          response,
          "Idempotency key conflict",
          STATUS_CODES.CONFLICT
        );

        // if (record.status === "completed") {
        //   return response
        //     .status(record.cachedResponse.code || STATUS_CODES.OK)
        //     .json(record.cachedResponse);
        // }
      }

      // Store a "pending" record
      await redisClient.set(
        redisKey,
        JSON.stringify({
          hash: requestHash,
          cachedResponse: null,
          status: "pending",
        }),
        "EX",
        expiryDuration // Set to expire in 1 hour, only if not exists
      );

      const { code, ...result } = await handler(request, response);
      // Save final response in Redis
      await redisClient.set(
        redisKey,
        JSON.stringify({
          hash: requestHash,
          cachedResponse: { code, ...result },
          status: "completed",
        }),
        "EX",
        expiryDuration
      );

      return response.status(code).json(result);
    } catch (e) {
      console.log("Idempotency middleware error:", e);
      return sendErrorResponse(
        response,
        e.message,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  };
}

module.exports = idempotent;
