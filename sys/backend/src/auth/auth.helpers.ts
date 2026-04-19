import type { AuthUser } from './auth.types';

export function parseCookieHeader(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .reduce<Record<string, string>>((cookies, entry) => {
      const separatorIndex = entry.indexOf('=');
      if (separatorIndex < 0) {
        return cookies;
      }

      const name = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      if (name.length > 0) {
        cookies[name] = value;
      }
      return cookies;
    }, {});
}

export function normalizeIssuer(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function resolveRole(
  role: string | undefined,
  roles: string[] | undefined,
): string {
  if (role?.trim()) {
    return role.trim();
  }

  const firstRole = roles?.find((entry) => entry.trim().length > 0);
  return firstRole?.trim() || 'user';
}

export function readAuthUser(candidate: unknown): AuthUser | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const source = candidate as Record<string, unknown>;
  const id = typeof source.id === 'string' ? source.id.trim() : '';
  const email = typeof source.email === 'string' ? source.email.trim() : '';
  const name = typeof source.name === 'string' ? source.name.trim() : '';
  const role =
    typeof source.role === 'string' && source.role.trim().length > 0
      ? source.role.trim()
      : 'user';

  if (!id || !email || !name) {
    return null;
  }

  return {
    id,
    email,
    name,
    role,
  };
}

export function extractAuthUser(payload: unknown): AuthUser | null {
  const directUser = readAuthUser(payload);
  if (directUser) {
    return directUser;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = payload as Record<string, unknown>;
  const nestedUser = readAuthUser(source.user);
  if (nestedUser) {
    return nestedUser;
  }

  if (source.data && typeof source.data === 'object') {
    return readAuthUser((source.data as Record<string, unknown>).user);
  }

  return null;
}
