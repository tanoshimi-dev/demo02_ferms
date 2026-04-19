import { requestBackend } from '../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: '/api/admin/reservations',
    query: {
      facilityId: getQuery(event).facilityId?.toString(),
      userId: getQuery(event).userId?.toString(),
      status: getQuery(event).status?.toString(),
    },
  }),
);
