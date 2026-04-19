import assert from 'node:assert/strict';
import test from 'node:test';

const frontendUrl = process.env.TEST_FRONTEND_URL ?? 'http://localhost:3000';
const backendUrl = process.env.TEST_BACKEND_URL ?? 'http://localhost:8080';

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response.text();
}

function extractCookie(setCookieHeader) {
  assert.ok(setCookieHeader, 'handover should set a session cookie');
  return setCookieHeader.split(';', 1)[0];
}

function createUniqueWindow(baseDayOffset) {
  const seedMs = Date.now() % 86_400_000;
  const startAt = new Date(
    Date.UTC(2030, 0, 1 + baseDayOffset) + seedMs * 180,
  );
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  return {
    startAt,
    endAt,
  };
}

async function createAuthenticatedSession() {
  const handoverResponse = await fetch(
    `${backendUrl}/api/auth/handover?returnTo=${encodeURIComponent(`${frontendUrl}/dashboard`)}`,
    {
      redirect: 'manual',
    },
  );

  assert.equal(handoverResponse.status, 302);
  return extractCookie(handoverResponse.headers.get('set-cookie'));
}

test('backend health endpoint responds with ok status', async () => {
  const health = await fetchJson(`${backendUrl}/api/health`);

  assert.equal(health.status, 'ok');
  assert.equal(health.services.api, 'ok');
  assert.equal(health.services.database, 'ok');
});

test('frontend landing page renders the foundation title', async () => {
  const html = await fetchText(frontendUrl);

  assert.match(html, /FERMS Reservation Demo/);
  assert.match(html, /認証引き継ぎを実行/);
});

test('frontend health proxy returns backend health payload', async () => {
  const health = await fetchJson(`${frontendUrl}/api/health`);

  assert.equal(health.status, 'ok');
  assert.equal(health.services.database, 'ok');
});

test('backend handover issues a local session and auth me resolves the mock user', async () => {
  const sessionCookie = await createAuthenticatedSession();
  const meResponse = await fetch(`${backendUrl}/api/auth/me`, {
    headers: {
      cookie: sessionCookie,
    },
  });

  assert.equal(meResponse.status, 200);
  const mePayload = await meResponse.json();
  assert.equal(mePayload.data.authenticated, true);
  assert.equal(mePayload.data.user.email, 'demo02.user@local.test');
});

test('frontend dashboard renders the authenticated user after handover', async () => {
  const sessionCookie = await createAuthenticatedSession();

  const html = await fetchText(`${frontendUrl}/dashboard`, {
    headers: {
      cookie: sessionCookie,
    },
  });

  assert.match(html, /予約と運用の開始点/);
  assert.match(html, /Demo02 Local User/);
});

test('reservation scenario works through started services', async () => {
  const sessionCookie = await createAuthenticatedSession();

  const facilitiesResponse = await fetch(`${backendUrl}/api/facilities`, {
    headers: {
      cookie: sessionCookie,
    },
  });
  assert.equal(facilitiesResponse.status, 200);
  const facilitiesPayload = await facilitiesResponse.json();
  const facility = facilitiesPayload.data.items.find((item) => item.isActive);
  assert.ok(facility);

  const facilityDetailResponse = await fetch(
    `${backendUrl}/api/facilities/${facility.id}`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.equal(facilityDetailResponse.status, 200);
  const facilityDetailPayload = await facilityDetailResponse.json();
  const equipment = facilityDetailPayload.data.facility.equipments.find(
    (item) => item.isActive,
  );
  assert.ok(equipment);

  const { startAt, endAt } = createUniqueWindow(0);

  const availabilityBefore = await fetch(
    `${backendUrl}/api/reservations/availability?facilityId=${facility.id}&equipmentId=${equipment.id}&startAt=${encodeURIComponent(startAt.toISOString())}&endAt=${encodeURIComponent(endAt.toISOString())}`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.equal(availabilityBefore.status, 200);
  const availabilityBeforePayload = await availabilityBefore.json();
  assert.equal(availabilityBeforePayload.data.available, true);

  const createReservationResponse = await fetch(`${backendUrl}/api/reservations`, {
    method: 'POST',
    headers: {
      cookie: sessionCookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      facilityId: facility.id,
      equipmentId: equipment.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      note: 'Smoke reservation',
    }),
  });
  assert.equal(createReservationResponse.status, 201);
  const createdReservationPayload = await createReservationResponse.json();
  const reservation = createdReservationPayload.data.reservation;
  assert.equal(reservation.status, 'reserved');

  const duplicateReservationResponse = await fetch(`${backendUrl}/api/reservations`, {
    method: 'POST',
    headers: {
      cookie: sessionCookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      facilityId: facility.id,
      equipmentId: equipment.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      note: 'Duplicate reservation',
    }),
  });
  assert.equal(duplicateReservationResponse.status, 409);

  const reservationsResponse = await fetch(`${backendUrl}/api/reservations`, {
    headers: {
      cookie: sessionCookie,
    },
  });
  assert.equal(reservationsResponse.status, 200);
  const reservationsPayload = await reservationsResponse.json();
  assert.ok(
    reservationsPayload.data.items.some((item) => item.id === reservation.id),
  );

  const reservationPageHtml = await fetchText(
    `${frontendUrl}/reservations/${reservation.id}?created=1`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.match(reservationPageHtml, /Reservation Detail/);
  assert.match(reservationPageHtml, /予約を作成しました/);
  assert.match(reservationPageHtml, /Smoke reservation/);

  const cancelReservationResponse = await fetch(
    `${backendUrl}/api/reservations/${reservation.id}/cancel`,
    {
      method: 'PATCH',
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.equal(cancelReservationResponse.status, 200);
  const cancelledReservationPayload = await cancelReservationResponse.json();
  assert.equal(cancelledReservationPayload.data.reservation.status, 'cancelled');

  const availabilityAfter = await fetch(
    `${backendUrl}/api/reservations/availability?facilityId=${facility.id}&equipmentId=${equipment.id}&startAt=${encodeURIComponent(startAt.toISOString())}&endAt=${encodeURIComponent(endAt.toISOString())}`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.equal(availabilityAfter.status, 200);
  const availabilityAfterPayload = await availabilityAfter.json();
  assert.equal(availabilityAfterPayload.data.available, true);
});

test('admin scenario works through started services', async () => {
  const sessionCookie = await createAuthenticatedSession();

  const adminPageHtml = await fetchText(`${frontendUrl}/admin`, {
    headers: {
      cookie: sessionCookie,
    },
  });
  assert.match(adminPageHtml, /管理運用ダッシュボード/);

  const adminFacilitiesPageHtml = await fetchText(`${frontendUrl}/admin/facilities`, {
    headers: {
      cookie: sessionCookie,
    },
  });
  assert.match(adminFacilitiesPageHtml, /施設管理/);

  const createFacilityResponse = await fetch(`${backendUrl}/api/admin/facilities`, {
    method: 'POST',
    headers: {
      cookie: sessionCookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Admin Smoke Facility',
      description: 'Admin created facility',
      location: 'Tokyo / Floor 9',
      isActive: true,
    }),
  });
  assert.equal(createFacilityResponse.status, 201);
  const createFacilityPayload = await createFacilityResponse.json();
  const facility = createFacilityPayload.data.facility;
  assert.equal(facility.name, 'Admin Smoke Facility');

  const createEquipmentResponse = await fetch(`${backendUrl}/api/admin/equipments`, {
    method: 'POST',
    headers: {
      cookie: sessionCookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      facilityId: facility.id,
      name: 'Admin Smoke Equipment',
      description: 'Admin created equipment',
      isActive: true,
    }),
  });
  assert.equal(createEquipmentResponse.status, 201);
  const createEquipmentPayload = await createEquipmentResponse.json();
  const equipment = createEquipmentPayload.data.equipment;
  assert.equal(equipment.name, 'Admin Smoke Equipment');

  const adminReservationsPageHtml = await fetchText(
    `${frontendUrl}/admin/reservations`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.match(adminReservationsPageHtml, /予約管理/);

  const { startAt, endAt } = createUniqueWindow(7);

  const createReservationResponse = await fetch(`${backendUrl}/api/reservations`, {
    method: 'POST',
    headers: {
      cookie: sessionCookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      facilityId: facility.id,
      equipmentId: equipment.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      note: 'Admin smoke reservation',
    }),
  });
  assert.equal(createReservationResponse.status, 201);
  const createReservationPayload = await createReservationResponse.json();
  const reservation = createReservationPayload.data.reservation;

  const adminReservationsResponse = await fetch(
    `${backendUrl}/api/admin/reservations?status=reserved&facilityId=${facility.id}`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.equal(adminReservationsResponse.status, 200);
  const adminReservationsPayload = await adminReservationsResponse.json();
  assert.ok(
    adminReservationsPayload.data.items.some((item) => item.id === reservation.id),
  );

  const updateReservationResponse = await fetch(
    `${backendUrl}/api/admin/reservations/${reservation.id}`,
    {
      method: 'PATCH',
      headers: {
        cookie: sessionCookie,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed',
        note: 'Completed by admin smoke',
      }),
    },
  );
  assert.equal(updateReservationResponse.status, 200);
  const updateReservationPayload = await updateReservationResponse.json();
  assert.equal(updateReservationPayload.data.reservation.status, 'completed');

  const updateEquipmentResponse = await fetch(
    `${backendUrl}/api/admin/equipments/${equipment.id}`,
    {
      method: 'PATCH',
      headers: {
        cookie: sessionCookie,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        isActive: false,
      }),
    },
  );
  assert.equal(updateEquipmentResponse.status, 200);

  const updateFacilityResponse = await fetch(
    `${backendUrl}/api/admin/facilities/${facility.id}`,
    {
      method: 'PATCH',
      headers: {
        cookie: sessionCookie,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        isActive: false,
      }),
    },
  );
  assert.equal(updateFacilityResponse.status, 200);

  const facilityDetailResponse = await fetch(
    `${backendUrl}/api/facilities/${facility.id}`,
    {
      headers: {
        cookie: sessionCookie,
      },
    },
  );
  assert.equal(facilityDetailResponse.status, 200);
  const facilityDetailPayload = await facilityDetailResponse.json();
  assert.equal(facilityDetailPayload.data.facility.isActive, false);
  assert.equal(
    facilityDetailPayload.data.facility.equipments[0].isActive,
    false,
  );

  const blockedReservationResponse = await fetch(`${backendUrl}/api/reservations`, {
    method: 'POST',
    headers: {
      cookie: sessionCookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      facilityId: facility.id,
      equipmentId: equipment.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      note: 'Blocked reservation',
    }),
  });
  assert.equal(blockedReservationResponse.status, 400);
});
