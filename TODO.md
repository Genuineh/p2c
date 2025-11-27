# Pixso CodeForge 开发任务清单

> 本文档记录项目开发进度和待完成任务，按阶段划分

## 开发阶段总览

| 阶段 | 周数 | 状态 | 核心目标 |
|------|-----|------|---------|
| Phase 0 | Week 1 | 🚧 进行中 | 环境搭建与 IR 设计 |
| Phase 1 | Week 2 | ⏳ 待开始 | Flutter MVP |
| Phase 2 | Week 3 | ⏳ 待开始 | SwiftUI 支持 |
| Phase 3 | Week 4 | ⏳ 待开始 | Compose + React |
| Phase 4 | Week 5 | ⏳ 待开始 | Vue + 小程序 |
| Phase 5 | Week 6 | ⏳ 待开始 | 产品化与上线 |
| Phase 6 | Week 7+ | 📋 规划中 | 生态扩展（可选） |

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
- [ ] 定义 ForgeIR 完整类型 (`src/ir/types.ts`)
- [ ] 实现插件入口 (`src/main.ts`)
- [ ] 创建 UI 界面 (`src/ui.html`, `src/ui.ts`)
- [ ] 实现节点分析器 (`src/ir/analyzer.ts`)
- [ ] 实现 IR 优化器 (`src/ir/optimizer.ts`)
- [ ] 创建工具函数 (`src/utils/`)

### 验收标准
- [ ] Pixso 中能打开插件
- [ ] 控制台能打印节点树
- [ ] ForgeIR 类型定义完整且有注释

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

## Phase 2: SwiftUI（Week 3）

### 目标
- 同等质量的 SwiftUI 代码生成

### 任务清单

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

### 验收标准
- [ ] Xcode 中零修改直接预览
- [ ] 支持 iOS 15+ 语法

---

## Phase 3: Compose + React（Week 4）

### 目标
- Jetpack Compose + React-TSX 并行完成

### 任务清单

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

#### 通用
- [ ] 主题色自动提取
- [ ] 文字样式自动提取

### 验收标准
- [ ] Android Studio 中可运行 Compose 代码
- [ ] 浏览器中可运行 React 代码

---

## Phase 4: Vue + 小程序（Week 5）

### 目标
- Vue 3 + 微信小程序代码生成

### 任务清单

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

### 验收标准
- [ ] 微信开发者工具零报错
- [ ] Vue 代码可用 Vite 运行

---

## Phase 5: 产品化与上线（Week 6）

### 目标
- 美化 UI + 批量导出 + 文档 + 视频 + 上架

### 任务清单

#### UI 优化
- [ ] 重新设计设置面板
- [ ] 添加暗黑模式支持
- [ ] 代码高亮显示
- [ ] 一键复制功能
- [ ] 下载 .zip 功能

#### 用户体验
- [ ] 添加加载动画
- [ ] 错误提示优化
- [ ] 快捷键支持

#### 文档与营销
- [ ] 编写使用文档
- [ ] 录制演示视频（2 分钟）
- [ ] 准备上架素材

#### 上架
- [ ] Pixso 插件市场申请
- [ ] 审核材料准备
- [ ] 提交审核

### 验收标准
- [ ] Pixso 官方市场审核通过
- [ ] 首周下载量破万

---

## Phase 6: 生态扩展（Week 7+，可选）

### 规划内容

- [ ] Taro 跨端支持
- [ ] React Native 支持
- [ ] GetX 模板支持
- [ ] AI 增强版（通义千问/DeepSeek 接入）
- [ ] 代码注释智能生成
- [ ] 组件库主题对接

### 目标
- 月活破 5 万

---

## 功能支持清单

| 功能 | Flutter | SwiftUI | Compose | React | Vue 3 | 小程序 |
|------|---------|---------|---------|-------|-------|--------|
| 横/竖布局 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 自动间距 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 约束布局 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 百分比宽度 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 主题色提取 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 文字样式 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 组件实例 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 变体切换 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

**图例**: ✅ 已完成 | 🚧 进行中 | ⏳ 待开始

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
- 初始化项目结构
- 创建基础配置文件
- 编写项目文档
