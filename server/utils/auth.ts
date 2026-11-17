import type { H3Event } from 'h3';

const parseEmails = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

export const isSuperAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return parseEmails(process.env['SUPER_ADMIN_EMAILS']).includes(email.toLowerCase());
};

// 最高權限管理員視同在白名單內
export const isAllowedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return (
    parseEmails(process.env['ALLOWED_EMAILS']).includes(email.toLowerCase()) ||
    isSuperAdminEmail(email)
  );
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

// 一律以環境變數判斷，不信任 session 內的 isSuperAdmin
export const requireSuperAdmin = async (event: H3Event) => {
  const user = await requireAllowedUser(event);
  if (!isSuperAdminEmail(user.email)) {
    throw createError({ statusCode: 403, message: '需要最高權限' });
  }
  return user;
};
