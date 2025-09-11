const request = require('supertest');
const app = require('../../app');

describe('Injection attacks', () => {
  it('should reject NoSQL injection in signin', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: { $gt: '' }, password: '123456' });
    expect(res.statusCode).toBe(400); // Now validated
  }, 10000);

  it('should reject SQL injection in signin', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: "' OR 1=1 --", password: '123456' });
    expect(res.statusCode).toBe(400); // Now validated
  }, 10000);
});