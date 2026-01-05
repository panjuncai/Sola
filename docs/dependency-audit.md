## 阶段 0：依赖梳理结果（初版）

更新时间：2026-01-xx

### 入口 Provider / 全局上下文
- `apps/web/src/main.tsx`
  - `trpc.Provider`
  - `QueryClientProvider`
- 说明：全局 Provider 目前只保留 tRPC 与 React Query，符合“避免高频状态入 Context”原则。

### 组件级 Context
- `apps/web/src/components/article/SentenceItem.tsx`
  - `SentenceItemContext` + `SentenceItemProvider`
  - 用途：句子渲染上下文（UI 级），不含高频全局状态。

### 关键页面依赖（ArticleListPage）
文件：`apps/web/src/pages/ArticleListPage.tsx`

#### 主要 Hooks（业务/状态）
- `useArticles`
- `useSettingsView`
- `usePlayback` / `usePlaybackState` / `usePlaybackActions`
- `useArticleToolbar`
- `useClozePractice`
- `useAiManagement`
- `useInitSentenceOperations`
- `useInitSettingsDialogs`
- `useSettingsDialogs`
- `useSettingsPanelView`
- `useSidebarView`
- `useToolbarView`

#### 直接 tRPC 调用
- `trpc.auth.signOut.useMutation`
- `trpc.tts.getSentenceAudio.useMutation`

> 结论：页面已明显“收敛”，但仍集中编排多个 Hook，阶段 1/2 继续下沉到 features 后会更清晰。

### 组件内依赖关系（示例）
#### ArticleToolbar
文件：`apps/web/src/components/article/ArticleToolbar.tsx`
- 依赖：`useArticleToolbarState`（atom）
- 依赖：`useCardModeState` / `useCardModeActions`（atom）
- 依赖：`useAiManagement`（业务 Hook）
- 依赖：`useArticleToolbar`（业务 Hook）
- 依赖：`useSettingsView`（业务 Hook）

#### ArticleContentView
文件：`apps/web/src/components/article/layout/ArticleContentView.tsx`
- 依赖：`useSentenceOperations`（业务 Hook）
- 依赖：`usePlayback`（业务 Hook）
- 依赖：`useArticlesContext`（业务 Hook）
- 依赖：`useArticleToolbar`（业务 Hook）
- 依赖：`useSettingsView`（业务 Hook）
- 依赖：`useCardModeState` / `useArticleToolbarState`（atom）

### 高风险状态（高频/跨组件）
建议明确迁移归属到 atoms：
- 播放状态：当前句子、角色、速度、播放中标记
- 卡片模式：索引、翻转、随机
- 工具栏开关：全文/外语/单句/影子/挖空
- 弹窗开关：AI/设置/删除/清理缓存

### 过渡期适配点（需关注）
- `useArticlesContext`：当前通过模块级“最新 API”访问，后续迁移到 `features/articles` 后需要建立适配层。
- `usePlayback` / `useAiManagement`：已开始 atom 化，阶段 2 后应移入各自 feature 的 `atoms/`。

### 后续动作建议（阶段 1 启动条件）
- 将 `apps/web/src/components/article/*` 逐步迁入 `features/articles/components/`。
- 将 `atoms/` 中的模块原子分拆到 `features/*/atoms`。
- 只保留 `apps/web/src/atoms` 作为全局跨模块原子目录。

---

## 详细依赖映射（Hooks / tRPC / Atoms）

### Hook → tRPC 端点
- `useArticles`
  - `trpc.article.list`
  - `trpc.article.get`
  - `trpc.article.create`
  - `trpc.article.deleteMany`
- `useSentenceOperations`
  - `trpc.article.updateSentence`
  - `trpc.article.deleteSentence`
- `useSettings`
  - `trpc.user.getSettings`
  - `trpc.user.updateSettings`
  - `trpc.user.updateTtsVoices`
- `useSettingsDialogs`
  - `trpc.user.getTtsOptions`
  - `trpc.user.deleteAccount`
- `useAiManagement`
  - `trpc.user.getAiProviders`
  - `trpc.user.updateAiProviderDefault`
  - `trpc.user.updateAiProviderConfig`
  - `trpc.user.createUserAiProvider`
  - `trpc.user.deleteAiProvider`
  - `trpc.user.resetAiProvidersToPublic`
  - `trpc.user.getUserAiInstructions`
  - `trpc.user.getPublicAiInstructions`
  - `trpc.user.createUserAiInstructionFromPublic`
  - `trpc.user.updateUserAiInstruction`
  - `trpc.user.deleteUserAiInstruction`
  - `trpc.ai.translateSentence`

### Hook → Atom 使用
- `useAiManagement`
  - `aiManagement`（drafts/editing/progress/lastInstruction 等）
  - `aiDialogs`（各类 AI 弹窗开关）
- `useSentenceOperations`
  - `sentenceOperations`（编辑/删除弹窗、当前操作句子）
- `useSettingsDialogs`
  - `settingsDialogs`（语言/删除账号/清理缓存/影子跟读）
- `usePlayback`
  - `playback`（playingSentenceId/role/speed + api）
- `useArticleToolbar`
  - `articleToolbar`（循环/影子/随机/挖空 + api）
- `useArticles`
  - `articles`（列表/详情/选中/创建态）
- `CardModeView`（组件内部）
  - `cardMode`（索引/翻转/拖拽）

### 页面级 tRPC（非 Hook）
文件：`apps/web/src/pages/ArticleListPage.tsx`
- `trpc.auth.signOut.useMutation`
- `trpc.tts.getSentenceAudio.useMutation`

> 目标：后续将页面级 tRPC 收敛进 Hook（或 feature 内的 orchestration hook）。

---

## 组件 → Hook 依赖（关键片段）

### ArticleToolbar
- `useArticleToolbarState`（atom）
- `useCardModeState` / `useCardModeActions`（atom）
- `useAiManagement`（业务逻辑）
- `useArticleToolbar`（播放编排）
- `useSettingsView`（展示/配置）

### ArticleContentView
- `useArticlesContext`（文章状态）
- `useSentenceOperations`（句子操作）
- `usePlayback`（播放控制）
- `useSettingsView`（UI/配置）
- `useCardModeState` / `useArticleToolbarState`（atom）
- `useArticleToolbar`（停止播放逻辑）

### DialogsContainer（AI/设置/句子）
- AI 系列弹窗：`useAiManagement`
- 句子弹窗：`useSentenceOperations`
- 设置弹窗：`useSettingsDialogs` + `usePlayback`

---

## 潜在耦合点 / 风险提示
- `useArticlesContext` 仍是“latest api”适配方案：需在阶段 2 完全下沉到 feature atoms。
- 页面级 `trpc.*` 仍有少量存在：建议阶段 3/4 收敛。
- `SentenceItemContext` 仍保留：需评估是否用 atom 替代（若高频更新则转 atom）。
