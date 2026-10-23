import type { H3Event } from 'h3';

export const isAllowedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;

  const allowed = (process.env['ALLOWED_EMAILS'] ?? '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.toLowerCase());
};

// API 內再次驗證，不單靠 middleware
export const requireAllowedUser = async (event: H3Event) => {
  const session = await getUserSession(event);
  const user = session.user;

  if (!user) {
    throw createError({ statusCode: 401, message: '請先登入' });
  }
  if (!isAllowedEmail(user.email)) {
    throw createError({ statusCode: 403, message: '沒有權限' });
  }

  return user;
};
