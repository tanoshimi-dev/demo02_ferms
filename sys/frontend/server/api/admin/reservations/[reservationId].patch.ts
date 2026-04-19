import { requestBackend } from '../../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: `/api/admin/reservations/${event.context.params!.reservationId}`,
    method: 'PATCH',
    body: await readBody(event),
  }),
);
