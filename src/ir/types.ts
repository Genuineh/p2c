/**
 * ForgeIR - 中间表示层类型定义
 *
 * ForgeIR 是设计节点到目标代码的桥梁，抽象了不同平台的差异，
 * 提供统一的数据结构供各个渲染器使用。
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 颜色表示
 */
export interface ForgeColor {
  /** 红色通道 0-255 */
  r: number;
  /** 绿色通道 0-255 */
  g: number;
  /** 蓝色通道 0-255 */
  b: number;
  /** 透明度 0-1 */
  a: number;
}

/**
 * 渐变停止点
 */
export interface ForgeGradientStop {
  /** 位置 0-1 */
  position: number;
  /** 颜色 */
  color: ForgeColor;
}

/**
 * 渐变类型
 */
export type ForgeGradientType = 'linear' | 'radial' | 'angular' | 'diamond';

/**
 * 渐变定义
 */
export interface ForgeGradient {
  /** 渐变类型 */
  type: ForgeGradientType;
  /** 渐变停止点 */
  stops: ForgeGradientStop[];
  /** 起始点 (0-1) */
  start?: { x: number; y: number };
  /** 结束点 (0-1) */
  end?: { x: number; y: number };
  /** 旋转角度（度） */
  angle?: number;
}

/**
 * 填充类型
 */
export type ForgeFillType = 'solid' | 'gradient' | 'image';

/**
 * 填充定义
 */
export interface ForgeFill {
  /** 填充类型 */
  type: ForgeFillType;
  /** 不透明度 0-1 */
  opacity?: number;
  /** 纯色填充 */
  color?: ForgeColor;
  /** 渐变填充 */
  gradient?: ForgeGradient;
  /** 图片填充 */
  imageUrl?: string;
  /** 图片填充模式 */
  imageMode?: 'fill' | 'fit' | 'crop' | 'tile';
}

/**
 * 边框样式
 */
export type ForgeStrokeStyle = 'solid' | 'dashed' | 'dotted';

/**
 * 边框对齐
 */
export type ForgeStrokeAlign = 'inside' | 'center' | 'outside';

/**
 * 边框定义
 */
export interface ForgeStroke {
  /** 边框颜色 */
  color: ForgeColor;
  /** 边框宽度 */
  width: number;
  /** 边框样式 */
  style?: ForgeStrokeStyle;
  /** 边框对齐 */
  align?: ForgeStrokeAlign;
}

/**
 * 阴影定义
 */
export interface ForgeShadow {
  /** 阴影颜色 */
  color: ForgeColor;
  /** X 偏移 */
  offsetX: number;
  /** Y 偏移 */
  offsetY: number;
  /** 模糊半径 */
  blur: number;
  /** 扩展半径 */
  spread?: number;
  /** 是否内阴影 */
  inner?: boolean;
}

/**
 * 圆角定义（支持不同角的不同圆角值）
 */
export interface ForgeCornerRadius {
  /** 左上角 */
  topLeft: number;
  /** 右上角 */
  topRight: number;
  /** 右下角 */
  bottomRight: number;
  /** 左下角 */
  bottomLeft: number;
}

/**
 * 内边距定义
 */
export interface ForgePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ============================================================================
// 布局类型
// ============================================================================

/**
 * 布局方向
 */
export type ForgeLayoutDirection = 'horizontal' | 'vertical' | 'none';

/**
 * 主轴对齐
 */
export type ForgeMainAxisAlignment =
  | 'start'
  | 'center'
  | 'end'
  | 'spaceBetween'
  | 'spaceAround'
  | 'spaceEvenly';

/**
 * 交叉轴对齐
 */
export type ForgeCrossAxisAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * 布局约束
 */
export interface ForgeConstraints {
  /** 是否固定宽度 */
  fixedWidth?: boolean;
  /** 是否固定高度 */
  fixedHeight?: boolean;
  /** 宽度百分比 (0-1) */
  widthPercent?: number;
  /** 高度百分比 (0-1) */
  heightPercent?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最小高度 */
  minHeight?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 宽高比 */
  aspectRatio?: number;
}

/**
 * 定位信息（用于绝对定位）
 */
export interface ForgePosition {
  /** 距离顶部 */
  top?: number;
  /** 距离右侧 */
  right?: number;
  /** 距离底部 */
  bottom?: number;
  /** 距离左侧 */
  left?: number;
}

// ============================================================================
// 文本类型
// ============================================================================

/**
 * 文本对齐
 */
export type ForgeTextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * 文本装饰
 */
export type ForgeTextDecoration = 'none' | 'underline' | 'lineThrough' | 'overline';

/**
 * 字体粗细
 */
export type ForgeFontWeight =
  | 'thin'
  | 'extraLight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black';

/**
 * 文本样式定义
 */
export interface ForgeTextStyle {
  /** 字体族 */
  fontFamily?: string;
  /** 字体大小 */
  fontSize: number;
  /** 字体粗细 */
  fontWeight?: ForgeFontWeight;
  /** 是否斜体 */
  italic?: boolean;
  /** 文本颜色 */
  color?: ForgeColor;
  /** 行高 */
  lineHeight?: number;
  /** 字间距 */
  letterSpacing?: number;
  /** 文本装饰 */
  decoration?: ForgeTextDecoration;
  /** 文本对齐 */
  textAlign?: ForgeTextAlign;
}

// ============================================================================
// 节点类型
// ============================================================================

/**
 * 节点类型枚举
 */
export type ForgeNodeType =
  | 'frame'
  | 'group'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'vector'
  | 'text'
  | 'image'
  | 'component'
  | 'instance';

/**
 * 基础节点属性
 */
export interface ForgeBaseNode {
  /** 节点 ID */
  id: string;
  /** 节点名称 */
  name: string;
  /** 节点类型 */
  type: ForgeNodeType;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** X 坐标（相对于父节点） */
  x: number;
  /** Y 坐标（相对于父节点） */
  y: number;
  /** 旋转角度 */
  rotation?: number;
  /** 不透明度 0-1 */
  opacity?: number;
  /** 是否可见 */
  visible?: boolean;
  /** 是否锁定 */
  locked?: boolean;
}

/**
 * 容器节点（Frame/Group）
 */
export interface ForgeContainerNode extends ForgeBaseNode {
  type: 'frame' | 'group';
  /** 子节点 */
  children: ForgeNode[];
  /** 布局方向 */
  layoutDirection?: ForgeLayoutDirection;
  /** 主轴对齐 */
  mainAxisAlignment?: ForgeMainAxisAlignment;
  /** 交叉轴对齐 */
  crossAxisAlignment?: ForgeCrossAxisAlignment;
  /** 子元素间距 */
  itemSpacing?: number;
  /** 内边距 */
  padding?: ForgePadding;
  /** 填充 */
  fills?: ForgeFill[];
  /** 边框 */
  strokes?: ForgeStroke[];
  /** 阴影 */
  shadows?: ForgeShadow[];
  /** 圆角 */
  cornerRadius?: ForgeCornerRadius | number;
  /** 约束 */
  constraints?: ForgeConstraints;
  /** 裁剪内容 */
  clipsContent?: boolean;
}

/**
 * 矩形节点
 */
export interface ForgeRectangleNode extends ForgeBaseNode {
  type: 'rectangle';
  /** 填充 */
  fills?: ForgeFill[];
  /** 边框 */
  strokes?: ForgeStroke[];
  /** 阴影 */
  shadows?: ForgeShadow[];
  /** 圆角 */
  cornerRadius?: ForgeCornerRadius | number;
}

/**
 * 椭圆节点
 */
export interface ForgeEllipseNode extends ForgeBaseNode {
  type: 'ellipse';
  /** 填充 */
  fills?: ForgeFill[];
  /** 边框 */
  strokes?: ForgeStroke[];
  /** 阴影 */
  shadows?: ForgeShadow[];
}

/**
 * 文本节点
 */
export interface ForgeTextNode extends ForgeBaseNode {
  type: 'text';
  /** 文本内容 */
  content: string;
  /** 文本样式 */
  textStyle: ForgeTextStyle;
  /** 是否自动调整大小 */
  autoResize?: 'width' | 'height' | 'none';
  /** 最大行数 */
  maxLines?: number;
  /** 超出省略 */
  overflow?: 'clip' | 'ellipsis' | 'visible';
}

/**
 * 图片节点
 */
export interface ForgeImageNode extends ForgeBaseNode {
  type: 'image';
  /** 图片 URL */
  imageUrl?: string;
  /** 图片 hash（用于导出） */
  imageHash?: string;
  /** 图片模式 */
  imageMode?: 'fill' | 'fit' | 'crop' | 'tile';
  /** 圆角 */
  cornerRadius?: ForgeCornerRadius | number;
}

/**
 * 矢量节点
 */
export interface ForgeVectorNode extends ForgeBaseNode {
  type: 'vector' | 'polygon' | 'star';
  /** 填充 */
  fills?: ForgeFill[];
  /** 边框 */
  strokes?: ForgeStroke[];
  /** SVG 路径数据 */
  svgPath?: string;
}

/**
 * 组件定义节点
 */
export interface ForgeComponentNode extends ForgeBaseNode {
  type: 'component';
  /** 子节点 */
  children: ForgeNode[];
  /** 组件描述 */
  description?: string;
  /** 变体属性 */
  variantProperties?: Record<string, string>;
  /** 组件属性定义 */
  componentProperties?: ForgeComponentProperty[];
}

/**
 * 组件实例节点
 */
export interface ForgeInstanceNode extends ForgeBaseNode {
  type: 'instance';
  /** 子节点（覆盖后的） */
  children: ForgeNode[];
  /** 主组件 ID */
  mainComponentId?: string;
  /** 组件名称 */
  componentName?: string;
  /** 覆盖的属性 */
  overriddenProperties?: Record<string, unknown>;
}

/**
 * 组件属性定义
 */
export interface ForgeComponentProperty {
  /** 属性名 */
  name: string;
  /** 属性类型 */
  type: 'boolean' | 'text' | 'instanceSwap' | 'variant';
  /** 默认值 */
  defaultValue?: unknown;
  /** 可选值（用于 variant） */
  variantOptions?: string[];
}

/**
 * 所有节点类型的联合
 */
export type ForgeNode =
  | ForgeContainerNode
  | ForgeRectangleNode
  | ForgeEllipseNode
  | ForgeTextNode
  | ForgeImageNode
  | ForgeVectorNode
  | ForgeComponentNode
  | ForgeInstanceNode;

// ============================================================================
// 主题类型
// ============================================================================

/**
 * 颜色主题
 */
export interface ForgeColorTheme {
  /** 主色 */
  primary?: ForgeColor;
  /** 次要色 */
  secondary?: ForgeColor;
  /** 背景色 */
  background?: ForgeColor;
  /** 表面色 */
  surface?: ForgeColor;
  /** 错误色 */
  error?: ForgeColor;
  /** 文本色 */
  onPrimary?: ForgeColor;
  onSecondary?: ForgeColor;
  onBackground?: ForgeColor;
  onSurface?: ForgeColor;
  onError?: ForgeColor;
  /** 自定义颜色 */
  custom?: Record<string, ForgeColor>;
}

/**
 * 文本主题
 */
export interface ForgeTextTheme {
  /** 标题样式 */
  headline1?: ForgeTextStyle;
  headline2?: ForgeTextStyle;
  headline3?: ForgeTextStyle;
  headline4?: ForgeTextStyle;
  headline5?: ForgeTextStyle;
  headline6?: ForgeTextStyle;
  /** 正文样式 */
  bodyText1?: ForgeTextStyle;
  bodyText2?: ForgeTextStyle;
  /** 副标题样式 */
  subtitle1?: ForgeTextStyle;
  subtitle2?: ForgeTextStyle;
  /** 按钮文字 */
  button?: ForgeTextStyle;
  /** 说明文字 */
  caption?: ForgeTextStyle;
  /** 重载文字 */
  overline?: ForgeTextStyle;
  /** 自定义样式 */
  custom?: Record<string, ForgeTextStyle>;
}

/**
 * 完整主题
 */
export interface ForgeTheme {
  /** 主题名称 */
  name?: string;
  /** 是否暗色模式 */
  isDark?: boolean;
  /** 颜色主题 */
  colors?: ForgeColorTheme;
  /** 文本主题 */
  textStyles?: ForgeTextTheme;
}

// ============================================================================
// 输出配置
// ============================================================================

/**
 * 目标平台
 */
export type ForgeTargetPlatform =
  | 'flutter'
  | 'swiftui'
  | 'compose'
  | 'react'
  | 'vue'
  | 'weapp'
  | 'taro';

/**
 * 代码生成配置
 */
export interface ForgeCodegenConfig {
  /** 目标平台 */
  target: ForgeTargetPlatform;
  /** 是否生成注释 */
  generateComments?: boolean;
  /** 是否使用响应式布局 */
  useResponsive?: boolean;
  /** 缩进大小 */
  indentSize?: number;
  /** 使用空格缩进 */
  useSpaces?: boolean;
  /** 组件名称前缀 */
  componentPrefix?: string;
  /** 主题变量名 */
  themeVariableName?: string;
  /** Flutter 特定配置 */
  flutter?: {
    /** 使用 Null Safety */
    nullSafety?: boolean;
    /** 使用 const 关键字 */
    useConst?: boolean;
    /** 状态管理方案 */
    stateManagement?: 'setState' | 'provider' | 'bloc' | 'getx';
  };
  /** SwiftUI 特定配置 */
  swiftui?: {
    /** 最低 iOS 版本 */
    minimumIOSVersion?: number;
    /** 使用 @StateObject */
    useStateObject?: boolean;
  };
  /** React 特定配置 */
  react?: {
    /** 样式方案 */
    styling?: 'css' | 'cssModules' | 'styled-components' | 'tailwind';
    /** 使用 TypeScript */
    useTypeScript?: boolean;
  };
  /** Vue 特定配置 */
  vue?: {
    /** API 风格 */
    apiStyle?: 'options' | 'composition';
    /** 使用 TypeScript */
    useTypeScript?: boolean;
  };
  /** 小程序特定配置 */
  weapp?: {
    /** 单位 */
    unit?: 'rpx' | 'px';
    /** 设计稿宽度 */
    designWidth?: number;
  };
}

// ============================================================================
// 完整 IR 文档
// ============================================================================

/**
 * ForgeIR 完整文档
 * 包含页面/组件的所有信息，是代码生成的输入
 */
export interface ForgeDocument {
  /** 文档名称 */
  name: string;
  /** 页面 ID */
  pageId?: string;
  /** 根节点 */
  root: ForgeNode;
  /** 提取的主题 */
  theme?: ForgeTheme;
  /** 组件定义列表（用于生成独立组件文件） */
  components?: ForgeComponentNode[];
  /** 生成配置 */
  config?: ForgeCodegenConfig;
  /** 元数据 */
  metadata?: {
    /** 创建时间 */
    createdAt?: string;
    /** 来源插件版本 */
    pluginVersion?: string;
    /** Pixso 文档 ID */
    documentId?: string;
  };
}
