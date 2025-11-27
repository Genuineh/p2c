# 贡献指南

感谢您对 Pixso CodeForge 项目的关注！本文档将指导您如何参与项目贡献。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境](#开发环境)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题反馈](#问题反馈)

## 行为准则

请在参与项目时保持友善、尊重和包容的态度。我们欢迎所有人的贡献，无论经验水平如何。

## 如何贡献

### 报告 Bug

如果您发现了 Bug，请：

1. 先搜索 [Issues](../../issues) 确认是否已有相关报告
2. 如果没有，请创建新的 Issue，包含：
   - 清晰的标题和描述
   - 复现步骤
   - 期望行为 vs 实际行为
   - 环境信息（Pixso 版本、浏览器等）
   - 相关截图或日志

### 功能建议

我们欢迎功能建议！请创建 Issue 并：

1. 说明您想要的功能
2. 解释为什么这个功能对您有用
3. 如果可能，提供实现思路

### 代码贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 创建 Pull Request

## 开发环境

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/Genuineh/p2c.git
cd p2c

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

### 常用命令

```bash
npm run dev         # 开发模式（热重载）
npm run build       # 构建生产版本
npm run lint        # 代码检查
npm run lint:fix    # 自动修复代码问题
npm run format      # 格式化代码
npm run typecheck   # TypeScript 类型检查
```

## 代码规范

### TypeScript

- 使用严格模式 (`strict: true`)
- 为函数和类添加适当的类型注解
- 避免使用 `any`，必要时使用 `unknown` 并进行类型收窄
- 使用有意义的变量和函数名

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `nodeWidth`, `textColor` |
| 常量 | UPPER_SNAKE_CASE | `MAX_DEPTH`, `DEFAULT_PADDING` |
| 函数 | camelCase | `analyzeNode()`, `renderFlutter()` |
| 类/接口 | PascalCase | `ForgeNode`, `FlutterRenderer` |
| 类型 | PascalCase | `NodeType`, `LayoutDirection` |
| 文件 | kebab-case 或 camelCase | `flutter-renderer.ts`, `forgeIR.ts` |

### 目录结构

```
src/
├── ir/           # 中间表示层
├── codegen/      # 代码生成器
├── utils/        # 工具函数
└── assets/       # 静态资源
```

### 代码格式

- 使用 Prettier 自动格式化
- 缩进使用 2 空格
- 使用单引号
- 行尾使用分号
- 最大行宽 100 字符

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更
- `revert`: 回滚
- `build`: 打包相关
- `ci`: CI 相关

### 示例

```bash
# 新功能
git commit -m "feat(flutter): add gradient support"

# Bug 修复
git commit -m "fix(analyzer): handle null padding values"

# 文档更新
git commit -m "docs: update installation guide"

# 带有详细说明
git commit -m "feat(codegen): implement SwiftUI renderer

- Add VStack/HStack layout support
- Add Text rendering with font styles
- Add Color handling

Closes #123"
```

## Pull Request 流程

### 创建 PR 前

1. 确保代码通过所有检查：
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

2. 更新相关文档（如有必要）

3. 添加测试（如适用）

### PR 标题格式

与 commit 格式一致：
```
feat(flutter): add gradient support
```

### PR 描述模板

```markdown
## 变更内容

简要描述此 PR 的变更内容

## 变更类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 其他

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 自测通过
- [ ] 相关文档已更新
- [ ] 没有引入新的警告

## 相关 Issue

Closes #xxx
```

### 审核流程

1. 至少需要 1 位维护者审核
2. 所有 CI 检查必须通过
3. 解决所有审核意见后方可合并

## 问题反馈

如有任何问题，欢迎：

- 创建 [Issue](../../issues)
- 发起 [Discussion](../../discussions)

感谢您的贡献！🎉
