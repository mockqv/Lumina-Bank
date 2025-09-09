import request from 'supertest';
import { app } from '@/app.js';
import { server } from '@/index.js';

describe('GET /', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Lumina Bank API is running!');
  });
});
