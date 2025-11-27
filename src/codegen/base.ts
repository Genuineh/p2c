/**
 * 基础渲染器
 * 定义代码生成器的通用接口和基础实现
 */

import type {
  ForgeNode,
  ForgeDocument,
  ForgeCodegenConfig,
  ForgeTargetPlatform,
  ForgeColor,
  ForgeCornerRadius,
  ForgePadding,
} from '../ir/types';

/**
 * 渲染结果
 */
export interface RenderResult {
  /** 文件名 */
  filename: string;
  /** 文件内容 */
  content: string;
  /** 文件类型 */
  type: 'dart' | 'swift' | 'kt' | 'tsx' | 'vue' | 'wxml' | 'wxss' | 'js' | 'css';
}

/**
 * 基础渲染器抽象类
 */
export abstract class BaseRenderer {
  protected config: ForgeCodegenConfig;
  protected indentLevel: number = 0;

  constructor(config: ForgeCodegenConfig) {
    this.config = {
      indentSize: 2,
      useSpaces: true,
      generateComments: true,
      ...config,
    };
  }

  /**
   * 获取目标平台
   */
  abstract get platform(): ForgeTargetPlatform;

  /**
   * 渲染文档
   */
  abstract render(document: ForgeDocument): RenderResult[];

  /**
   * 渲染单个节点
   */
  abstract renderNode(node: ForgeNode): string;

  // ============================================================================
  // 辅助方法
  // ============================================================================

  /**
   * 获取缩进字符串
   */
  protected indent(): string {
    const char = this.config.useSpaces ? ' ' : '\t';
    const size = this.config.useSpaces ? this.config.indentSize || 2 : 1;
    return char.repeat(size * this.indentLevel);
  }

  /**
   * 增加缩进级别
   */
  protected pushIndent(): void {
    this.indentLevel++;
  }

  /**
   * 减少缩进级别
   */
  protected popIndent(): void {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }

  /**
   * 添加一行代码
   */
  protected line(content: string): string {
    return `${this.indent()}${content}\n`;
  }

  /**
   * 添加空行
   */
  protected emptyLine(): string {
    return '\n';
  }

  /**
   * 添加注释
   */
  protected comment(text: string): string {
    if (!this.config.generateComments) {
      return '';
    }
    return this.line(`// ${text}`);
  }

  /**
   * 颜色转 Hex
   */
  protected colorToHex(color: ForgeColor): string {
    const r = color.r.toString(16).padStart(2, '0');
    const g = color.g.toString(16).padStart(2, '0');
    const b = color.b.toString(16).padStart(2, '0');
    if (color.a < 1) {
      const a = Math.round(color.a * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${a}${r}${g}${b}`;
    }
    return `#${r}${g}${b}`;
  }

  /**
   * 颜色转 RGBA 字符串
   */
  protected colorToRgba(color: ForgeColor): string {
    if (color.a < 1) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
   * 数值格式化（移除不必要的小数位）
   */
  protected formatNumber(value: number, decimals: number = 1): string {
    const fixed = value.toFixed(decimals);
    return parseFloat(fixed).toString();
  }

  /**
   * 检查圆角是否统一
   */
  protected isUniformCornerRadius(
    radius: ForgeCornerRadius | number | undefined
  ): radius is number {
    return typeof radius === 'number';
  }

  /**
   * 获取圆角值
   */
  protected getCornerRadiusValue(radius: ForgeCornerRadius | number | undefined): number {
    if (typeof radius === 'number') {
      return radius;
    }
    if (radius) {
      // 返回最大值
      return Math.max(radius.topLeft, radius.topRight, radius.bottomRight, radius.bottomLeft);
    }
    return 0;
  }

  /**
   * 检查内边距是否统一
   */
  protected isUniformPadding(padding: ForgePadding | undefined): boolean {
    if (!padding) return true;
    return (
      padding.top === padding.right &&
      padding.right === padding.bottom &&
      padding.bottom === padding.left
    );
  }

  /**
   * 生成安全的变量名
   */
  protected toSafeVariableName(name: string): string {
    // 移除非法字符，转换为 camelCase
    return name
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  /**
   * 生成组件名称（PascalCase）
   */
  protected toComponentName(name: string): string {
    const prefix = this.config.componentPrefix || '';
    const baseName = name
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return prefix + baseName;
  }
}
