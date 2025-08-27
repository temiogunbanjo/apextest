const { sendErrorResponse } = require("../utils/sendResponses");

module.exports = (req, res, next) => {
  const authKey = req.headers["authorization"];

  if (!authKey) {
    return sendErrorResponse(res, "Authorization header missing", 401);
  }
  
  next();
};
