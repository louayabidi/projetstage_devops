const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/usersModel'); // Adjust path if needed
const bcrypt = require('bcrypt');

describe('Authentication & Authorization', () => {
  let testUser;
  const testEmail = 'louay@test.com';
  const testPassword = '123456';

  beforeAll(async () => {
    // Create test user (in-memory DB is ready via preset)
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: hashedPassword,
      phoneNumber: '123456789',
      role: 'passenger',
      age: 25,
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: testEmail });
  });

  it('should reject requests to /api/users/me without JWT', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.statusCode).toBe(401);
  }, 10000);

  it('should reject requests with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
  }, 10000);

  it('should allow requests with valid JWT', async () => {
    const loginRes = await request(app)
      .post('/api/auth/signin')
      .send({ email: testEmail, password: testPassword });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');

    const token = loginRes.body.token;
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    // Fixed: Check nested user object for email
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.user).toHaveProperty('email', testEmail);
  }, 10000);
});