require('dotenv').config();
const request = require("supertest");
const app = require("../app.js");


describe("Health check route", () => {
  test("GET /health should return 200", async () => {
    await request(app).get("/health").expect(200);
  });
});
