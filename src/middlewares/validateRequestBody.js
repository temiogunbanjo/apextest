const STATUS_CODES = require("../constants/statusCodes");
const checkRequiredFields = require("../utils/checkRequiredFields");
const { sendErrorResponse } = require("../utils/sendResponses");

/**
 *
 * @param {string[]} requiredFields
 * @returns {(
 * req: import('express').Request,
 * res: import('express').Response,
 * next: import('express').NextFunction
 * ) => void}
 */
module.exports = function validateRequestBody(requiredFields) {
  return function (req, res, next) {
    const missingFields = checkRequiredFields(requiredFields, req.body);
    if (missingFields.length > 0) {
      return sendErrorResponse(
        res,
        `Missing required fields: ${missingFields.join(", ")}`,
        STATUS_CODES.BAD_REQUEST
      );
    }
    next();
  };
};
