export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    if (!user.email_verified || !isAllowedEmail(user.email)) {
      return sendRedirect(event, '/login?error=forbidden');
    }

    await setUserSession(event, {
      user: { email: user.email, name: user.name ?? user.email, picture: user.picture },
    });
    return sendRedirect(event, '/');
  },
  onError(event, error) {
    console.error('Google OAuth 失敗', error);
    return sendRedirect(event, '/login?error=oauth');
  },
});
