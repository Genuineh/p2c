/**
 * IR 优化器
 * 对 ForgeIR 进行优化，如合并文本、提取公共样式等
 */

import type {
  ForgeNode,
  ForgeContainerNode,
  ForgeDocument,
  ForgeTheme,
  ForgeColor,
  ForgeTextStyle,
} from './types';

/**
 * 优化器配置
 */
export interface OptimizerConfig {
  /** 是否合并相邻文本 */
  mergeAdjacentText?: boolean;
  /** 是否提取公共样式 */
  extractCommonStyles?: boolean;
  /** 是否移除空容器 */
  removeEmptyContainers?: boolean;
  /** 是否扁平化单子元素容器 */
  flattenSingleChild?: boolean;
}

/**
 * IR 优化器类
 */
export class IROptimizer {
  private config: OptimizerConfig;

  constructor(config: OptimizerConfig = {}) {
    this.config = {
      mergeAdjacentText: true,
      extractCommonStyles: true,
      removeEmptyContainers: true,
      flattenSingleChild: false,
      ...config,
    };
  }

  /**
   * 优化整个文档
   */
  optimize(document: ForgeDocument): ForgeDocument {
    let optimizedRoot = document.root;

    // 移除空容器
    if (this.config.removeEmptyContainers) {
      optimizedRoot = this.removeEmptyContainers(optimizedRoot);
    }

    // 扁平化单子元素容器
    if (this.config.flattenSingleChild) {
      optimizedRoot = this.flattenSingleChild(optimizedRoot);
    }

    // 提取公共样式
    let theme = document.theme;
    if (this.config.extractCommonStyles) {
      theme = this.extractCommonStyles(optimizedRoot, theme);
    }

    return {
      ...document,
      root: optimizedRoot,
      theme,
    };
  }

  /**
   * 移除空容器
   */
  private removeEmptyContainers(node: ForgeNode): ForgeNode {
    if (!this.isContainerNode(node)) {
      return node;
    }

    const container = node as ForgeContainerNode;
    const optimizedChildren = container.children
      .map((child) => this.removeEmptyContainers(child))
      .filter((child) => {
        if (this.isContainerNode(child)) {
          const childContainer = child as ForgeContainerNode;
          // 保留有填充或边框的空容器
          if (
            childContainer.children.length === 0 &&
            !childContainer.fills?.length &&
            !childContainer.strokes?.length
          ) {
            return false;
          }
        }
        return true;
      });

    return {
      ...container,
      children: optimizedChildren,
    };
  }

  /**
   * 扁平化单子元素容器
   */
  private flattenSingleChild(node: ForgeNode): ForgeNode {
    if (!this.isContainerNode(node)) {
      return node;
    }

    const container = node as ForgeContainerNode;

    // 先递归处理子节点
    const optimizedChildren = container.children.map((child) => this.flattenSingleChild(child));

    // 如果只有一个子元素且容器没有特殊样式，可以扁平化
    if (
      optimizedChildren.length === 1 &&
      !container.fills?.length &&
      !container.strokes?.length &&
      !container.shadows?.length &&
      !container.padding
    ) {
      const child = optimizedChildren[0];
      // 合并位置信息
      return {
        ...child,
        x: container.x + child.x,
        y: container.y + child.y,
      };
    }

    return {
      ...container,
      children: optimizedChildren,
    };
  }

  /**
   * 提取公共样式
   */
  private extractCommonStyles(node: ForgeNode, theme?: ForgeTheme): ForgeTheme {
    const colors: Map<string, { color: ForgeColor; count: number }> = new Map();
    const textStyles: Map<string, { style: ForgeTextStyle; count: number }> = new Map();

    // 遍历所有节点，收集颜色和文本样式
    this.collectStyles(node, colors, textStyles);

    // 找出使用频率高的样式
    const commonColors: Record<string, ForgeColor> = {};
    let colorIndex = 1;
    colors.forEach(({ color, count }) => {
      if (count >= 2) {
        // 至少使用 2 次才提取
        commonColors[`commonColor${colorIndex}`] = color;
        colorIndex++;
      }
    });

    const commonTextStyles: Record<string, ForgeTextStyle> = {};
    let styleIndex = 1;
    textStyles.forEach(({ style, count }) => {
      if (count >= 2) {
        commonTextStyles[`commonTextStyle${styleIndex}`] = style;
        styleIndex++;
      }
    });

    return {
      ...theme,
      colors: {
        ...theme?.colors,
        custom: {
          ...theme?.colors?.custom,
          ...commonColors,
        },
      },
      textStyles: {
        ...theme?.textStyles,
        custom: {
          ...theme?.textStyles?.custom,
          ...commonTextStyles,
        },
      },
    };
  }

  /**
   * 递归收集样式
   */
  private collectStyles(
    node: ForgeNode,
    colors: Map<string, { color: ForgeColor; count: number }>,
    textStyles: Map<string, { style: ForgeTextStyle; count: number }>
  ): void {
    // 收集填充颜色
    if ('fills' in node && node.fills) {
      for (const fill of node.fills) {
        if (fill.type === 'solid' && fill.color) {
          const key = this.colorToKey(fill.color);
          const existing = colors.get(key);
          if (existing) {
            existing.count++;
          } else {
            colors.set(key, { color: fill.color, count: 1 });
          }
        }
      }
    }

    // 收集文本样式
    if (node.type === 'text' && 'textStyle' in node) {
      const key = this.textStyleToKey(node.textStyle);
      const existing = textStyles.get(key);
      if (existing) {
        existing.count++;
      } else {
        textStyles.set(key, { style: node.textStyle, count: 1 });
      }
    }

    // 递归处理子节点
    if (this.isContainerNode(node)) {
      for (const child of (node as ForgeContainerNode).children) {
        this.collectStyles(child, colors, textStyles);
      }
    }
  }

  /**
   * 颜色转键值
   */
  private colorToKey(color: ForgeColor): string {
    return `${color.r}-${color.g}-${color.b}-${Math.round(color.a * 100)}`;
  }

  /**
   * 文本样式转键值
   */
  private textStyleToKey(style: ForgeTextStyle): string {
    return `${style.fontFamily}-${style.fontSize}-${style.fontWeight}-${style.color ? this.colorToKey(style.color) : 'none'}`;
  }

  /**
   * 判断是否为容器节点
   */
  private isContainerNode(node: ForgeNode): boolean {
    return (
      node.type === 'frame' ||
      node.type === 'group' ||
      node.type === 'component' ||
      node.type === 'instance'
    );
  }
}
