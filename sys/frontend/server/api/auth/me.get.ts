export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const response = await fetch(`${config.backendApiBaseUrl}/api/auth/me`, {
    headers: {
      accept: 'application/json',
      ...(getHeader(event, 'cookie')
        ? {
            cookie: getHeader(event, 'cookie') as string,
          }
        : {}),
    },
  });

  setResponseStatus(event, response.status);

  const payload = await response.text();
  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as unknown;
});
