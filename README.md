# Pixso CodeForge（像素锻造）

> 国内最强多端代码生成插件 —— 让设计师在 Pixso 中选中任意页面/组件，一键生成可直接运行的多平台代码

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1+-646CFF.svg)](https://vitejs.dev/)

## ✨ 特性

- 🎯 **一稿多发** - 支持 Flutter / SwiftUI / Jetpack Compose / React / Vue 3 / 微信小程序
- 🔍 **像素级还原** - 精准转换设计稿到代码，还原度 ≥90%
- 🧠 **智能布局** - 自动识别横/竖布局、间距、约束布局
- 🎨 **主题提取** - 自动提取主题色、文字样式
- 📦 **组件化输出** - 自动识别组件实例，生成可复用代码
- ⚡ **零配置运行** - 生成的代码可直接在对应 IDE 中运行

## 🏗️ 技术架构

```
Pixso 设计节点树
        ↓
Node Analyzer（src/ir/analyzer.ts）
        ↓
ForgeIR（纯数据，带完整类型）
        ↓
Codegen Engine（src/codegen/index.ts）
        ├─→ FlutterRenderer.ts
        ├─→ SwiftUIRenderer.ts
        ├─→ ComposeRenderer.ts
        ├─→ ReactRenderer.ts
        ├─→ VueRenderer.ts
        └─→ WeappRenderer.ts
        ↓
输出 .dart / .swift / .kt / .tsx / .vue / .wxml+wxss+js
```

## 📁 项目结构

```
pixso-codeforge/
├─ manifest.json              # Pixso 插件配置
├─ tsconfig.json              # TypeScript 配置
├─ vite.config.ts             # Vite 构建配置
├─ package.json               # 项目依赖
├─ src/
│  ├─ main.ts                 # 插件入口
│  ├─ ui.html                 # 界面
│  ├─ ui.ts                   # UI 逻辑
│  ├─ ir/
│  │   ├─ types.ts            # ForgeIR 完整类型（核心！）
│  │   ├─ analyzer.ts         # Pixso Node → ForgeIR
│  │   └─ optimizer.ts        # 合并文本、提取变量
│  ├─ codegen/
│  │   ├─ base.ts             # 基础渲染器
│  │   ├─ flutter.ts          # Flutter 代码生成
│  │   ├─ swiftui.ts          # SwiftUI 代码生成
│  │   ├─ compose.ts          # Jetpack Compose 代码生成
│  │   ├─ react.ts            # React-TSX 代码生成
│  │   ├─ vue.ts              # Vue 3 代码生成
│  │   └─ weapp.ts            # 微信小程序代码生成
│  ├─ utils/
│  │   ├─ color.ts            # 颜色处理工具
│  │   ├─ naming.ts           # 语义化命名生成
│  │   └─ prettier.ts         # 代码格式化
│  └─ assets/                 # 静态资源
└─ dist/                      # 打包输出目录
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint        # ESLint 检查
npm run format      # Prettier 格式化
npm run typecheck   # TypeScript 类型检查
```

## 📝 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，提交信息格式如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型说明

| Type | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响代码运行的变动） |
| `refactor` | 重构（既不是新增功能，也不是修复 bug） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具的变动 |
| `revert` | 回滚 |
| `build` | 打包 |
| `ci` | CI 相关变更 |

### 示例

```bash
git commit -m "feat(flutter): add support for gradient fills"
git commit -m "fix(analyzer): correct padding calculation"
git commit -m "docs: update README with installation guide"
```

## 🗺️ 开发路线图

详见 [TODO.md](./TODO.md)

## 🤝 贡献指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

## 🙏 致谢

- [Pixso](https://pixso.cn/) - 国产设计工具
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
