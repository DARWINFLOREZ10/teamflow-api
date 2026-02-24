import request from 'supertest';
import { app } from '../src/app';

describe('Authentication API', () => {
  it('returns 400 when login payload is invalid', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'invalid-email',
      password: '123'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('returns 401 when protected route is called without token', async () => {
    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Missing bearer token');
  });
});
