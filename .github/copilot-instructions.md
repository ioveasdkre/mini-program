# GitHub Copilot 指令 - 陳俊生小程式工具平台

## 專案概述

Nuxt 4 + Vue 3 + TypeScript + Vuetify 的 **SPA 應用程式**（SSR 已停用）。這是一個提供多個實用計算器的工具平台（工時計算、存錢計算、日期範圍計算等）。UI 語言為**繁體中文**。

## 核心架構

### 目錄結構

- **`app/`** - 主要程式碼目錄（非標準 `src/`）
  - `app/configs/` - 集中式配置檔案（runtime、security、vuetify、veeValidate）
  - `app/components/` - Vue 元件，含 `shared/` 子目錄放共用元件（如 `PageHeader.vue`）
  - `app/pages/` - Nuxt 頁面路由
  - `app/layouts/` - 應用程式版面配置
  - `app/utils/` - 工具函式（如 `logger.ts`）
  - `app/plugins/` - Nuxt 外掛（如 `vuetify.ts`）
- **路徑別名**: `@/*` 和 `~/*` 指向 `./app/*`

### 配置管理模式

所有配置模組化於 `app/configs/` 並統一從 `index.ts` 匯出：

```typescript
import { runtimeConfig, securityConfig, veeValidateConfig, vuetifyConfig } from './app/configs';
```

在 `nuxt.config.ts` 中直接使用這些配置物件。

### TypeScript 嚴格模式

專案啟用多個嚴格 TypeScript 選項：

- `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`
- 絕不使用 `any`，優先使用明確型別或 `unknown`

## 開發規範

### Vue 元件約定

1. **使用 Composition API** 與 `<script setup lang="ts">`（無選項式 API）
2. **自閉合標籤強制執行** - 所有標籤必須自閉合：
   ```vue
   <v-btn />
   <!-- 正確 -->
   <br />
   <!-- 正確，包含 HTML void 元素 -->
   ```
3. **型別定義** - 使用 `interface` 定義 props（如 `interface Props { icon: string; ... }`）
4. **Vuetify 元件** - 廣泛使用 Material Design 元件（`<v-card>`, `<v-btn>`, `<v-text-field>` 等）
5. **圖示命名** - 使用 Material Design Icons: `mdi-calendar-range`, `mdi-calculator` 等

### 程式碼風格

- **語言**: UI 文字、註釋、變數名使用**繁體中文**
- **格式化**: Prettier 使用 `.prettierrc.json` 配置
- **Linting**: ESLint 設定於 `eslint.config.mjs`（繼承 Nuxt 配置）
- **Pre-commit**: Husky + lint-staged 自動格式化暫存檔案（`npm run precommit`）

### 日誌記錄

使用 `app/utils/logger.ts` 的 `appLogger`（基於 consola）：

```typescript
import { appLogger } from '@/utils/logger';
appLogger.info('message'); // 生產環境自動禁用
```

## 常用命令

```bash
npm run dev          # 開發伺服器 (localhost:3000)
npm run build        # 生產建置
npm run typecheck    # TypeScript 型別檢查
npm run lint         # ESLint 檢查
npm run format       # Prettier 格式化
npm run precommit    # 手動執行 pre-commit（自動由 Husky 觸發）
```

## 關鍵依賴與整合

- **Vuetify** - Material Design UI 框架，配置於 `vuetify.config.ts`，樣式設定檔為 `app/assets/settings.scss`
- **VeeValidate** - 表單驗證，元件重命名為 `VeeForm`, `VeeField` 等
- **Pinia** - 狀態管理（`@pinia/nuxt`）
- **VueUse** - Composables 工具集
- **Nuxt Security** - 安全標頭（CSP 目前註解，但 Permissions-Policy、X-Frame-Options 等已啟用）
- **TanStack Vue Query** - 資料獲取（客戶端外掛 `vue-query.client.ts`）

## 安全與建置

- **生產環境**: `console` 與 `debugger` 於建置時自動移除（Vite esbuild 配置）
- **Nonce**: 安全模組啟用 nonce，用於內聯腳本/樣式
- **SPA 模式**: 無伺服器端渲染（`ssr: false`）

## 範例元件結構

```vue
<template>
  <PageHeader icon="mdi-calculator" title="標題" description="描述" />
  <v-card elevation="3">
    <v-card-text>
      <!-- 內容 -->
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  // 型別定義
}

const props = defineProps<Props>();
const count = ref(0);
const computed = computed(() => count.value * 2);
</script>
```

## 注意事項

- 新增頁面時，記得更新 `app/layouts/default.vue` 的導航列
- 配置變更需修改 `app/configs/` 對應檔案，而非直接寫在 `nuxt.config.ts`
- 此專案**無伺服器端程式碼**，所有邏輯運行於客戶端
- 環境變數透過 `runtimeConfig.public.*` 存取（參見 `app/configs/runtime.ts`）
