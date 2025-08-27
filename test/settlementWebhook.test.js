const request = require("supertest");
const app = require("../src/app");

// Mock the database operations
jest.mock("../src/db/merchants");
jest.mock("../src/db/transactions");
jest.mock("../src/db/settlements");
jest.mock("../src/events/logger");

const { fetchMerchantById } = require("../src/db/merchants");
const { createSettlement, updateSettlement } = require("../src/db/settlements");
const { updateTransaction } = require("../src/db/transactions");
const { validateWebhookPayload } = require("../src/utils/validators");
const { generateWebhookSignature } = require("../src/utils/generators");

describe("Settlement Webhook", () => {
  const mockMerchant = {
    id: "merchant-uuid-123",
    name: "Test Merchant",
    email: "test@merchant.com",
  };

  const mockSettlement = {
    id: "settlement-uuid-456",
    merchantId: "merchant-uuid-123",
    totalAmount: 5000.0,
    settlementDate: "2024-01-15",
    reference: "SETT-2024-001",
    status: "pending",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set webhook secret for testing
    process.env.WEBHOOK_SECRET = "test-webhook-secret";
  });

  describe("Webhook Signature Verification", () => {
    test("should verify valid webhook signature", () => {
      const payload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "initiated",
        timestamp: new Date().toISOString(),
      };

      const signature = generateWebhookSignature(
        payload,
        "test-webhook-secret"
      );

      const isValid = validateWebhookPayload(payload);

      expect(isValid.isValid).toBe(true);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe("string");
    });

    test("should reject invalid webhook payload", () => {
      const invalidPayloads = [
        {}, // Empty payload
        { settlementId: "settlement-uuid-456" }, // Missing required fields
        {
          settlementId: "settlement-uuid-456",
          merchantId: "merchant-uuid-123",
          totalAmount: "invalid-amount", // Invalid amount
          settlementDate: "2024-01-15",
          status: "initiated",
        },
        {
          settlementId: "settlement-uuid-456",
          merchantId: "merchant-uuid-123",
          totalAmount: 5000.0,
          settlementDate: "invalid-date", // Invalid date
          status: "initiated",
        },
        {
          settlementId: "settlement-uuid-456",
          merchantId: "merchant-uuid-123",
          totalAmount: 5000.0,
          settlementDate: "2024-01-15",
          status: "invalid-status", // Invalid status
        },
      ];

      invalidPayloads.forEach((payload) => {
        const validation = validateWebhookPayload(payload);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Settlement Initiation Webhook", () => {
    test("should process settlement initiation webhook successfully", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        reference: "SETT-2024-001",
        status: "initiated",
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            reference: "SETT-2024-001",
            status: "initiated",
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);

      // Mock settlement creation
      createSettlement.mockResolvedValue(mockSettlement);

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settlementId).toBe("settlement-uuid-456");
      expect(response.body.data.status).toBe("initiated");
      expect(createSettlement).toHaveBeenCalledWith({
        id: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        reference: "SETT-2024-001",
        status: "pending",
      });
    });

    test("should reject webhook with invalid signature", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "initiated",
        signature: "invalid-signature",
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid webhook signature");
    });

    test("should reject webhook for non-existent merchant", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "non-existent-merchant",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "initiated",
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "non-existent-merchant",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            status: "initiated",
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant not found
      fetchMerchantById.mockResolvedValue(null);

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Merchant not found");
    });
  });

  describe("Settlement Processing Webhook", () => {
    test("should process settlement processing webhook successfully", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "processing",
        transactionIds: ["123", "124", "125"],
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            status: "processing",
            transactionIds: ["123", "124", "125"],
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);

      // Mock settlement update
      updateSettlement.mockResolvedValue({
        ...mockSettlement,
        status: "processing",
      });

      // Mock transaction updates
      updateTransaction.mockResolvedValue({ id: "123", status: "settled" });

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("processing");
      expect(updateSettlement).toHaveBeenCalledWith("settlement-uuid-456", {
        status: "processing",
      });
      expect(updateTransaction).toHaveBeenCalledTimes(3); // Called for each transaction ID
    });
  });

  describe("Settlement Completion Webhook", () => {
    test("should process settlement completion webhook successfully", async () => {
      const completedAt = new Date().toISOString();
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        reference: "SETT-2024-001",
        status: "completed",
        completedAt,
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            reference: "SETT-2024-001",
            status: "completed",
            completedAt,
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);

      // Mock settlement update
      updateSettlement.mockResolvedValue({
        ...mockSettlement,
        status: "completed",
        completedAt,
      });

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("completed");
      expect(updateSettlement).toHaveBeenCalledWith("settlement-uuid-456", {
        status: "completed",
        completedAt,
      });
    });
  });

  describe("Settlement Failure Webhook", () => {
    test("should process settlement failure webhook successfully", async () => {
      const failedAt = new Date().toISOString();
      const failureReason = "Insufficient funds";
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "failed",
        failureReason,
        failedAt,
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            status: "failed",
            failureReason,
            failedAt,
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);

      // Mock settlement update
      updateSettlement.mockResolvedValue({
        ...mockSettlement,
        status: "failed",
        failureReason,
        failedAt,
      });

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("failed");
      expect(updateSettlement).toHaveBeenCalledWith("settlement-uuid-456", {
        status: "failed",
        failureReason,
        failedAt,
      });
    });
  });

  describe("Webhook Rate Limiting", () => {
    test("should enforce rate limiting on webhook endpoints", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "initiated",
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            status: "initiated",
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);
      createSettlement.mockResolvedValue(mockSettlement);

      // Send multiple requests to trigger rate limiting
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post("/v1/settlements/webhook")
          .send(webhookPayload)
          .expect(200);
      }

      // The 11th request should be rate limited
      const rateLimitedResponse = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(429);

      expect(rateLimitedResponse.body.success).toBe(false);
      expect(rateLimitedResponse.body.error).toContain(
        "Too many webhook requests"
      );
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "initiated",
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            status: "initiated",
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);

      // Mock database error
      createSettlement.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Internal server error");
    });

    test("should handle invalid webhook status", async () => {
      const webhookPayload = {
        settlementId: "settlement-uuid-456",
        merchantId: "merchant-uuid-123",
        totalAmount: 5000.0,
        settlementDate: "2024-01-15",
        status: "invalid-status",
        signature: generateWebhookSignature(
          {
            settlementId: "settlement-uuid-456",
            merchantId: "merchant-uuid-123",
            totalAmount: 5000.0,
            settlementDate: "2024-01-15",
            status: "invalid-status",
          },
          "test-webhook-secret"
        ),
        timestamp: new Date().toISOString(),
      };

      // Mock merchant fetch
      fetchMerchantById.mockResolvedValue(mockMerchant);

      const response = await request(app)
        .post("/v1/settlements/webhook")
        .send(webhookPayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid settlement status");
    });
  });
});
