const STATUS_CODES = require("../constants/statusCodes");

const sendSuccessResponse = (
  res,
  data,
  statusCode = STATUS_CODES.OK
) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const sendErrorResponse = (
  res,
  errorMessage,
  statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR
) => {
  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
};

const sendIdempotentSuccessResponse = (
  data,
  statusCode = STATUS_CODES.OK
) => {
  return {
    code: statusCode,
    success: true,
    data,
  };
};

const sendIdempotentErrorResponse = (
  errorMessage,
  statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR
) => {
  return {
    code: statusCode,
    success: false,
    error: errorMessage,
  };
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendIdempotentSuccessResponse,
  sendIdempotentErrorResponse
};
