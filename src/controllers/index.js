const transactionControllers = require("./transactions");
const merchantControllers = require("./merchants");
const settlementControllers = require("./settlements");

module.exports = {
  getIndex: (_, res) => {
    return res.status(200).send("Welcome to the API");
  },
  ...merchantControllers,
  ...transactionControllers,
  ...settlementControllers,
};
