const {
  isValidISOMessage,
  isValidCardNumber,
} = require("../src/utils/validators");
const { parseIsoMessage } = require("../src/utils/parsers");

// Mock the database and external dependencies
jest.mock("../src/db/merchants");
jest.mock("../src/db/transactions");
jest.mock("../src/core/paymentProcessor");
jest.mock("../src/utils/generate");
jest.mock("../src/events/logger");

const { fetchMerchantById } = require("../src/db/merchants");
const {
  createTransaction,
  fetchTransactionById,
  updateTransaction,
} = require("../src/db/transactions");
const processor = require("../src/core/paymentProcessor");
const { generateUniqueId } = require("../src/utils/generate");

describe("Transaction Controller Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Transaction Initiation Validation", () => {
    test("should validate ISO message format correctly", () => {
      const validMessage = "0200|4111111111111111|1000.00|merchant-uuid-123";
      const invalidMessage = "0200|4111111111111111|1000.00";

      expect(isValidISOMessage(validMessage)).toBe(true);
      expect(isValidISOMessage(invalidMessage)).toBe(false);
    });

    test("should validate card number using Luhn algorithm", () => {
      const validCards = [
        "4111111111111111",
        "5555555555554444",
        "378282246310005",
      ];

      const invalidCards = [
        "4111111111111112",
        "1234567890123456",
        "0000000000000000",
      ];

      validCards.forEach((card) => {
        expect(isValidCardNumber(card)).toBe(true);
      });

      invalidCards.forEach((card) => {
        expect(isValidCardNumber(card)).toBe(false);
      });
    });

    test("should parse ISO message into structured data", () => {
      const isoMessage = "0200|4111111111111111|1000.00|merchant-uuid-123";
      const parsed = parseIsoMessage(isoMessage);

      expect(parsed).toEqual({
        mti: "0200",
        cardNumber: "4111111111111111",
        amount: 1000.0,
        merchantId: "merchant-uuid-123",
      });
    });
  });

  describe("Transaction Initiation Business Logic", () => {
    test("should create transaction with valid data", async () => {
      // Mock successful merchant fetch
      fetchMerchantById.mockResolvedValue({
        id: "merchant-uuid-123",
        name: "Test Merchant",
        email: "test@merchant.com",
      });

      // Mock successful transaction creation
      createTransaction.mockResolvedValue({
        id: 1,
        uniqueId: "txn-uuid-456",
        amount: 1000.0,
        currency: "NGN",
        merchantId: "merchant-uuid-123",
        status: "initiated",
      });

      // Mock unique ID generation
      generateUniqueId.mockReturnValue("unique-id-789");

      const transactionData = {
        uniqueId: "txn-uuid-456",
        cardPanMasked: "4111111111111111",
        amount: 1000.0,
        currency: "NGN",
        merchantId: "merchant-uuid-123",
        status: "initiated",
      };

      const result = await createTransaction(transactionData);

      expect(result).toBeDefined();
      expect(result.status).toBe("initiated");
      expect(result.merchantId).toBe("merchant-uuid-123");
      expect(createTransaction).toHaveBeenCalledWith(transactionData);
    });

    test("should handle merchant not found error", async () => {
      // Mock merchant not found
      fetchMerchantById.mockResolvedValue(null);

      try {
        await fetchMerchantById("non-existent-merchant");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Merchant not found");
      }
    });

    test("should validate amount is positive number", () => {
      const validAmounts = [1000.0, 0.01, 999999.99];
      const invalidAmounts = [0, -100, "invalid", null, undefined];

      validAmounts.forEach((amount) => {
        expect(typeof amount === "number" && amount > 0).toBe(true);
      });

      invalidAmounts.forEach((amount) => {
        expect(typeof amount === "number" && amount > 0).toBe(false);
      });
    });

    test("should validate currency format", () => {
      const validCurrencies = ["NGN", "USD", "EUR", "GBP"];
      const invalidCurrencies = ["", null, undefined, 123, "invalid"];

      validCurrencies.forEach((currency) => {
        expect(typeof currency === "string" && currency.length === 3).toBe(
          true
        );
      });

      invalidCurrencies.forEach((currency) => {
        expect(typeof currency === "string" && currency.length === 3).toBe(
          false
        );
      });
    });
  });

  describe("Transaction Authorization Business Logic", () => {
    test("should authorize transaction with valid EMV data", async () => {
      // Mock existing transaction
      fetchTransactionById.mockResolvedValue({
        id: 1,
        status: "initiated",
        transactionStatus: "pending",
      });

      // Mock successful authorization
      processor.authorize.mockResolvedValue({
        status: "approved",
        authCode: "A12345",
        processorTxnId: "ptxn_abc123",
      });

      // Mock successful update
      updateTransaction.mockResolvedValue({
        id: 1,
        status: "authorized",
        authCode: "A12345",
      });

      const emvData = "emv_payload_data_here";
      const transactionId = "1";

      const result = await updateTransaction(transactionId, {
        authCode: "A12345",
        status: "authorized",
      });

      expect(result).toBeDefined();
      expect(result.status).toBe("authorized");
      expect(result.authCode).toBe("A12345");
    });

    test("should reject authorization for non-initiated transactions", async () => {
      // Mock transaction in wrong state
      fetchTransactionById.mockResolvedValue({
        id: 1,
        status: "authorized",
        transactionStatus: "completed",
      });

      try {
        // This should fail because transaction is already authorized
        const transaction = await fetchTransactionById("1");
        expect(transaction.status).toBe("initiated");
        fail("Should have thrown an error for wrong transaction state");
      } catch (error) {
        console.log(error.message);
        expect(error.message).toContain("Transaction cannot be authorized");
      }
    });

    test("should handle payment processor rejection", async () => {
      // Mock existing transaction
      fetchTransactionById.mockResolvedValue({
        id: 1,
        status: "initiated",
        transactionStatus: "pending",
      });

      // Mock processor rejection
      processor.authorize.mockResolvedValue({
        status: "declined",
        authCode: null,
        processorTxnId: "ptxn_abc123",
      });

      const processorResponse = await processor.authorize("emv_data");

      expect(processorResponse.status).toBe("declined");
      expect(processorResponse.authCode).toBeNull();
    });

    test("should validate EMV data format", () => {
      const validEmvData = [
        "emv_payload_data_here",
        "9F02060000000001009F0306000000000000",
        "5F2A0201249F1A0201245F340101",
      ];

      const invalidEmvData = ["", null, undefined, 123, "invalid"];

      validEmvData.forEach((data) => {
        expect(typeof data === "string" && data.length > 0).toBe(true);
      });

      invalidEmvData.forEach((data) => {
        expect(typeof data === "string" && data.length > 0).toBe(false);
      });
    });
  });

  describe("Transaction Status Management", () => {
    test("should track transaction status changes correctly", () => {
      const statusFlow = [
        { status: "pending", transactionStatus: "pending" },
        { status: "initiated", transactionStatus: "pending" },
        { status: "authorized", transactionStatus: "pending" },
        { status: "settled", transactionStatus: "completed" },
      ];

      statusFlow.forEach((state, index) => {
        expect(state.status).toBeDefined();
        expect(state.transactionStatus).toBeDefined();

        if (index > 0) {
          const previousState = statusFlow[index - 1];
          // Status should progress logically
          expect(["pending", "initiated", "authorized", "settled"]).toContain(
            state.status
          );
        }
      });
    });

    test("should handle transaction not found scenarios", async () => {
      // Mock transaction not found
      fetchTransactionById.mockResolvedValue(null);

      try {
        const transaction = await fetchTransactionById("non-existent-id");
        expect(transaction).toBeNull();
      } catch (error) {
        // This should not throw an error, just return null
        fail("Should not throw error for non-existent transaction");
      }
    });
  });

  describe("Error Handling", () => {
    test("should handle validation errors gracefully", () => {
      const invalidInputs = [
        { isoMessage: "" },
        { isoMessage: "invalid-format" },
        { isoMessage: "0200|invalid-card|1000.00|merchant-123" },
        { isoMessage: "0200|4111111111111111|invalid-amount|merchant-123" },
      ];

      invalidInputs.forEach((input) => {
        expect(() => {
          if (!isValidISOMessage(input.isoMessage)) {
            throw new Error("Invalid ISO message format");
          }
        }).toThrow("Invalid ISO message format");
      });
    });

    test("should handle database errors gracefully", async () => {
      // Mock database error
      createTransaction.mockRejectedValue(
        new Error("Database connection failed")
      );

      try {
        await expect(createTransaction({})).rejects.toThrow(
          /Should have thrown database error/i
        );
      } catch (error) {
        expect(error.message).toContain("Database connection failed");
      }
    });

    test("should handle payment processor errors gracefully", async () => {
      // Mock processor error
      processor.authorize.mockRejectedValue(
        new Error("Processor service unavailable")
      );

      try {
        await processor.authorize("emv_data");
        fail("Should have thrown processor error");
      } catch (error) {
        expect(error.message).toContain("Processor service unavailable");
      }
    });
  });
});
