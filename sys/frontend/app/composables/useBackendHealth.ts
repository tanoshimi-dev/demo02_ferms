type HealthResponse = {
  name: string;
  status: string;
  timestamp: string;
  services: {
    api: string;
    database: string;
  };
};

export async function useBackendHealth() {
  return await useFetch<HealthResponse>('/api/health', {
    key: 'backend-health',
    server: true,
    retry: 0,
  });
}
