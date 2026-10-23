export default defineNuxtRouteMiddleware(to => {
  const { loggedIn } = useUserSession();

  // 真正的權限檢查在伺服器端，這裡只負責 session 過期後的導向
  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});
