const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// 補強 SameSite cookie：拒絕跨站來源的寫入請求
export default defineEventHandler(event => {
  if (SAFE_METHODS.has(getMethod(event))) return;

  const forbidden = () => createError({ statusCode: 403, message: '來源不符' });

  if (getRequestHeader(event, 'sec-fetch-site') === 'cross-site') throw forbidden();

  const origin = getRequestHeader(event, 'origin');
  if (!origin) return;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw forbidden();
  }

  if (originHost !== getRequestHost(event, { xForwardedHost: true })) throw forbidden();
});
