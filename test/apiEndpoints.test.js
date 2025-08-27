const request = require("supertest");
const app = require("../src/app");

describe("API Endpoints", () => {
  describe("Health Check Endpoints", () => {
    test("GET / should return welcome message", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.text).toContain("Welcome to the API");
    });

    test("GET /health should return server status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.text).toContain("Server is up and running");
    });
  });

  describe("API v1 Endpoints", () => {
    test("GET /v1/merchants should return merchants list", async () => {
      const response = await request(app).get("/v1/merchants").expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("GET /v1/transactions should require authentication", async () => {
      const response = await request(app).get("/v1/transactions").expect(401);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(false);
    });

    test("GET /v1/transactions/:id/status should return transaction status", async () => {
      const response = await request(app)
        .get("/v1/transactions/1/status")
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    test("POST /v1/transactions/initiate should require isoMessage", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(false);
    });

    test("POST /v1/transactions/initiate should validate ISO message format", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .send({
          isoMessage: "invalid-format",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(false);
    });

    test("POST /v1/transactions/:id/authorize should require emvData", async () => {
      const response = await request(app)
        .post("/v1/transactions/1/authorize")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(false);
    });
  });

  describe("Request Validation", () => {
    test("should validate required fields in request body", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .send({
          currency: "NGN",
          // Missing isoMessage
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("isoMessage");
    });

    test("should validate ISO message format in transaction initiation", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .send({
          isoMessage: "0200|4111111111111111|1000.00", // Missing merchantId
        })
        .expect(400);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(false);
    });

    test("should validate EMV data in transaction authorization", async () => {
      const response = await request(app)
        .post("/v1/transactions/1/authorize")
        .send({
          emvData: "", // Empty EMV data
        })
        .expect(400);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(false);
    });
  });

  describe("Error Handling", () => {
    test("should handle 404 for non-existent endpoints", async () => {
      const response = await request(app)
        .get("/non-existent-endpoint")
        .expect(404);

      expect(response.body).toBeDefined();
    });

    test("should handle malformed JSON requests", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);

      expect(response.body).toBeDefined();
    });

    test("should handle requests with invalid content type", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .set("Content-Type", "text/plain")
        .send("plain text")
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });

  describe("CORS Configuration", () => {
    test("should handle preflight OPTIONS request", async () => {
      const response = await request(app)
        .options("/v1/merchants")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET")
        .set("Access-Control-Request-Headers", "Content-Type")
        .expect(204);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
      expect(response.headers).toHaveProperty("access-control-allow-methods");
    });

    test("should include CORS headers in response", async () => {
      const response = await request(app)
        .get("/v1/merchants")
        .set("Origin", "http://localhost:3000")
        .expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("Response Format", () => {
    test("successful responses should have consistent format", async () => {
      const response = await request(app).get("/v1/merchants").expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.success).toBe(true);
    });

    test("error responses should have consistent format", async () => {
      const response = await request(app)
        .post("/v1/transactions/initiate")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("error");
      expect(response.body.success).toBe(false);
    });
  });
});
