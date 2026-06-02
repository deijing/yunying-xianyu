# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 命令

```bash
npm install      # 首次安装依赖
npm run dev      # 本地开发 → http://localhost:5173
npm run build    # tsc -b 类型检查 + vite build → 输出 dist/（纯静态，可直接部署）
npm run preview  # 预览打包结果
npm run lint     # eslint . 检查全仓库
```

注意：`build` 会先跑 `tsc -b`，**类型错误会直接阻断打包**。本项目没有测试框架，也没有测试文件。

## 架构总览

意图管理系统（Intent Hub）：纯黑苹果风的客户意图管理前端。**纯前端、无后端**，全部数据存浏览器 localStorage。

**技术栈**：Vite + React 19 + TypeScript + Tailwind 3 + shadcn 风格组件（Radix）+ React Router 7 + Zustand 5 + Recharts + Framer Motion + lucide-react。

路径别名 `@` → `src`（已配在 `vite.config.ts` 和 `tsconfig.app.json`，两处都要同步）。

### 几条贯穿全局、需要读多个文件才能理解的主线

1. **数据契约是整个系统的脊柱** —— `src/types/index.ts`
   `IntentReport` / `Customer` / `ArchiveData` 这套类型，**同时也是 `customer-intent-analyzer` skill 的输出格式**。改动这里会同时波及四处：skill 的产出、`NewAnalysis` 里粘贴 JSON 的解析、`ReportRenderer` 的渲染、以及 `useStore` 的存储结构。改类型前先想清楚这条链路。`STAGES`、`DEFAULT_SEGMENTS` 等枚举常量也在此定义。

2. **skill ↔ App 的闭环**
   skill 生成一段 `IntentReport` JSON → 用户在 `/new`（`NewAnalysis`）粘贴 → 存入 store 并挂到某个客户名下 → 在 `/reports/:id` 由 `ReportRenderer` 渲染。`addReport` 还会顺带把该客户的 `stage` / `intentLevel` 同步成最新报告的值。

3. **状态与持久化** —— `src/store/useStore.ts`
   单一 Zustand store（`persist` 中间件，localStorage key = `intent-hub-v1`）持有 `customers` / `reports` / `segments` 全部状态及增删改。初始值来自 `src/data/seed.ts`（也是「设置」里「重置演示数据」的目标）。换设备/备份只能走「设置」页的导入导出（`importData`）。主题状态是**独立的另一个 store** `useTheme`（key = `intent-hub-theme`），不要混进 `useStore`。

4. **主题系统分两层，都不要写死颜色**
   - **明暗**：`index.css` 里用 CSS 变量定义两套色板，靠 `<html>` 上的 `.dark` class 切换。Tailwind 的语义色（`ink` / `card` / `card2` / `line` / `fg` / `muted` / `subtle`）映射到 `rgb(var(--xxx-rgb))`，所以**永远用这些语义 class 而不是具体色值**。
   - **auto 模式**：`useTheme` 按时间判断（夜间 = 小时 <6 或 ≥18），`AppLayout` 每 60s 复评一次，到点自动切明暗。
   - **每份报告的动态品牌色**：`IntentReport.brandColor`（如小红书红 `#FF2442`）。这是唯一用**内联 `style`** 而非 Tailwind class 上色的地方 —— 这就是 `ReportRenderer` 大量出现 `style={txt}` / `style={soft}` 和 `hexToRgba()` 的原因。

5. **目录分层**
   `components/ui`（shadcn/Radix 原子组件）· `components/common`（业务小组件）· `components/layout`（`AppLayout` 侧栏+移动抽屉）· `components/report`（`ReportRenderer`）· `components/charts` · `pages`（对应 6 条路由，全在 `App.tsx`）· `store` · `data`。

## 约定

- **图标库统一用 lucide-react**，全仓库已贯彻，不要引入其它图标库（react-icons / heroicons 等）。约定写法：
  - 具名导入：`import { X, Users } from 'lucide-react'`
  - 把图标当数据/prop 传递时，类型用 `LucideIcon`（参见 `AppLayout` 的 `NAV` 数组、`StatCard` 的 `icon` prop、`ReportRenderer` 里 `Section`/`PointCard` 的 `icon`）
  - 尺寸用 Tailwind `size-*`；颜色用语义 class（`text-brand` / `text-muted`），动态品牌色场景才用内联 `style={{ color }}`
- 合并 className 一律用 `@/lib/utils` 的 `cn()`（clsx + tailwind-merge）。
- 生成 id 用 `uid(prefix)`，日期用 `today()`（均在 `lib/utils.ts`）。
