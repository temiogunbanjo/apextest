const { parseIsoMessage } = require("../src/utils/parsers");

describe("Parsers", () => {
  describe("parseIsoMessage", () => {
    test("should parse valid ISO message correctly", () => {
      const isoMessage = "0200|4111111111111111|1000.00|merchant-uuid-123";
      const result = parseIsoMessage(isoMessage);

      expect(result).toEqual({
        mti: "0200",
        cardNumber: "4111111111111111",
        amount: 1000.0,
        merchantId: "merchant-uuid-123",
      });
    });

    test("should parse different MTI values", () => {
      const testCases = [
        {
          input: "0220|5555555555554444|500.50|merchant-uuid-456",
          expected: {
            mti: "0220",
            cardNumber: "5555555555554444",
            amount: 500.5,
            merchantId: "merchant-uuid-456",
          },
        },
        {
          input: "0400|378282246310005|2500.75|merchant-uuid-789",
          expected: {
            mti: "0400",
            cardNumber: "378282246310005",
            amount: 2500.75,
            merchantId: "merchant-uuid-789",
          },
        },
        {
          input: "0420|4111111111111111|100.25|merchant-uuid-abc",
          expected: {
            mti: "0420",
            cardNumber: "4111111111111111",
            amount: 100.25,
            merchantId: "merchant-uuid-abc",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parseIsoMessage(input);
        expect(result).toEqual(expected);
      });
    });

    test("should handle different amount formats", () => {
      const testCases = [
        {
          input: "0200|4111111111111111|1000|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 1000,
            merchantId: "merchant-uuid-123",
          },
        },
        {
          input: "0200|4111111111111111|1000.50|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 1000.5,
            merchantId: "merchant-uuid-123",
          },
        },
        {
          input: "0200|4111111111111111|0.99|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 0.99,
            merchantId: "merchant-uuid-123",
          },
        },
        {
          input: "0200|4111111111111111|999999.99|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 999999.99,
            merchantId: "merchant-uuid-123",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parseIsoMessage(input);
        expect(result).toEqual(expected);
      });
    });

    test("should handle different card number formats", () => {
      const testCases = [
        {
          input: "0200|4111111111111111|1000.00|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 1000.0,
            merchantId: "merchant-uuid-123",
          },
        },
        {
          input: "0200|5555555555554444|1000.00|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "5555555555554444",
            amount: 1000.0,
            merchantId: "merchant-uuid-123",
          },
        },
        {
          input: "0200|378282246310005|1000.00|merchant-uuid-123",
          expected: {
            mti: "0200",
            cardNumber: "378282246310005",
            amount: 1000.0,
            merchantId: "merchant-uuid-123",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parseIsoMessage(input);
        expect(result).toEqual(expected);
      });
    });

    test("should handle different merchant ID formats", () => {
      const testCases = [
        {
          input: "0200|4111111111111111|1000.00|merchant-123",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 1000.0,
            merchantId: "merchant-123",
          },
        },
        {
          input: "0200|4111111111111111|1000.00|merchant_uuid_456",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 1000.0,
            merchantId: "merchant_uuid_456",
          },
        },
        {
          input: "0200|4111111111111111|1000.00|merchant.uuid.789",
          expected: {
            mti: "0200",
            cardNumber: "4111111111111111",
            amount: 1000.0,
            merchantId: "merchant.uuid.789",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parseIsoMessage(input);
        expect(result).toEqual(expected);
      });
    });

    test("should ensure amount is converted to number", () => {
      const result = parseIsoMessage(
        "0200|4111111111111111|1000.00|merchant-123"
      );

      expect(typeof result.amount).toBe("number");
      expect(result.amount).toBe(1000.0);

      // Test with integer
      const result2 = parseIsoMessage(
        "0200|4111111111111111|1000|merchant-123"
      );
      expect(typeof result2.amount).toBe("number");
      expect(result2.amount).toBe(1000);
    });

    test("should preserve string values for non-numeric fields", () => {
      const result = parseIsoMessage(
        "0200|4111111111111111|1000.00|merchant-123"
      );

      expect(typeof result.mti).toBe("string");
      expect(typeof result.cardNumber).toBe("string");
      expect(typeof result.merchantId).toBe("string");

      expect(result.mti).toBe("0200");
      expect(result.cardNumber).toBe("4111111111111111");
      expect(result.merchantId).toBe("merchant-123");
    });
  });
});
