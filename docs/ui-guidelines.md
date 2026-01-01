# Sola UI Guidelines (Mobile-First + Desktop)

本项目目标是 **移动端体验优先**，同时保证桌面 Web 的信息密度与效率。为避免风格漂移与交互割裂，业务开发需遵循以下 UI 基建规范。

## 断点与布局策略

- Mobile-first：默认样式即移动端样式。
- `md`（>= 768px）：切换为桌面布局（Sidebar + 更宽的内容区）。
- `lg`（>= 1024px）：允许提升桌面信息密度（更宽容器、多列）。

推荐规则：
- 仅在 `md+` 引入“永久可见”的桌面结构（Sidebar、表格多列等）。
- 移动端优先保证：单列内容、触控友好（按钮/列表项更高、间距更大）。

## 组件使用边界

业务代码 **不直接使用** Radix / Vaul primitives：
- ✅ 使用：`@sola/ui` 导出的封装组件（例如 `Button`、`ResponsiveOverlay`、`AppShell`）。
- ❌ 禁止：在业务里直接 `import * as Dialog from "@radix-ui/react-dialog"` 或直接使用 `vaul`。

目的：
- 统一 API/样式/可访问性处理（focus、aria、滚动锁定等）
- 方便后续整体替换/升级 primitives

## Tokens 与样式约束

- 颜色与圆角：沿用 shadcn 的 CSS Variables（`--background`、`--foreground`、`--radius`…）以及 Tailwind 映射。
- 不在业务里写“新的一套颜色系统”。如果需要新增 token，先加到全局 CSS variables，再在 Tailwind 扩展。

## 触控与可用性

- 最小触控高度建议：`44px`（本项目 `Button` 默认高度为 `h-11`）。
- 对“行项/按钮/导航”等高频交互区域：避免小于 `h-11`。
- 移动端 `touch-action` 已全局设为 `manipulation`（减少点击延迟）。

## Safe Area（刘海屏/圆角屏）

- `index.html` 使用了 `viewport-fit=cover`，允许内容进入刘海区域。
- Tailwind 已启用 safe-area utilities：
  - 布局容器可使用 `p-safe` / `pt-safe` / `pb-safe` 等
  - 底部固定区域（BottomNav、Drawer）务必包含 `pb-safe`

## 滚动策略

- 页面整体使用 **单一主滚动容器**（通常是 `main`）。
- 固定区域（BottomNav / Header / Sidebar）与主滚动分离，避免 iOS 回弹与焦点滚动异常。

## 响应式 Overlay：统一写法

使用 `ResponsiveOverlay`，业务只写一套内容：
- `md-`：Drawer（底部弹出，触控友好）
- `md+`：Dialog（居中对话框，鼠标/键盘友好，焦点管理由 Radix 处理）

示例（伪代码）：
```tsx
<ResponsiveOverlay
  open={open}
  onOpenChange={setOpen}
  title="Title"
  description="Desc"
>
  <div>Shared content</div>
</ResponsiveOverlay>
```

## 新页面模板（建议）

- 在 `apps/web` 中新增一个 `pageKey`，加入 `AppShell.navItems`
- 页面内容保持 `max-w-*` 容器 + `space-y-*` 间距
- 所有交互组件优先从 `@sola/ui` 引入

