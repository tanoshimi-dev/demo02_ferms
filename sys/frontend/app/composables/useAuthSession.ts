type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthState =
  | {
      authenticated: true;
      user: AuthUser;
    }
  | {
      authenticated: false;
    };

type AuthMeResponse = {
  data: Extract<AuthState, { authenticated: true }>;
};

function buildAuthUrl(
  backendPublicUrl: string,
  pathname: string,
  returnTo: string,
): string {
  const url = new URL(pathname, backendPublicUrl);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}

export async function useAuthSession(options?: {
  required?: boolean;
  returnTo?: string;
}) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const currentReturnTo = new URL(
    options?.returnTo ?? route.fullPath,
    config.public.frontendPublicUrl,
  ).toString();

  const { data, error } = await useFetch<AuthMeResponse | null>('/api/auth/me', {
    key: 'auth-session',
    retry: 0,
    default: () => null,
  });

  const authState = computed<AuthState>(() => {
    if (data.value?.data?.authenticated) {
      return data.value.data;
    }

    return {
      authenticated: false,
    };
  });

  const handoverUrl = computed(() =>
    buildAuthUrl(
      config.public.backendPublicUrl,
      '/api/auth/handover',
      currentReturnTo,
    ),
  );
  const logoutUrl = computed(() =>
    buildAuthUrl(
      config.public.backendPublicUrl,
      '/api/auth/logout',
      currentReturnTo,
    ),
  );
  const errorMessage = computed(() => {
    if (!error.value || authState.value.authenticated) {
      return undefined;
    }

    if (error.value.statusCode === 401) {
      return undefined;
    }

    return '認証状態の取得に失敗しました。バックエンドの起動状態を確認してください。';
  });

  if (options?.required && !authState.value.authenticated) {
    await navigateTo(handoverUrl.value, {
      external: true,
      redirectCode: 302,
    });
  }

  return {
    authState,
    errorMessage,
    handoverUrl,
    logoutUrl,
  };
}
