import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { RuntimeConfig } from '../config/runtime.config';
import type { AuthProvider, AuthUser } from './auth.types';

@Injectable()
export class MockAuthProvider implements AuthProvider {
  constructor(private readonly user: AuthUser) {}

  static fromConfig(config: RuntimeConfig): MockAuthProvider {
    return new MockAuthProvider(config.auth.mockUser);
  }

  authenticate(request: Request): Promise<AuthUser> {
    void request;
    return Promise.resolve({ ...this.user });
  }
}
