import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthSession = {
  id: string;
  user: AuthUser;
  expiresAt: Date;
};

export type AuthProvider = {
  authenticate(request: Request): Promise<AuthUser>;
};

export type AuthenticatedRequest = Request & {
  currentUser?: AuthUser;
};
