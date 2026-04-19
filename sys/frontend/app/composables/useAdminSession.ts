export async function useAdminSession(options?: {
  returnTo?: string;
}) {
  const session = await useAuthSession({
    required: true,
    returnTo: options?.returnTo,
  });

  if (
    session.authState.value.authenticated &&
    session.authState.value.user.role !== 'admin'
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: '管理者権限が必要です。',
    });
  }

  return session;
}
