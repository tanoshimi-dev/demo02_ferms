import { Inject, Injectable } from '@nestjs/common';
import type { CookieOptions, Request } from 'express';
import {
  loadRuntimeConfig,
  type RuntimeConfig,
} from '../config/runtime.config';
import { AUTH_PROVIDER } from './auth.constants';
import { UnauthenticatedError } from './auth.errors';
import { parseCookieHeader } from './auth.helpers';
import { SessionStore } from './session.store';
import type { AuthProvider, AuthSession, AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PROVIDER)
    private readonly provider: AuthProvider,
    private readonly sessionStore: SessionStore,
    @Inject('RUNTIME_CONFIG')
    private readonly runtimeConfig: RuntimeConfig = loadRuntimeConfig(),
  ) {}

  async handover(request: Request): Promise<AuthSession> {
    const user = await this.provider.authenticate(request);
    return this.sessionStore.create(user, this.runtimeConfig.auth.sessionTtlMs);
  }

  currentSession(request: Request): AuthSession | null {
    const cookies = parseCookieHeader(request.headers.cookie);
    return this.sessionStore.get(
      cookies[this.runtimeConfig.auth.sessionCookieName],
    );
  }

  async currentUser(request: Request): Promise<AuthUser | null> {
    const currentSession = this.currentSession(request);
    if (currentSession) {
      return currentSession.user;
    }

    if (this.runtimeConfig.auth.mode !== 'portal') {
      return null;
    }

    try {
      return await this.provider.authenticate(request);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return null;
      }
      throw error;
    }
  }

  requireSessionUser(request: Request): AuthUser {
    const currentSession = this.currentSession(request);
    if (!currentSession) {
      throw new UnauthenticatedError();
    }

    return currentSession.user;
  }

  clearSession(request: Request): void {
    const currentSession = this.currentSession(request);
    this.sessionStore.delete(currentSession?.id);
  }

  buildSessionCookie(session: AuthSession): CookieOptions {
    return {
      domain: this.runtimeConfig.auth.sessionCookieDomain || undefined,
      expires: session.expiresAt,
      httpOnly: true,
      maxAge: Math.max(session.expiresAt.getTime() - Date.now(), 0),
      path: '/',
      sameSite: 'lax',
      secure: this.runtimeConfig.auth.sessionCookieSecure,
    };
  }

  buildExpiredCookie(): CookieOptions {
    return {
      domain: this.runtimeConfig.auth.sessionCookieDomain || undefined,
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: this.runtimeConfig.auth.sessionCookieSecure,
    };
  }

  getSessionCookieName(): string {
    return this.runtimeConfig.auth.sessionCookieName;
  }

  sanitizeReturnTo(rawReturnTo: string | undefined): string {
    const fallback = this.runtimeConfig.frontendPublicUrl;
    const trimmed = rawReturnTo?.trim();
    if (!trimmed) {
      return fallback;
    }

    try {
      const resolved = new URL(trimmed, fallback);
      const frontend = new URL(fallback);

      if (!['http:', 'https:'].includes(resolved.protocol)) {
        return fallback;
      }

      if (resolved.origin !== frontend.origin) {
        return fallback;
      }

      return resolved.toString();
    } catch {
      return fallback;
    }
  }

  buildPortalLoginUrl(rawReturnTo: string | undefined): string {
    if (this.runtimeConfig.auth.mode !== 'portal') {
      return this.sanitizeReturnTo(rawReturnTo);
    }

    const portalLoginUrl = this.runtimeConfig.auth.portalLoginUrl.trim();
    if (!portalLoginUrl) {
      return this.sanitizeReturnTo(rawReturnTo);
    }

    const loginUrl = new URL(portalLoginUrl);
    loginUrl.searchParams.set('returnTo', this.sanitizeReturnTo(rawReturnTo));
    return loginUrl.toString();
  }

  buildPortalLogoutUrl(rawReturnTo: string | undefined): string {
    if (this.runtimeConfig.auth.mode !== 'portal') {
      return this.sanitizeReturnTo(rawReturnTo);
    }

    const portalLoginUrl = this.runtimeConfig.auth.portalLoginUrl.trim();
    const returnTo = this.sanitizeReturnTo(rawReturnTo);
    if (!portalLoginUrl) {
      return returnTo;
    }

    const logoutUrl = new URL(portalLoginUrl);
    logoutUrl.pathname = '/auth/logout';
    logoutUrl.search = '';
    logoutUrl.searchParams.set('returnTo', returnTo);
    return logoutUrl.toString();
  }

  shouldRedirectToPortalLogin(error: unknown): boolean {
    return (
      this.runtimeConfig.auth.mode === 'portal' &&
      error instanceof UnauthenticatedError
    );
  }
}
