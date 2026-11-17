// 只用於控制畫面顯示；實際權限一律由後端 isSuperAdminEmail / requireSuperAdmin 判斷
export const useSuperAdmin = () => {
  const { user } = useUserSession();
  const isSuperAdmin = computed(() => user.value?.isSuperAdmin === true);
  return { isSuperAdmin };
};
