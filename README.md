# 意图管理系统 · Intent Hub

纯黑苹果风的客户意图管理系统。管理客户档案、按人群/阶段/标签分类，每个客户名下挂载由 `customer-intent-analyzer` skill 生成的意图分析报告（在 App 内用 React 组件渲染，支持动态品牌色）。

## 技术栈

Vite + React 18 + TypeScript · Tailwind CSS · shadcn 风格组件（Radix）· React Router · Zustand（localStorage 持久化）· Recharts · Framer Motion · lucide-react

## 运行

```bash
npm install      # 首次
npm run dev      # 本地预览 → http://localhost:5173
npm run build    # 打包到 dist/（静态文件，可部署）
npm run preview  # 预览打包结果
```

## 页面

| 路由 | 页面 | 作用 |
|---|---|---|
| `/` | 总览 Dashboard | KPI、人群环形图、阶段漏斗、最近更新 |
| `/customers` | 客户列表 | 人群/阶段/标签筛选 + 搜索 + 卡片墙 |
| `/customers/:id` | 客户档案 | 资料 + 名下意图报告列表 |
| `/reports/:id` | 意图报告 | 结构化数据渲染的精美报告 |
| `/new` | 新建分析 | 粘贴 skill 输出的 JSON → 生成报告并归档 |
| `/settings` | 设置 | 人群分类增删、数据导入导出、重置 |

## 数据

全部存在浏览器 localStorage（key: `intent-hub-v1`）。无后端。换设备/备份用「设置」里的导入导出。数据契约见 `src/types/index.ts`，与 skill 输出格式一致。

## 与 skill 的闭环

1. 在 Claude Code 里说「分析这个客户：……」触发 `customer-intent-analyzer`
2. skill 输出一段 `IntentReport` JSON
3. 打开本系统 → 新建分析 → 粘贴 JSON → 选/建归属客户 → 生成报告
