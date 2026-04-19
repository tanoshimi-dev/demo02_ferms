import { requestBackend } from '../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: '/api/admin/equipments',
    method: 'POST',
    body: await readBody(event),
  }),
);
