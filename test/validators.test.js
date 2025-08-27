const {
  isValidCardNumber,
  isValidISOMessage,
  checkRequiredFields,
} = require("../src/utils/validators");

describe("Validators", () => {
  describe("isValidCardNumber", () => {
    test("should validate valid Visa card numbers", () => {
      const validVisaCards = [
        "4111111111111111",
        "4005555555554444",
        "4012888888881881",
        "4222222222222",
      ];

      validVisaCards.forEach((card) => {
        console.log(card, isValidCardNumber(card));
        expect(isValidCardNumber(card)).toBe(true);
      });
    });

    test("should validate valid Mastercard numbers", () => {
      const validMastercards = [
        "5555555555554444",
        "5105105105105100",
        "5105105105105100",
      ];

      validMastercards.forEach((card) => {
        expect(isValidCardNumber(card)).toBe(true);
      });
    });

    test("should validate valid American Express numbers", () => {
      const validAmexCards = [
        "378282246310005",
        "371449635398431",
        "378734493671000",
      ];

      validAmexCards.forEach((card) => {
        expect(isValidCardNumber(card)).toBe(true);
      });
    });

    test("should handle card numbers with spaces and dashes", () => {
      const formattedCards = [
        "4111 1111 1111 1111",
        "4111-1111-1111-1111",
        "4111 1111-1111 1111",
      ];

      formattedCards.forEach((card) => {
        expect(isValidCardNumber(card)).toBe(true);
      });
    });

    test("should reject invalid card numbers", () => {
      const invalidCards = [
        "4111111111111112", // Invalid checksum
        "1234567890123456", // Invalid checksum
        "0000000000000000", // Invalid checksum
        "411111111111111", // Too short
        "41111111111111111",
      ];

      invalidCards.forEach((card) => {
        expect(isValidCardNumber(card)).toBe(false);
      });
    });

    test("should handle edge cases", () => {
      expect(isValidCardNumber("")).toBe(false);
      expect(isValidCardNumber(null)).toBe(false);
      expect(isValidCardNumber(undefined)).toBe(false);
      expect(isValidCardNumber("abc")).toBe(false);
    });

    test("should validate Luhn algorithm correctly", () => {
      // Test the Luhn algorithm with known valid/invalid numbers
      expect(isValidCardNumber("79927398713")).toBe(true); // Valid Luhn number
      expect(isValidCardNumber("79927398714")).toBe(false); // Invalid Luhn number
    });
  });

  describe("isValidISOMessage", () => {
    test("should validate correct ISO message format", () => {
      const validMessages = [
        "0200|4111111111111111|1000.00|merchant-uuid-123",
        "0220|5555555555554444|500.50|merchant-uuid-456",
        "0400|378282246310005|2500.75|merchant-uuid-789",
      ];

      validMessages.forEach((msg) => {
        expect(isValidISOMessage(msg)).toBe(true);
      });
    });

    test("should reject incomplete ISO messages", () => {
      const invalidMessages = [
        "0200|4111111111111111|1000.00", // Missing merchantId
        "0200|4111111111111111", // Missing amount and merchantId
        "0200", // Only MTI
        "|4111111111111111|1000.00|merchant-uuid-123", // Missing MTI
        "0200||1000.00|merchant-uuid-123", // Empty cardNumber
        "0200|4111111111111111||merchant-uuid-123", // Empty amount
      ];

      invalidMessages.forEach((msg) => {
        expect(isValidISOMessage(msg)).toBe(false);
      });
    });

    test("should handle edge cases", () => {
      expect(isValidISOMessage("")).toBe(false);
      expect(isValidISOMessage(null)).toBe(false);
      expect(isValidISOMessage(undefined)).toBe(false);
      expect(isValidISOMessage("invalid-format")).toBe(false);
    });

    test("should validate different MTI values", () => {
      const validMTIs = [
        "0200|4111111111111111|1000.00|merchant-uuid-123", // Authorization
        "0220|4111111111111111|1000.00|merchant-uuid-123", // Authorization Response
        "0400|4111111111111111|1000.00|merchant-uuid-123", // Reversal
        "0420|4111111111111111|1000.00|merchant-uuid-123", // Reversal Response
      ];

      validMTIs.forEach((msg) => {
        expect(isValidISOMessage(msg)).toBe(true);
      });
    });
  });

  describe("checkRequiredFields", () => {
    test("should return empty array when all required fields are present", () => {
      const obj = { name: "John", age: 30, email: "john@example.com" };
      const requiredFields = ["name", "age", "email"];

      const missing = checkRequiredFields(requiredFields, obj);
      expect(missing).toEqual([]);
    });

    test("should return missing field names when some are absent", () => {
      const obj = { name: "John", age: 30 };
      const requiredFields = ["name", "age", "email", "phone"];

      const missing = checkRequiredFields(requiredFields, obj);
      expect(missing).toEqual(["email", "phone"]);
    });

    test("should return all required fields when object is empty", () => {
      const obj = {};
      const requiredFields = ["name", "age", "email"];

      const missing = checkRequiredFields(requiredFields, obj);
      expect(missing).toEqual(["name", "age", "email"]);
    });

    test("should handle null and undefined values", () => {
      const obj = { name: null, age: undefined, email: "john@example.com" };
      const requiredFields = ["name", "age", "email"];

      const missing = checkRequiredFields(requiredFields, obj);
      expect(missing).toEqual([]); // null and undefined are considered present
    });

    test("should handle empty required fields array", () => {
      const obj = { name: "John", age: 30 };
      const requiredFields = [];

      const missing = checkRequiredFields(requiredFields, obj);
      expect(missing).toEqual([]);
    });

    test("should handle empty object with required fields", () => {
      const obj = {};
      const requiredFields = ["name", "age"];

      const missing = checkRequiredFields(requiredFields, obj);
      expect(missing).toEqual(["name", "age"]);
    });
  });
});
