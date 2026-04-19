import { requestBackend } from '../utils/backend';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return requestBackend(event, {
    pathname: '/api/equipments',
    query: {
      facilityId:
        typeof query.facilityId === 'string' ? query.facilityId : undefined,
    },
  });
});
