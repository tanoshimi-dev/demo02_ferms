import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type FacilitiesResponseBody = {
  data: {
    items: Array<{
      id: string;
    }>;
  };
};

type FacilityDetailResponseBody = {
  data: {
    facility: {
      equipments: Array<{
        id: string;
      }>;
    };
  };
};

type CreateReservationResponseBody = {
  data: {
    reservation: {
      id: string;
    };
  };
};

type CancelReservationResponseBody = {
  data: {
    reservation: {
      status: string;
    };
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.AUTH_MODE = 'mock';
    process.env.FRONTEND_PUBLIC_URL = 'http://localhost:3000';
    process.env.FRONTEND_ORIGIN = 'http://localhost:3000';
    process.env.SESSION_COOKIE_NAME = 'demo02_ferms_session';
    process.env.DATABASE_SYNCHRONIZE = 'true';
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

  it('/api/reservations lifecycle (POST/PATCH)', async () => {
    const handoverResponse = await request(app.getHttpServer())
      .get('/api/auth/handover')
      .query({
        returnTo: '/dashboard',
      })
      .expect(302);

    const facilitiesResponse = await request(app.getHttpServer())
      .get('/api/facilities')
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .expect(200);

    const facilitiesBody = facilitiesResponse.body as FacilitiesResponseBody;
    const facilityId = facilitiesBody.data.items[0]?.id;
    expect(facilityId).toBeTruthy();

    const facilityDetailResponse = await request(app.getHttpServer())
      .get(`/api/facilities/${facilityId}`)
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .expect(200);

    const facilityDetailBody =
      facilityDetailResponse.body as FacilityDetailResponseBody;
    const equipmentId = facilityDetailBody.data.facility.equipments[0]?.id;
    expect(equipmentId).toBeTruthy();
    const startAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    startAt.setMinutes(0, 0, 0);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

    const createResponse = await request(app.getHttpServer())
      .post('/api/reservations')
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .send({
        facilityId,
        equipmentId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        note: 'E2E reservation',
      })
      .expect(201);

    const createBody = createResponse.body as CreateReservationResponseBody;
    const reservationId = createBody.data.reservation.id;

    await request(app.getHttpServer())
      .post('/api/reservations')
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .send({
        facilityId,
        equipmentId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .expect(200)
      .expect(({ body }) => {
        const cancelBody = body as CancelReservationResponseBody;
        expect(cancelBody.data.reservation.status).toBe('cancelled');
      });
  });
});
