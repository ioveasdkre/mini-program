import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

export default defineNuxtPlugin(nuxtApp => {
  // 創建一個新的 QueryClient
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 設置預設選項
        staleTime: 5 * 60 * 1000, // 5 分鐘
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, {
    queryClient,
  });
});
