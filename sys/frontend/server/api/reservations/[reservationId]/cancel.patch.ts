import { requestBackend } from '../../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: `/api/reservations/${getRouterParam(event, 'reservationId')}/cancel`,
    method: 'PATCH',
  }),
);
