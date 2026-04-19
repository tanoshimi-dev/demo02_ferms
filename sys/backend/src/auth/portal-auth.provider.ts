import {
  createPublicKey,
  createVerify,
  KeyObject,
  type JsonWebKey as CryptoJsonWebKey,
} from 'crypto';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { RuntimeConfig } from '../config/runtime.config';
import { UnauthenticatedError } from './auth.errors';
import {
  extractAuthUser,
  normalizeIssuer,
  parseCookieHeader,
  resolveRole,
} from './auth.helpers';
import type { AuthProvider, AuthUser } from './auth.types';

type PortalJwtHeader = {
  alg?: string;
  kid?: string;
};

type PortalJwtClaims = {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
  iss?: string;
  exp?: number | string;
};

type JwksResponse = {
  keys?: Array<{
    kty?: string;
    kid?: string;
    alg?: string;
    use?: string;
    n?: string;
    e?: string;
  }>;
};

@Injectable()
export class PortalAuthProvider implements AuthProvider {
  private readonly cookieNames: string[];
  private readonly allowedIssuers: string[];
  private readonly jwksUrl: string;
  private readonly sessionUrls: string[];
  private readonly userInfoUrls: string[];
  private readonly jwksCache = new Map<string, KeyObject>();
  private fetchedAt = 0;
  private readonly cacheTtlMs = 300_000;

  constructor(config: RuntimeConfig) {
    if (!config.auth.portalJwksUrl.trim()) {
      throw new Error('PORTAL_JWKS_URL is required when AUTH_MODE=portal.');
    }

    this.cookieNames = [...config.auth.portalCookieNames];
    this.allowedIssuers = config.auth.portalAllowedIssuers.map(normalizeIssuer);
    this.jwksUrl = config.auth.portalJwksUrl;
    this.sessionUrls = [...config.auth.portalSessionUrls];
    this.userInfoUrls = [...config.auth.portalUserInfoUrls];
  }

  async authenticate(request: Request): Promise<AuthUser> {
    const cookies = parseCookieHeader(request.headers.cookie);
    const rawToken = this.cookieNames
      .map((cookieName) => cookies[cookieName])
      .find((value) => value && value.trim().length > 0);

    if (rawToken) {
      try {
        return await this.validateToken(rawToken);
      } catch {
        // Fall through to compatibility fallbacks below.
      }
    }

    if (request.headers.cookie && this.sessionUrls.length > 0) {
      const sessionUser = await this.fetchUserFromEndpoints(
        this.sessionUrls,
        request.headers.cookie,
        rawToken,
      );
      if (sessionUser) {
        return sessionUser;
      }
    }

    if (rawToken && this.userInfoUrls.length > 0) {
      const userInfoUser = await this.fetchUserInfo(rawToken);
      if (userInfoUser) {
        return userInfoUser;
      }
    }

    throw new UnauthenticatedError();
  }

  private async validateToken(rawToken: string): Promise<AuthUser> {
    const segments = rawToken.split('.');
    if (segments.length !== 3) {
      throw new Error('invalid jwt segment count');
    }

    const header = this.decodeSegment<PortalJwtHeader>(segments[0]);
    if (header.alg !== 'RS256' || !header.kid?.trim()) {
      throw new Error('invalid jwt header');
    }

    const publicKey = await this.publicKeyForKeyId(header.kid);
    const verified = createVerify('RSA-SHA256');
    verified.update(`${segments[0]}.${segments[1]}`);
    verified.end();

    const signature = Buffer.from(segments[2], 'base64url');
    if (!verified.verify(publicKey, signature)) {
      throw new Error('invalid jwt signature');
    }

    const claims = this.decodeSegment<PortalJwtClaims>(segments[1]);
    if (!claims.sub?.trim() || !claims.email?.trim() || !claims.name?.trim()) {
      throw new Error('required claims missing');
    }

    if (
      !claims.iss ||
      !this.allowedIssuers.includes(normalizeIssuer(claims.iss))
    ) {
      throw new Error('unexpected issuer');
    }

    const expiresAt = Number(claims.exp);
    if (!Number.isFinite(expiresAt) || expiresAt * 1000 <= Date.now()) {
      throw new Error('expired token');
    }

    return {
      id: claims.sub.trim(),
      email: claims.email.trim(),
      name: claims.name.trim(),
      role: resolveRole(claims.role, claims.roles),
    };
  }

  private decodeSegment<T>(segment: string): T {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  }

  private async publicKeyForKeyId(keyId: string): Promise<KeyObject> {
    if (
      this.jwksCache.size > 0 &&
      Date.now() - this.fetchedAt < this.cacheTtlMs &&
      this.jwksCache.has(keyId)
    ) {
      return this.jwksCache.get(keyId)!;
    }

    const response = await fetch(this.jwksUrl, {
      headers: {
        accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`failed to fetch jwks: ${response.status}`);
    }

    const payload = (await response.json()) as JwksResponse;
    const nextCache = new Map<string, KeyObject>();

    for (const key of payload.keys ?? []) {
      if (
        key.kty !== 'RSA' ||
        !key.kid?.trim() ||
        !key.n?.trim() ||
        !key.e?.trim()
      ) {
        continue;
      }

      const jwk: CryptoJsonWebKey = {
        kty: 'RSA',
        n: key.n,
        e: key.e,
      };

      nextCache.set(key.kid, createPublicKey({ key: jwk, format: 'jwk' }));
    }

    this.jwksCache.clear();
    nextCache.forEach((value, cacheKey) => {
      this.jwksCache.set(cacheKey, value);
    });
    this.fetchedAt = Date.now();

    const publicKey = this.jwksCache.get(keyId);
    if (!publicKey) {
      throw new Error(`jwks key not found: ${keyId}`);
    }

    return publicKey;
  }

  private async fetchUserFromEndpoints(
    urls: string[],
    cookieHeader: string,
    rawToken?: string,
  ): Promise<AuthUser | null> {
    for (const endpoint of urls) {
      for (const method of ['GET', 'POST']) {
        const response = await fetch(endpoint, {
          method,
          headers: {
            accept: 'application/json',
            cookie: cookieHeader,
            ...(rawToken
              ? {
                  authorization: `Bearer ${rawToken}`,
                }
              : {}),
          },
        });

        if (!response.ok) {
          continue;
        }

        const payload = (await response.json()) as unknown;
        const user = extractAuthUser(payload);
        if (user) {
          return user;
        }
      }
    }

    return null;
  }

  private async fetchUserInfo(rawToken: string): Promise<AuthUser | null> {
    for (const endpoint of this.userInfoUrls) {
      const response = await fetch(endpoint, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${rawToken}`,
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as unknown;
      const user = extractAuthUser(payload);
      if (user) {
        return user;
      }
    }

    return null;
  }
}
