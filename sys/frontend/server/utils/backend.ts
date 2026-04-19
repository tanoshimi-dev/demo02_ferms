import type { H3Event } from 'h3';

type RequestBackendOptions = {
  pathname: string;
  method?: 'GET' | 'POST' | 'PATCH';
  query?: Record<string, string | undefined>;
  body?: unknown;
};

export async function requestBackend(
  event: H3Event,
  options: RequestBackendOptions,
) {
  const config = useRuntimeConfig(event);
  const url = new URL(options.pathname, config.backendApiBaseUrl);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (typeof value === 'string' && value.length > 0) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      accept: 'application/json',
      ...(getHeader(event, 'cookie')
        ? {
            cookie: getHeader(event, 'cookie') as string,
          }
        : {}),
      ...(options.body
        ? {
            'content-type': 'application/json',
          }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  setResponseStatus(event, response.status);

  const payload = await response.text();
  return payload ? (JSON.parse(payload) as unknown) : null;
}
