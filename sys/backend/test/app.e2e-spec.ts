import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type CreateFacilityResponseBody = {
  data: {
    facility: {
      id: string;
    };
  };
};

type CreateEquipmentResponseBody = {
  data: {
    equipment: {
      id: string;
      facilityId: string;
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

function createUniqueWindow() {
  const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  return {
    startAt,
    endAt,
  };
}

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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: false,
      }),
    );
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

    const suffix = Date.now().toString();

    const createFacilityResponse = await request(app.getHttpServer())
      .post('/api/admin/facilities')
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .send({
        name: `E2E Facility ${suffix}`,
        description: 'Facility for reservation e2e',
        location: 'Tokyo / E2E',
        isActive: true,
      })
      .expect(201);

    const createFacilityBody =
      createFacilityResponse.body as CreateFacilityResponseBody;
    const facilityId = createFacilityBody.data.facility.id;
    expect(facilityId).toBeTruthy();

    const createEquipmentResponse = await request(app.getHttpServer())
      .post('/api/admin/equipments')
      .set('Cookie', handoverResponse.headers['set-cookie'])
      .send({
        facilityId,
        name: `E2E Equipment ${suffix}`,
        description: 'Equipment for reservation e2e',
        isActive: true,
      })
      .expect(201);

    const createEquipmentBody =
      createEquipmentResponse.body as CreateEquipmentResponseBody;
    const equipmentId = createEquipmentBody.data.equipment.id;
    expect(equipmentId).toBeTruthy();

    const { startAt, endAt } = createUniqueWindow();

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
