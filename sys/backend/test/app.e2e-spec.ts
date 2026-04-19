import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.AUTH_MODE = 'mock';
    process.env.FRONTEND_PUBLIC_URL = 'http://localhost:3000';
    process.env.FRONTEND_ORIGIN = 'http://localhost:3000';
    process.env.SESSION_COOKIE_NAME = 'demo02_ferms_session';
    process.env.MOCK_AUTH_USER_JSON = JSON.stringify({
      id: 'demo02-user-001',
      email: 'demo02.user@local.test',
      name: 'Demo02 Local User',
      role: 'admin',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer()).get('/api').expect(200).expect({
      name: 'demo02_ferms-backend',
      status: 'running',
    });
  });

  it('/api/auth/handover -> /api/auth/me (GET)', async () => {
    const handoverResponse = await request(app.getHttpServer())
      .get('/api/auth/handover')
      .query({
        returnTo: '/dashboard',
      })
      .expect(302);

    expect(handoverResponse.headers.location).toBe(
      'http://localhost:3000/dashboard',
    );
    expect(handoverResponse.headers['set-cookie'][0]).toContain(
      'demo02_ferms_session=',
    );

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .expect(200)
      .expect({
        data: {
          authenticated: true,
          user: {
            id: 'demo02-user-001',
            email: 'demo02.user@local.test',
            name: 'Demo02 Local User',
            role: 'admin',
          },
        },
      });
  });
});
