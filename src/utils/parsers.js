function parseIsoMessage(msg) {
  const [mti, cardNumber, amount, merchantId] = msg.split("|");
  return {
    mti,
    cardNumber,
    amount: Number(amount),
    merchantId,
  };
}

module.exports = {
  parseIsoMessage,
};
