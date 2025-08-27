const crypto = require("node:crypto");

function hashRequest(body) {
  return crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

module.exports = {
  hashRequest,
};
