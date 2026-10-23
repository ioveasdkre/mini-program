const PUBLIC_PREFIXES = ['/_nuxt/', '/__nuxt', '/auth/', '/api/_auth/'];
const PUBLIC_PATHS = new Set(['/login', '/robots.txt', '/favicon.ico']);

export default defineEventHandler(async event => {
  const path = getRequestURL(event).pathname;

  if (PUBLIC_PATHS.has(path) || PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return;
  }

  const session = await getUserSession(event);
  if (session.user && isAllowedEmail(session.user.email)) {
    return;
  }

  // 白名單移除後，舊 session 要清掉，否則登入頁會一直被導回
  if (session.user) {
    await clearUserSession(event);
  }

  if (path.startsWith('/api/')) {
    throw createError({ statusCode: 401, message: '請先登入' });
  }

  return sendRedirect(event, '/login');
});
