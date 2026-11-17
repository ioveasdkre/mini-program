declare module '#auth-utils' {
  interface User {
    email: string;
    name: string;
    picture?: string;
    // 僅供前端顯示用，後端權限判斷仍以環境變數為準
    isSuperAdmin: boolean;
  }
}

export {};
