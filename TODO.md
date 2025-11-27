# Pixso CodeForge 开发任务清单

> 本文档记录项目开发进度和待完成任务，按阶段划分

## 版本规划说明

> **第一版目标**：专注于 Flutter 代码生成器的开发，打造高质量的 Flutter 代码生成能力。其他平台（SwiftUI、Compose、React、Vue、小程序）作为后续扩展目标，将在第一版发布后逐步支持。

## 开发阶段总览

| 阶段 | 周数 | 状态 | 核心目标 | 版本 |
|------|-----|------|---------|------|
| Phase 0 | Week 1 | ✅ 已完成 | 环境搭建与 IR 设计 | v1.0 |
| Phase 1 | Week 2 | ⏳ 待开始 | Flutter MVP | v1.0 |
| Phase 2 | Week 3 | ⏳ 待开始 | Flutter 完善与产品化 | v1.0 |
| Phase 3 | Week 4+ | 📋 后续规划 | SwiftUI 支持 | v2.0 |
| Phase 4 | - | 📋 后续规划 | Compose + React | v2.0 |
| Phase 5 | - | 📋 后续规划 | Vue + 小程序 | v2.0 |
| Phase 6 | - | 📋 后续规划 | 生态扩展 | v3.0 |

---

## Phase 0: 环境与 IR 设计（Week 1）

### 目标
- TypeScript + Vite 工程跑通
- ForgeIR 完整定义

### 任务清单

- [x] 初始化项目结构
- [x] 配置 TypeScript + Vite
- [x] 配置 ESLint + Prettier
- [x] 配置 Git Hooks (husky + lint-staged)
- [x] 配置 Commitlint
- [x] 创建项目文档 (README, TODO, CONTRIBUTING)
- [x] 定义 ForgeIR 完整类型 (`src/ir/types.ts`)
- [x] 实现插件入口 (`src/main.ts`)
- [x] 创建 UI 界面 (`src/ui.html`, `src/ui.ts`)
- [x] 实现节点分析器 (`src/ir/analyzer.ts`)
- [x] 实现 IR 优化器 (`src/ir/optimizer.ts`)
- [x] 创建工具函数 (`src/utils/`)

### 验收标准
- [ ] Pixso 中能打开插件
- [ ] 控制台能打印节点树
- [x] ForgeIR 类型定义完整且有注释

---

## Phase 1: Flutter MVP（Week 2）

### 目标
- 选中节点 → 完美 Flutter 代码（布局、圆角、阴影）

### 任务清单

- [ ] 创建基础渲染器 (`src/codegen/base.ts`)
- [ ] 实现 Flutter 渲染器 (`src/codegen/flutter.ts`)
  - [ ] Container / Box 渲染
  - [ ] Row / Column 布局
  - [ ] Text 样式
  - [ ] 圆角边框
  - [ ] 阴影效果
  - [ ] 渐变填充
  - [ ] 图片处理
  - [ ] Stack + Positioned 定位
- [ ] 实现响应式布局支持
  - [ ] MediaQuery 适配
  - [ ] FractionallySizedBox
  - [ ] Flexible / Expanded
- [ ] 代码格式化（dart format 风格）

### 验收标准
- [ ] 复杂页面还原度 ≥90%
- [ ] 生成代码可直接 `flutter run`
- [ ] 支持至少 5 种常见布局模式

---

## Phase 2: Flutter 完善与产品化（Week 3）

### 目标
- 完善 Flutter 代码生成质量
- 产品化准备，上架 Pixso 插件市场

### 任务清单

#### Flutter 进阶功能
- [ ] 复杂布局优化
- [ ] 组件实例识别与复用
- [ ] 代码优化与压缩
- [ ] 边界情况处理

#### UI 优化
- [ ] 重新设计设置面板
- [ ] 添加暗黑模式支持
- [ ] 代码高亮显示
- [ ] 一键复制功能
- [ ] 下载 .dart 文件功能

#### 用户体验
- [ ] 添加加载动画
- [ ] 错误提示优化
- [ ] 快捷键支持

#### 文档与上架
- [ ] 编写使用文档
- [ ] 录制演示视频（2 分钟）
- [ ] 准备上架素材
- [ ] Pixso 插件市场申请
- [ ] 审核材料准备
- [ ] 提交审核

### 验收标准
- [ ] Pixso 官方市场审核通过
- [ ] Flutter 代码生成质量稳定

---

## 后续扩展规划（v2.0+）

> 以下功能将在第一版 Flutter 支持完成并上线后逐步开发

### Phase 3: SwiftUI 支持（v2.0）

- [ ] 实现 SwiftUI 渲染器 (`src/codegen/swiftui.ts`)
  - [ ] VStack / HStack / ZStack
  - [ ] Text 与 Font
  - [ ] Color 与 Gradient
  - [ ] Image 处理
  - [ ] Frame 与 Padding
  - [ ] cornerRadius / shadow
  - [ ] overlay / background
- [ ] 生成 Preview 预览代码
- [ ] 支持 @State / @Binding 变量

### Phase 4: Compose + React（v2.0）

#### Jetpack Compose
- [ ] 实现 Compose 渲染器 (`src/codegen/compose.ts`)
  - [ ] Column / Row / Box
  - [ ] Text 与 TextStyle
  - [ ] Modifier 链式调用
  - [ ] Image 处理
  - [ ] Material3 主题

#### React-TSX
- [ ] 实现 React 渲染器 (`src/codegen/react.ts`)
  - [ ] 函数组件结构
  - [ ] CSS-in-JS / className
  - [ ] Flexbox 布局
  - [ ] Props 类型定义
  - [ ] useState / useEffect

### Phase 5: Vue + 小程序（v2.0）

#### Vue 3
- [ ] 实现 Vue 渲染器 (`src/codegen/vue.ts`)
  - [ ] SFC 结构 (template + script + style)
  - [ ] Composition API
  - [ ] scoped CSS
  - [ ] v-bind / v-for 指令

#### 微信小程序
- [ ] 实现小程序渲染器 (`src/codegen/weapp.ts`)
  - [ ] WXML 模板
  - [ ] WXSS 样式
  - [ ] JS 逻辑
  - [ ] rpx 单位转换
  - [ ] 组件化输出

### Phase 6: 生态扩展（v3.0）

- [ ] Taro 跨端支持
- [ ] React Native 支持
- [ ] GetX 模板支持
- [ ] AI 增强版（通义千问/DeepSeek 接入）
- [ ] 代码注释智能生成
- [ ] 组件库主题对接

---

## 功能支持清单

> 第一版仅包含 Flutter 支持，其他平台为后续扩展目标

| 功能 | Flutter (v1.0) | SwiftUI (v2.0) | Compose (v2.0) | React (v2.0) | Vue 3 (v2.0) | 小程序 (v2.0) |
|------|---------|---------|---------|-------|-------|--------|
| 横/竖布局 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 自动间距 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 约束布局 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 百分比宽度 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 主题色提取 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 文字样式 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 组件实例 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |
| 变体切换 | ⏳ | 📋 | 📋 | 📋 | 📋 | 📋 |

**图例**: ✅ 已完成 | 🚧 进行中 | ⏳ 待开始 (v1.0) | 📋 后续规划 (v2.0+)

---

## 问题与讨论

### 架构相关

1. **ForgeIR 设计考量**
   - 需要平衡通用性和特定平台的表达能力
   - 建议先从 Flutter 开始，逐步抽象

2. **代码生成策略**
   - 模板字符串 vs AST 生成
   - 建议：简单场景用模板，复杂场景用 AST

3. **组件识别算法**
   - 如何区分普通分组和组件
   - 建议：依赖 Pixso 组件实例 API

### 待确认事项

- [ ] Pixso 插件 API 版本确认
- [ ] 目标用户群体定位
- [ ] 是否需要登录/账号系统
- [ ] 是否需要云端同步配置

---

## 更新日志

### 2025-11-27
- 调整开发路线图：第一版专注于 Flutter 代码生成器
- 其他平台（SwiftUI、Compose、React、Vue、小程序）作为 v2.0 后续扩展
- 添加 GitHub Actions CI 流水线
- 初始化项目结构
- 创建基础配置文件
- 编写项目文档
