const runtimeConfig = {
  // nuxt-auth-utils：session 以 httpOnly cookie 保存，限制有效期間（加密金鑰由環境變數 NUXT_APP_SECRET 提供）
  session: {
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
