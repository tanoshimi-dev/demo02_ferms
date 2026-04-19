import { requestBackend } from '../../utils/backend';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return requestBackend(event, {
    pathname: '/api/reservations/availability',
    query: {
      facilityId:
        typeof query.facilityId === 'string' ? query.facilityId : undefined,
      equipmentId:
        typeof query.equipmentId === 'string' ? query.equipmentId : undefined,
      startAt: typeof query.startAt === 'string' ? query.startAt : undefined,
      endAt: typeof query.endAt === 'string' ? query.endAt : undefined,
    },
  });
});
