const STATUS_CODES = require("../constants/statusCodes");
const { sendErrorResponse } = require("../utils/sendResponses");

const seenIdemKeys = new Map();

/**
 *
 * @param {(req: any, res: any) => Promise<any>} handler
 * @returns
 */
function idempotent(handler) {
  return async (req, res) => {
    const key = req.get("Idempotency-Key");
    if (!key)
      return sendErrorResponse(
        res,
        "Missing Idempotency-Key header",
        STATUS_CODES.BAD_REQUEST
      );
    if (seenIdemKeys.has(key)) return res.json(seenIdemKeys.get(key));
    try {
      const result = await handler(req, res);
      seenIdemKeys.set(key, result);
      return res.json(result);
    } catch (e) {
      return sendErrorResponse(res, e.message, STATUS_CODES.BAD_REQUEST);
    }
  };
}

module.exports = idempotent;
