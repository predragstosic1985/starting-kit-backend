import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'Starting Kit Backend');
      });
  });

  describe('Authentication Protected Endpoints', () => {
    it('/users (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });

    it('/users/profile (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('/users (POST) - should require authentication', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Test User', email: 'test@example.com' })
        .expect(401);
    });
  });
});
