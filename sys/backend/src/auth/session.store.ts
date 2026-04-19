import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { AuthSession, AuthUser } from './auth.types';

@Injectable()
export class SessionStore {
  private readonly sessions = new Map<string, AuthSession>();

  create(user: AuthUser, ttlMs: number): AuthSession {
    const session: AuthSession = {
      id: randomBytes(32).toString('hex'),
      user,
      expiresAt: new Date(Date.now() + ttlMs),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string | undefined): AuthSession | null {
    if (!sessionId) {
      return null;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  delete(sessionId: string | undefined): void {
    if (!sessionId) {
      return;
    }

    this.sessions.delete(sessionId);
  }
}
