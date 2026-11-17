import { sendRedirect } from 'nuxt/server';

// nuxt-auth-utils v0.6 的 callback event 為 nuxt/server 的 RequestEvent，需改用 nuxt/server 的工具函式
export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    if (!user.email_verified || !isAllowedEmail(user.email)) {
      return sendRedirect(event, '/login?error=forbidden');
    }

    await setUserSession(event, {
      user: {
        email: user.email,
        name: user.name ?? user.email,
        picture: user.picture,
        isSuperAdmin: isSuperAdminEmail(user.email),
      },
    });
    return sendRedirect(event, '/');
  },
  onError(event, error) {
    console.error('Google OAuth 失敗', error);
    return sendRedirect(event, '/login?error=oauth');
  },
});
