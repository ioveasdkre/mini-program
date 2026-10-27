import type { ModuleOptions } from 'nuxt-security';

const isProduction = process.env['NODE_ENV'] === 'production';

// 開發模式沿用模組預設的 CSP，避免擋住 Vite HMR
// cdn.jsdelivr.net 用於 mdi 圖示字型與工時計算器的假日資料
type SecurityHeaders = Exclude<ModuleOptions['headers'], false>;

const productionCsp: Exclude<SecurityHeaders['contentSecurityPolicy'], false | undefined> = {
  'base-uri': ["'none'"],
  'connect-src': ["'self'", 'https://cdn.jsdelivr.net'],
  'font-src': ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'none'"],
  'img-src': ["'self'", 'data:'],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  // https: 與 unsafe-inline 只是舊瀏覽器的後備，支援 strict-dynamic 的瀏覽器會忽略
  'script-src': ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'"],
  'script-src-attr': ["'none'"],
  // Vuetify 會輸出內聯 style
  'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'worker-src': ["'none'"],
  'upgrade-insecure-requests': true,
};

const securityConfig: Partial<ModuleOptions> = {
  nonce: true,
  enabled: true, // 啟用安全機制
  // 模組用 esbuild.drop 移除 console，Vite 8 會忽略，改在 nuxt.config.ts 用 Oxc 的 dropConsole
  removeLoggers: false,
  // xss 1.0.16 搭配 nuxt-security 2.6.0 會因 escapeHtml 為 undefined 而讓帶查詢參數的 GET 回 500
  xssValidator: {
    escapeHtml: false,
  },
  // 網站只服務自己的前端，不開放跨來源存取
  corsHandler: false,
  allowedMethodsRestricter: {
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    throwError: true,
  },
  // API 的資料都很小
  requestSizeLimiter: {
    maxRequestSizeInBytes: 100 * 1024,
    maxUploadFileRequestInBytes: 100 * 1024,
    throwError: true,
  },
  rateLimiter: {
    tokensPerInterval: 150,
    interval: 5 * 60 * 1000,
    throwError: true,
  },
  headers: {
    ...(isProduction ? { contentSecurityPolicy: productionCsp } : {}),

    // 強制 HTTPS（一年）
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubdomains: true,
      preload: false,
    },

    // 限制權限 (Permissions-Policy)
    permissionsPolicy: {
      accelerometer: [],
      autoplay: [],
      camera: [],
      'display-capture': [],
      'encrypted-media': [],
      gyroscope: [],
      magnetometer: [],
      microphone: [],
      midi: [],
      payment: [],
      'picture-in-picture': [],
      'publickey-credentials-get': [],
      'sync-xhr': ['self'],
      usb: [],
      'xr-spatial-tracking': [],
      geolocation: [],
    },

    // 限制 Referrer Policy
    referrerPolicy: 'strict-origin-when-cross-origin',

    // 防止 MIME 類型嗅探
    xContentTypeOptions: 'nosniff',

    // 防止點擊劫持 (與 CSP 的 frame-ancestors 互補)
    xFrameOptions: 'DENY',

    // 禁止 Flash 允許跨域請求
    xPermittedCrossDomainPolicies: 'none',

    // XSS 保護：舊的 XSS Auditor 已被認定可能造成漏洞，建議關閉，改由 CSP 負責
    xXSSProtection: '0',
  },
};

// 登入與 API 不可被快取，且整個網站不讓搜尋引擎索引
export const securityRouteRules = {
  '/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
  '/auth/**': {
    headers: { 'cache-control': 'no-store' },
    // 登入流程限制更嚴格，降低暴力嘗試
    security: { rateLimiter: { tokensPerInterval: 20, interval: 60 * 1000 } },
  },
  '/api/**': { headers: { 'cache-control': 'no-store' } },
};

export default securityConfig;
