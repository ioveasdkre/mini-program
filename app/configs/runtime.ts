const runtimeConfig = {
  // nuxt-auth-utils：session 以 httpOnly cookie 保存，限制有效期間
  session: {
    // 型別要求必填，實際值由環境變數 NUXT_SESSION_PASSWORD 提供
    password: '',
    maxAge: 60 * 60 * 24 * 7,
    cookie: { sameSite: 'lax' as const },
  },
  public: {
    // 客戶端可存取的變數
    isProduction: import.meta.env['NODE_ENV'] === 'production',
    baseUrl: import.meta.env['BASE_URL'] || '/',
    version: import.meta.env['VERSION'],
    versionDate: import.meta.env['VERSION_DATE'],
  },
};

export default runtimeConfig;
