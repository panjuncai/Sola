# DB 单一真实来源（DB Source of Truth）重构方案

## 背景与目标
当前架构中仍存在“本地状态镜像 + 手动同步”的模式，带来：
- UI 不更新/时序错误
- 维护成本高（大量 useEffect / setAtom / setQueryData）
- 状态漂移（DB 与 UI 不一致）

目标：**所有涉及 DB 变动的操作以 DB 为准**，前端只读 tRPC Query（或 trpcAtom）。

## 核心原则
1) **单一真实来源**：DB / tRPC Query
2) **写后拉取**：Mutation 成功后统一 `invalidate/refetch`
3) **UI 状态原子化**：Jotai 只保留 UI 临时态（弹窗、草稿、选中）
4) **禁止本地同步**：不再使用 `setQueryData` / `setAtom(data)`

## 适用范围
- Article 列表与详情（article.list / article.get）
- AI Providers / Instructions（user.getAiProviders / user.getUserAiInstructions）
- 句子编辑 / 删除（article.updateSentence / article.deleteSentence）
- 设置 / TTS 选择（user.getSettings / user.getTtsOptions）

不适用：高频交互或纯 UI 状态（播放进度、弹窗开关、输入草稿）。

## 分阶段执行

### 阶段 1：规范写后刷新
- 统一 mutation 成功后调用 `queryClient.invalidateQueries` 或 `query.refetch()`
- 禁止 `setQueryData` 直接写入 UI
- 删除所有“查询 -> setAtom”同步 useEffect

验收：DB 更新后 UI 必定刷新；无本地同步补丁。

### 阶段 2：清理业务数据 atom
- 删除保存业务数据的 atom（例如 articles list / instructions list）
- 保留 UI 原子（弹窗/草稿/选中态）
- 组件直接消费 query data

验收：组件中不再混用 atom + query 读取相同业务数据。

**进度**：已完成。当前仅保留 UI 原子（弹窗/草稿/选中态），业务数据统一由 query 提供。

### 阶段 3：Hook 逻辑瘦身
- Hooks 只负责：
  - 调用 mutation
  - 触发 refetch/invalidate
- 移除本地同步逻辑、patch 逻辑

验收：每个 hook 内的 DB 变更逻辑只剩 “写 + 刷新”。

### 阶段 4：统一错误处理
- DB 操作失败统一由全局 tRPC error handler 处理
- UI 层不再重复 catch + toast

验收：错误提示只在一个入口处理。

## 代码层面的约束
- 禁止在 UI 组件内写业务 atom
- 禁止 `setQueryData` 改写 DB 数据（除非明确做乐观更新）
- 所有 mutation 必须有 invalidate/refetch

## 示例模式

### 推荐（DB 真相）
```ts
const update = trpc.article.updateSentence.useMutation({
  onSuccess: () => queryClient.invalidateQueries({
    queryKey: ["article.get", { articleId }],
  }),
})
```

### 禁止（本地镜像）
```ts
useEffect(() => { if (data) setAtom(data) }, [data])
queryClient.setQueryData([...], (prev) => patch)
```

## 迁移清单（建议优先级）
1) AI 指令翻译流程（translateSentence）
2) 句子编辑/删除
3) AI Provider/Instruction CRUD
4) 文章新增/删除
5) Settings 更新

## 风险与对策
- **网络延迟**：UI 会等一次 refetch
  - 可通过 Skeleton/Loading 提示降低突兀
- **交互不顺滑**：如需顺滑体验，局部再引入乐观更新

## 验收标准
- DB 写入后 UI 必定更新
- 无“DB 已更新但 UI 不变”的问题
- 业务数据只在 query 中维护


## Checklist（执行清单）
- [ ] 列出所有 mutation 与对应 query key
- [ ] 所有 mutation 加入 `invalidate/refetch`
- [ ] 删除 `setQueryData` 的业务数据补丁
- [ ] 删除 query -> atom 的同步 useEffect
- [ ] 组件仅消费 query data
- [ ] 仅保留 UI 原子（弹窗/草稿/选中态）
- [ ] 关键流程加 Skeleton/Loading（避免刷新突兀）
- [ ] 全局错误处理统一（tRPC error handler）
- [ ] 完成回归：新增/编辑/删除/翻译均实时刷新

## 当前进展（已完成）
- [x] **AI 翻译**：移除本地 patch，翻译完成后 invalidate `article.get` 并由 DB 刷新 UI。
- [x] **句子编辑/删除**：移除 `setQueryData` 本地同步，改为 invalidate 详情。
- [x] **AI Provider/Instruction CRUD**：写后 `refetch` 指令与 provider 查询。
- [x] **文章新增/删除**：写后 `listQuery.refetch()`，不再依赖本地镜像。
- [x] **Settings**：写后 `settingsQuery.refetch()`，移除本地 set。

## 仍需确认/验证
- [ ] **全链路回归**：新增文章、AI 指令翻译、句子编辑/删除、AI Provider/Instruction CRUD、Settings 变更是否均实时刷新。
- [ ] **刷新命中一致性**：确保所有 query key 统一（`trpcAtom` key 与 invalidate/refetch 一致）。
- [ ] **UI 验证**：确认无“DB 已更新但 UI 不刷新”的残留场景。


## Checklist 完成情况
- [x] 列出所有 mutation 与对应 query key
- [x] 所有 mutation 加入 `invalidate/refetch`
- [x] 删除 `setQueryData` 的业务数据补丁
- [x] 删除 query -> atom 的同步 useEffect
- [x] 组件仅消费 query data
- [x] 仅保留 UI 原子（弹窗/草稿/选中态）
- [ ] 关键流程加 Skeleton/Loading（避免刷新突兀）
- [x] 全局错误处理统一（tRPC error handler）
- [ ] 完成回归：新增/编辑/删除/翻译均实时刷新
