type BackendHealthResponse = {
  name: string;
  status: string;
  timestamp: string;
  services: {
    api: string;
    database: string;
  };
};

function resolveStatusMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Backend health check failed.';
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const baseUrl = String(config.backendApiBaseUrl).replace(/\/$/, '');

  try {
    return await $fetch<BackendHealthResponse>(`${baseUrl}/api/health`, {
      retry: 0,
    });
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: resolveStatusMessage(error),
    });
  }
})
