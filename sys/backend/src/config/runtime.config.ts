import type { AuthUser } from '../auth/auth.types';

type RuntimeConfig = {
  port: number;
  frontendOrigin: string;
  frontendPublicUrl: string;
  backendPublicUrl: string;
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
  auth: {
    mode: 'mock' | 'portal';
    mockUser: AuthUser;
    portalCookieNames: string[];
    portalAllowedIssuers: string[];
    portalJwksUrl: string;
    portalLoginUrl: string;
    portalSessionUrls: string[];
    portalUserInfoUrls: string[];
    sessionCookieName: string;
    sessionCookieDomain: string;
    sessionCookieSecure: boolean;
    sessionTtlMs: number;
  };
};

function readNumber(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (!value || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function readString(
  value: string | undefined,
  fallback: string,
  name: string,
): string {
  const resolved = value?.trim() || fallback;
  if (resolved.length === 0) {
    throw new Error(`${name} must not be empty.`);
  }

  return resolved;
}

function readOptionalString(value: string | undefined): string {
  return value?.trim() ?? '';
}

function readBoolean(
  value: string | undefined,
  fallback: boolean,
  name: string,
): boolean {
  if (!value || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }

  throw new Error(`${name} must be "true" or "false".`);
}

function readCsv(
  value: string | undefined,
  fallback: string[],
  uniqueName: string,
): string[] {
  const source = value?.trim();
  if (!source) {
    return [...fallback];
  }

  const values = source
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (values.length === 0) {
    throw new Error(`${uniqueName} must contain at least one value when set.`);
  }

  return Array.from(new Set(values));
}

function readDurationMs(
  value: string | undefined,
  fallbackMs: number,
  name: string,
): number {
  if (!value || value.trim() === '') {
    return fallbackMs;
  }

  const normalized = value.trim().toLowerCase();
  const matched = normalized.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!matched) {
    throw new Error(`${name} must use ms, s, m, h or d units.`);
  }

  const amount = Number(matched[1]);
  const unit = matched[2];
  const unitMap: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return amount * unitMap[unit];
}

function readMockUser(value: string | undefined, fallback: AuthUser): AuthUser {
  if (!value || value.trim() === '') {
    return fallback;
  }

  const parsed = JSON.parse(value) as Partial<AuthUser>;
  if (!parsed.id || !parsed.email || !parsed.name) {
    throw new Error(
      'MOCK_AUTH_USER_JSON must include id, email and name properties.',
    );
  }

  return {
    id: parsed.id,
    email: parsed.email,
    name: parsed.name,
    role: parsed.role?.trim() || 'user',
  };
}

export function loadRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeConfig {
  const frontendPublicUrl = readString(
    env.FRONTEND_PUBLIC_URL,
    'http://localhost:3000',
    'FRONTEND_PUBLIC_URL',
  );
  const backendPublicUrl = readString(
    env.BACKEND_PUBLIC_URL,
    'http://localhost:8080',
    'BACKEND_PUBLIC_URL',
  );

  return {
    port: readNumber(env.PORT, 8080, 'PORT'),
    frontendOrigin: readString(
      env.FRONTEND_ORIGIN,
      frontendPublicUrl,
      'FRONTEND_ORIGIN',
    ),
    frontendPublicUrl,
    backendPublicUrl,
    database: {
      host: readString(env.DATABASE_HOST, 'localhost', 'DATABASE_HOST'),
      port: readNumber(env.DATABASE_PORT, 5432, 'DATABASE_PORT'),
      name: readString(env.DATABASE_NAME, 'demo02_ferms', 'DATABASE_NAME'),
      username: readString(env.DATABASE_USER, 'postgres', 'DATABASE_USER'),
      password: readString(
        env.DATABASE_PASSWORD,
        'postgres',
        'DATABASE_PASSWORD',
      ),
    },
    auth: {
      mode:
        readString(env.AUTH_MODE, 'mock', 'AUTH_MODE') === 'portal'
          ? 'portal'
          : 'mock',
      mockUser: readMockUser(env.MOCK_AUTH_USER_JSON, {
        id: 'demo02-user-001',
        email: 'demo02.user@local.test',
        name: 'Demo02 Local User',
        role: 'admin',
      }),
      portalCookieNames: readCsv(
        env.PORTAL_COOKIE_NAMES ?? env.PORTAL_COOKIE_NAME,
        ['portal_token'],
        'PORTAL_COOKIE_NAMES',
      ),
      portalAllowedIssuers: readCsv(
        env.PORTAL_ALLOWED_ISSUERS ?? env.PORTAL_ISSUER,
        ['https://tanoshimi.dev', 'https://api.tanoshimi.dev'],
        'PORTAL_ALLOWED_ISSUERS',
      ),
      portalJwksUrl: readOptionalString(env.PORTAL_JWKS_URL),
      portalLoginUrl: readOptionalString(env.PORTAL_LOGIN_URL),
      portalSessionUrls: readCsv(
        env.PORTAL_SESSION_URLS,
        [],
        'PORTAL_SESSION_URLS',
      ),
      portalUserInfoUrls: readCsv(
        env.PORTAL_USERINFO_URLS,
        [],
        'PORTAL_USERINFO_URLS',
      ),
      sessionCookieName: readString(
        env.SESSION_COOKIE_NAME,
        'demo02_ferms_session',
        'SESSION_COOKIE_NAME',
      ),
      sessionCookieDomain: readOptionalString(env.SESSION_COOKIE_DOMAIN),
      sessionCookieSecure: readBoolean(
        env.SESSION_COOKIE_SECURE,
        false,
        'SESSION_COOKIE_SECURE',
      ),
      sessionTtlMs: readDurationMs(env.SESSION_TTL, 43_200_000, 'SESSION_TTL'),
    },
  };
}

export type { RuntimeConfig };
