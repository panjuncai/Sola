Sola重构Wordlens，目的：**端到端类型安全 (E2E Type Safety)**、**极简的运维 (Serverless/Edge)** 和 **组件化设计系统**。

以下是我为你设计的 **Sola 2.0 架构蓝图**：

### 1. 技术栈选型：T3 Stack 变体 (The "Meta" Stack)

我会放弃传统的 `REST API + Axios` 模式，全面拥抱 **类型导向** 开发。

| **层级**     | **以前的选择**   | **现在的现代化选择**             | **理由**                                                     |
| ------------ | ---------------- | -------------------------------- | ------------------------------------------------------------ |
| **语言**     | JavaScript       | **TypeScript**                   | 必须的。全栈类型联想，重构不害怕。                           |
| **包管理**   | npm              | **pnpm + Turborepo**             | 极速安装，Monorepo 原生支持，更好管理前后端共用代码。        |
| **前端框架** | React + Vite     | **React + Vite** (保持)          | 对于这种重交互的 Dashboard 应用，SPA 依然是最佳选择 (Next.js 也行，但 SPA 迁移成本低)。 |
| **API 通信** | REST + Axios     | **tRPC**                         | **这是灵魂**。像调本地函数一样调后端，没有 API 文档，参数自动校验。 |
| **UI 库**    | Ant Design       | **Tailwind CSS + shadcn/ui**     | AntD 太重且风格固化。shadcn/ui 基于 Tailwind，极其轻量、可定制，颜值更高，是目前的业界标准。 |
| **数据库**   | SQLite (raw SQL) | **Drizzle ORM + SQLite (Turso)** | 手写 SQL 容易出错。Drizzle 是目前最轻、最快、TS 支持最好的 ORM。Turso 是基于 SQLite 的边缘数据库，支持云同步。 |
| **状态管理** | Zustand          | **TanStack Query + Zustand**     | 用 Query 管理服务端数据 (缓存、自动刷新)，用 Zustand 管理纯前端状态 (如播放器进度)。 |
| **运行时**   | Node.js          | **Node.js (Fastify) 或 Bun**     | Express 有点老了。Fastify 更快，tRPC 对其支持很好。Bun 则是一体化工具链。 |

------

### 2. 项目结构：Monorepo (单体仓库)

我会把项目结构设计成一个 **pnpm workspace**，把核心逻辑抽离出来。

Plaintext

```
root/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json              // 任务编排
├── apps/
│   ├── web/                // 前端 (React + Vite)
│   └── server/             // 后端 (Node + tRPC)
└── packages/
    ├── shared/             // 前后端共用的类型 (Article, User 等)
    ├── logic/              // 核心业务逻辑 (你的 textProcessor.js 放这里！)
    ├── db/                 // 数据库 Schema 和 Drizzle 配置
    └── ui/                 // 自定义的 UI 组件库 (基于 shadcn)
```

**设计亮点：**

- **`packages/logic`**：你的 `textProcessor.js`（分词、正则、挖空逻辑）是纯计算逻辑。把它放在这里，前端可以直接引用做实时预览，后端也可以引用做预处理。**一份代码，两端运行**。

------

### 3. 核心功能重构思路

#### A. API 层：tRPC + Zod (抛弃防御性编程)

以前你需要在 Controller 里写大量 if (!req.body.title) return error。

现在，利用 Zod 进行运行时校验：

TypeScript

```
// server/routers/article.ts
export const articleRouter = t.router({
  create: t.procedure
    .input(z.object({
      title: z.string().min(1, "标题不能为空"),
      content: z.string().min(20, "文章太短了"),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // 这里的 input 已经被严格校验，且类型完备
      return ctx.db.insert(articles).values(input);
    })
});
```

#### B. 数据层：Drizzle ORM (类型即数据库)

不再手写 SQL 字符串。定义 Schema 即定义类型。

TypeScript

```
// packages/db/schema.ts
export const articles = sqliteTable('user_articles', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

#### C. UI 层：shadcn/ui (高颜值的保证)

你的 Sola 目前界面偏“工程师风”。使用 **shadcn/ui** 可以立刻获得类似 Vercel/Notion 的设计质感。

- 它不是一个组件库，而是复制代码到你的项目里，你可以随意修改。
- 结合 `Tailwind CSS`，你可以轻松实现深色模式、响应式布局。

**改造你的播放器：**

TypeScript

```
// 不再写 style={{...}}
<div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200">
  <Button variant="ghost" size="icon">
    <PlayIcon className="h-6 w-6 text-primary" />
  </Button>
  <ProgressBar value={currentProgress} className="h-2" />
</div>
```

#### D. UI 基建规范：Mobile-First，同时兼顾桌面

为了把“移动端体验”打磨到极致，同时保证桌面端效率，我会把 UI 基建明确成可执行的工程规则（并沉淀到 `@sola/ui`）。

**断点与布局策略：**

- Mobile-first：默认样式就是移动端样式。
- `md`（>=768px）：开始出现桌面布局（Sidebar、多列/更宽内容）。
- `lg`（>=1024px）：提高桌面密度（更宽容器、更复杂布局）。

**组件使用边界（强约束）：**

- 业务代码不直接使用 Radix / Vaul primitives。
- 业务一律从 `@sola/ui` 引用（例如 `Button` / `AppShell` / `ResponsiveOverlay`），由封装层统一处理样式、可访问性与交互一致性。

**Tokens 与样式约束：**

- 统一使用 shadcn 的 CSS Variables（`--background` / `--foreground` / `--radius`…）+ Tailwind 映射。
- 新增设计 token：先扩展 CSS variables，再扩展 Tailwind（避免业务里出现“私有颜色体系”）。

**触控与移动端体验：**

- 触控最小高度建议 `44px`（按钮/导航等高频交互区域尽量不小于 `h-11`）。
- 启用 `touch-action: manipulation`，减少移动端点击延迟。

**Safe Area（刘海屏/圆角屏）与固定区域：**

- `viewport-fit=cover` 允许内容进入刘海区域。
- 固定底部区域（BottomNav、Drawer）必须包含 `pb-safe`，页面容器可用 `p-safe` 系列工具类。

**滚动策略：**

- 页面整体维持单一主滚动容器（通常是 `main`），固定结构（Header/Sidebar/BottomNav）与主滚动分离，减少 iOS 回弹/焦点滚动异常。

**统一的响应式弹层（业务只写一套）：**

- `md-`：Drawer（底部弹出，触控友好）
- `md+`：Dialog（居中对话框，键盘/焦点管理更好）

示例（业务侧只写一套）：

```tsx
<AppShell ...>
  <ResponsiveOverlay title="Title" description="Desc">
    <div>Shared content</div>
  </ResponsiveOverlay>
</AppShell>
```

------

### 4. 部署与运维：Docker 化与 CI/CD

我会抛弃 `oneclick-deploy.sh` 这种手动脚本，转向 **容器化**。

1. **Docker**：编写一个 `Dockerfile`，利用多阶段构建 (Multi-stage build)，产出一个极小的 Image。
2. **Github Actions**：
   - 代码推送到 `main` 分支 -> 自动运行 `tsc` 检查类型 -> 自动构建 Docker 镜像 -> 自动推送到你的服务器 (或者阿里云/AWS)。
   - **数据库迁移**：在 CI 流程中自动运行 `drizzle-kit migrate`，再也不用手动去生产环境改表结构。

### 5. AI 能力集成 (面向未来)

既然叫 Sola (Lens)，未来肯定要加强 AI。

我会引入 Vercel AI SDK（即使你不用 Vercel 部署也能用）。

- **流式生成 (Streaming)**：当用户让 AI 解释语法时，不要等全部分析完再显示，而是像 ChatGPT 一样一个字一个字打出来。
- **Edge TTS**：利用 Edge Functions 转发 Azure TTS 请求，隐藏真实 Key，且速度更快。

------

### 总结：你的行动路线图

如果是我，我会按照这个顺序进行“现代化改造”：

1. **地基**：初始化一个 **pnpm workspace**，引入 **TypeScript**。
2. **搬运逻辑**：把 `textProcessor.js` 移动到 `packages/logic`，改写为 TS，并加上 **Vitest** 单元测试（保证正则永远不出错）。
3. **重构后端**：初始化 **tRPC + Fastify**，用 **Drizzle** 替换手写 SQL。
4. **重构前端**：引入 **Tailwind + shadcn/ui**，逐步替换 Ant Design 组件；用 `trpc-react` 替换 `axios`。
5. **发布**：写好 `Dockerfile`，配置 CI/CD。

这样做出来的项目，不仅现在好用，未来两三年内都会保持技术领先，且维护起来非常享受。
