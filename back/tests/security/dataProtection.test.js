const request = require('supertest');
const app = require('../../app');

describe('Data protection', () => {
  it('should not return password in /api/users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true); // Check the 'users' array inside the response object
    res.body.users.forEach(user => {
      expect(user).not.toHaveProperty('password');
    });
  }, 10000);
});