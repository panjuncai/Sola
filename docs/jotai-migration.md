# Jotai 改造方案（局部状态替换 Context + Hook）

## 目标
- 降低 Context + Provider 的层级复杂度。
- 局部 UI 状态用 Jotai，跨页面/全局状态继续使用 Zustand。
- 逐步替换，避免一次性大改造成回归风险。

## 适用范围（建议）
### 适合用 Jotai 的局部状态
- 卡片模式（CardMode）交互状态（翻转、拖拽、索引、播放中断标记）。
- 工具栏状态（循环开关、影子跟读、随机/挖空等 UI 状态）。
- Dialog 开关状态（AI 设置、指令面板、语言设置等）。
- 临时草稿类状态（AI provider/edit drafts、指令草稿等）。

### 全局状态（Jotai）
- Auth 用户信息（`useGlobalAuthState`）。
- Settings 全局配置（`useGlobalSettings`）。

## 迁移策略（分阶段）
### 阶段 1：局部单点试点
目标：挑一个逻辑集中但影响小的模块，验证 Jotai 可读性/可维护性。
推荐试点：**CardMode**（目前已独立且上下文层级清晰）。

步骤：
1. 新建 `apps/web/src/atoms/cardMode.ts`，把 CardMode 相关 state 抽为 atom。
2. `CardModeView` 和 `useCardMode` 改为直接用 atom（`useAtom`）。
3. 保留 `useCardMode` 作为兼容层（内部仅调用 atom），减少上层改动。

### 阶段 2：替换工具栏上下文
目标：减少 `useArticleToolbar` + Provider 层。

步骤：
1. 新建 `apps/web/src/atoms/articleToolbar.ts`（循环/影子/随机/挖空等状态）。
2. `ArticleToolbar` 和 `ArticleContentView` 直接消费 atom。
3. `useArticleToolbar` 逐渐变成“业务逻辑 + atom 写入”的轻薄层。

### 阶段 3：Dialog 状态收敛
目标：减少 `DialogsContainer` 的 Context 依赖。

步骤：
1. 为每个 dialog 集合新建 atom 文件（如 `aiDialogs.ts`、`settingsDialogs.ts`）。
2. Dialog 组件内部直接读取 atom，移除 props drilling。

### 阶段 4：清理 Provider 树
目标：减少 `ArticleProviders` 中的 Provider 数量。

步骤：
1. 逐步移除已被 atom 替代的 Provider。
2. 最终 `ArticleProviders` 只保留真正全局的 Providers（如 Settings/Playback 若仍需要）。

## 文件结构建议
```
apps/web/src/atoms/
  cardMode.ts
  articleToolbar.ts
  aiDialogs.ts
  settingsDialogs.ts
```

## 风险与规避
- **状态初始化分散**：在 atom 层提供明确的默认值，避免初始化遗漏。
- **异步逻辑混乱**：把异步调用留在 hooks 层，atom 仅用于状态存储。
- **调试复杂度**：保持 atom 命名与业务含义一致，避免“万能 atom”。

## 验收标准
- Provider 树深度明显减少。
- `ArticleContentView` / `DialogsContainer` Props 数量显著下降。
- 类型检查通过（`pnpm --filter @sola/web type-check`）。
- 功能表现与原流程一致。

## 后续可选优化
- 引入 `jotai/utils` 的 `atomWithStorage`，持久化局部 UI 偏好。
- 对高频更新的 atom 使用 `selectAtom` 提升渲染性能。
