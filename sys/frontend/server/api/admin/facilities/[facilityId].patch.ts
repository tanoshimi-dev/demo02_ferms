import { requestBackend } from '../../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: `/api/admin/facilities/${event.context.params!.facilityId}`,
    method: 'PATCH',
    body: await readBody(event),
  }),
);
