import { requestBackend } from '../../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: `/api/admin/equipments/${event.context.params!.equipmentId}`,
    method: 'PATCH',
    body: await readBody(event),
  }),
);
