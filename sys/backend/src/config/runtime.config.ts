type RuntimeConfig = {
  port: number;
  frontendOrigin: string;
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
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

export function loadRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeConfig {
  return {
    port: readNumber(env.PORT, 8080, 'PORT'),
    frontendOrigin: readString(
      env.FRONTEND_ORIGIN,
      'http://localhost:3000',
      'FRONTEND_ORIGIN',
    ),
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
  };
}

export type { RuntimeConfig };
