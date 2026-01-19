# Sola 前端重构方案（Feature-based + tRPC + Hooks + Jotai）

## 目标
- 业务模块化：按功能拆分到 `features/*`。
- 状态分层：Global（Zustand）/ Server（tRPC）/ Local UI（Jotai）。
- 降低耦合：Hooks 负责业务编排，组件只消费状态与触发动作。
- 性能优先：避免高频状态进入 Context，采用 Jotai 原子化订阅。

## 架构原则
- Global State（Zustand）：仅保留 Auth、全局 Settings。
- Server State（tRPC）：查询与缓存、mutation 同步。
- Local/UI State（Jotai）：跨组件 UI 状态、高频更新、局部多实例。
- 禁止在 Context 存放高频/可拆分状态。
- 依赖治理（防循环）：feature 内可引用 shared/stores，但跨 feature 依赖只能通过对方 `index.ts` 的最小接口。
- 数据流向约束：禁止在一个 feature 的 atom 中直接修改另一个 feature 的私有 atom。
- schema 归属：tRPC 的输入/输出类型（zod schema）统一归到 `packages/shared`。

## 目标目录结构
apps/web/src/
├── atoms/                  # 仅全局跨模块 atom（如全局 loading）
├── stores/                 # Zustand（Auth、Settings）
├── lib/                    # trpc 客户端、zod schema、工具类
└── features/
    ├── articles/
    │   ├── atoms/
    │   ├── hooks/
    │   ├── components/
    │   └── index.ts
    ├── card-mode/
    │   ├── atoms/
    │   ├── hooks/
    │   ├── components/
    │   └── index.ts
    ├── playback/
    │   ├── atoms/
    │   ├── hooks/
    │   ├── components/
    │   └── index.ts
    └── ai-management/
        ├── atoms/
        ├── hooks/
        ├── components/
        └── index.ts

## index.ts 规范（模块出口）
- 只导出“可用 API”：hooks / 组件 / 少量稳定的类型。
- atoms 目录内的 raw atoms 默认私有；外部只能通过 hooks 读写。
- 如果确需暴露 atom，只能暴露“语义化 atom”（避免外部直接写业务内部状态）。

## 依赖与边界治理
- 路径别名与边界校验：禁止跨模块深层引用（例如直接引用 `features/**/components`）。
- mutations 只能在 hooks 内触发，组件不得直接调用 `trpc.*.useMutation`。
- 高危状态（播放进度、选中句子、AI 进度）必须 atom 化；一次性输入不必 atom 化。

## 模块职责
- articles：文章列表、选中状态、创建/删除、句子操作入口。
- card-mode：卡片翻转/索引/随机/滑动交互与展示。
- playback：音频缓存、播放控制、进度与状态。
- ai-management：AI 厂商/指令/进度/翻译任务编排。

## 迁移策略（分阶段）
### 阶段 0：梳理依赖
**进度：✅ 完成**
- 产出依赖图：hooks/components/provider 依赖关系与调用链。
- 盘点状态：
  - 高频状态（播放进度、选中句子、翻转状态）
  - 跨组件 UI 状态（弹窗、工具栏开关）
- 标记 tRPC 查询：哪些仅用于展示、哪些需要联动。
- 验收：依赖图 + 状态清单 + 风险点列表。

### 阶段 1：目录落地
**进度：✅ 完成**
- 建立 `features/*` 目录与 `index.ts` 出口（空壳即可）。
- 配置路径规则：禁止跨模块深层引用。
- 迁移“无副作用”工具（纯函数）到对应模块或 shared。
- 验收：新增目录可编译，路径规则生效。

### 阶段 2：原子下沉
**进度：✅ 完成**
- 将现有 `atoms/*` 分拣：
  - 全局 atoms 留在 `apps/web/src/atoms`
  - 模块 atoms 移入 `features/*/atoms`
- 统一命名：`<feature>/atoms/*Atoms.ts` 或单原子文件。
- 为跨组件状态建立“语义 atom”，替代 raw atom 直接暴露。
- 验收：对应 UI 读写已切 atom，旧 Context 仍可共存。

### 阶段 3：Hook 拆分
**进度：✅ 完成**
- 每个模块建立核心 Hook（如 `useArticles`/`usePlayback`/`useAiManagement`）。
- Hook 负责：
  - 读写 Jotai atoms
  - 封装 tRPC query/mutation
  - 统一并发、缓存、节流、副作用
- 迁移方式：先保留旧 API，内部替换为新 Hook。
- 验收：Hook 可独立运行，组件调用不感知内部变化。

### 阶段 4：组件收敛
**进度：✅ 完成（有少量清理工作并入阶段 5）**
- UI 组件：
  - 仅接收必要 props，或直接调用 Hook/atom
  - 移除 Context props drilling
- 拆分重组件（如 ArticleList）为“布局 + 业务组件 + Dialogs”。
- 验收：页面文件仅包含布局与 Hook 初始化。

### 阶段 5：清理与一致性
**进度：⏳ 进行中**
#### 5.1 旧物清理与目录收口
- 删除旧 Provider/Context 与废弃文件。
- 清空残留的 `components/article`、`hooks/*` 旧入口。
- 验收：无未引用文件，页面可运行。

#### 5.2 出口与依赖边界
- 整理 `features/*/index.ts` 出口，只导出稳定 API。
- 清理 deep import，统一改为模块入口引用。
- 补充边界校验（禁止跨模块深层引用）。
- 验收：无跨模块深层引用（检索结果为空）。

#### 5.3 类型/Schema 归并
- 统一 i18n 与 types/schema 到 `packages/shared`。
- 替换前端自定义类型为共享类型。
- 验收：shared 引用路径一致，类型不重复声明。

#### 5.4 行为回归验证
- 核心交互：播放/影子跟读/卡片/随机/挖空/AI 指令。
- 清理缓存、删除/编辑句子、批量删除。
- 验收：`pnpm --filter @sola/web type-check` 通过；关键交互无回归。

## 当前迁移进度快照
- 已迁移到 feature：ArticleContentView / ArticleToolbar / CardModeView / ClearCacheDialog / AiSettingsDialog / AiInstructionPanel / 文章相关 Dialogs。
- `components/article` 目录已清空并移除，布局组件已落在 `features/articles/components/layout/*`。
- `ArticleListPage` 已收敛为“布局 + Hook 初始化 + DialogsContainer”，大部分 UI 自取状态。
- 仍在收尾：删除残余旧引用、统一 `index.ts` 出口、边界校验（禁止深层引用）、`packages/shared` 类型归并。

## 过渡期隔离（新旧共存）
- 新模块若需要旧 Context 数据，在对应 Hook 中加“适配层”。
- 示例：CardMode 迁移期可在 `useCardMode` 内同时支持 Context 和 Atom 读取。
- 适配层只保留最短时间，待上游模块迁完后清理。

## 文件迁移建议（示例）
- `hooks/useArticles.tsx` → `features/articles/hooks/useArticles.tsx`
- `atoms/articles.ts` → `features/articles/atoms/articles.ts`
- `components/article/*` → `features/articles/components/*`
- `hooks/usePlayback.tsx` → `features/playback/hooks/usePlayback.tsx`
- `atoms/playback.ts` → `features/playback/atoms/playback.ts`
- `components/article/CardModeView.tsx` → `features/card-mode/components/CardModeView.tsx`
- `atoms/cardMode.ts` → `features/card-mode/atoms/cardMode.ts`
- `hooks/useAiManagement.tsx` → `features/ai-management/hooks/useAiManagement.tsx`
- `atoms/aiManagement.ts` → `features/ai-management/atoms/aiManagement.ts`

## 约束与规范
- 不允许直接跨模块引用内部文件；只能通过 `features/*/index.ts`。
- `features/*/index.ts` 只导出“可用 API”（hooks/components/atoms）。
- tRPC Query/Mutation 只出现在 hooks 内部。
- 高危改动（播放、AI 并发）先保留旧行为，用测试兜底。

## tRPC 与 Jotai 的边界
- 原则：tRPC 负责“存取”，Jotai 负责“响应”。
- 场景：
  - 数据仅用于展示且不跨组件联动：直接用 `trpc.useQuery`。
  - 数据需要被其他不相关组件感知或修改：同步到 Jotai Atom。

## packages/shared 与 packages/ui 的边界
- packages/shared：仅放共享类型、常量、zod schema、纯函数工具；不放 React 组件或业务 hooks。
- packages/ui：仅放纯 UI 组件（无 tRPC/Jotai/业务语义）；文案由外部传入。
- i18n：不在 packages/ui 内直接依赖 i18n，避免跨包耦合。

## 验收标准
- 页面文件不包含业务逻辑，只做 layout + hook 初始化。
- 每个模块内有清晰的 atoms/hooks/components 分层。
- `pnpm --filter @sola/web type-check` 无报错。
- 关键交互无回归：播放、影子跟读、卡片模式、AI 翻译。

## 风险与对策
- 原子过多导致难以追踪：统一命名，提供 `index.ts` 导出清单。
- 并发副作用分散：核心逻辑集中在 Hook，组件只触发动作。
- 遗留 Context：逐项清理 Provider，避免双写状态。
