import { requestBackend } from '../../utils/backend';

export default defineEventHandler(async (event) =>
  requestBackend(event, {
    pathname: `/api/facilities/${getRouterParam(event, 'facilityId')}`,
  }),
);
