import { MockAuthProvider } from './mock-auth.provider';

describe('MockAuthProvider', () => {
  it('returns the configured mock user', async () => {
    const provider = new MockAuthProvider({
      id: 'demo02-user-001',
      email: 'demo02.user@local.test',
      name: 'Demo02 Local User',
      role: 'admin',
    });

    await expect(provider.authenticate({} as never)).resolves.toEqual({
      id: 'demo02-user-001',
      email: 'demo02.user@local.test',
      name: 'Demo02 Local User',
      role: 'admin',
    });
  });
});
