const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logDir = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "transactions.log");

function logger(event, payload = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event, // e.g. "payment.authorized"
    ...payload, // spreads in transaction payload like id, amount, etc.
  };

  const logLine = JSON.stringify(entry) + "\n";

  // Console output for quick debugging
  console.log(`[${entry.timestamp}] ${event}`, payload);

  // Append structured JSON to file
  fs.appendFileSync(logFile, logLine, "utf8");
}

module.exports = logger;
