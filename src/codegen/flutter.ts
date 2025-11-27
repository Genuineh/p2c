/**
 * Flutter 代码渲染器
 *
 * 支持功能：
 * - Container / Box 渲染
 * - Row / Column 布局
 * - Text 样式
 * - 圆角边框
 * - 阴影效果
 * - 渐变填充
 * - 图片处理
 * - Stack + Positioned 定位
 * - 响应式布局（MediaQuery、FractionallySizedBox、Flexible、Expanded）
 */

import type {
  ForgeNode,
  ForgeDocument,
  ForgeContainerNode,
  ForgeTextNode,
  ForgeRectangleNode,
  ForgeEllipseNode,
  ForgeImageNode,
  ForgeFill,
  ForgeStroke,
  ForgeShadow,
  ForgeColor,
  ForgeCornerRadius,
  ForgePadding,
  ForgeCodegenConfig,
  ForgeConstraints,
} from '../ir/types';
import { BaseRenderer, RenderResult } from './base';

/** Default placeholder URL for images without a source */
const DEFAULT_PLACEHOLDER_URL = 'https://placeholder.com/image';

/**
 * Flutter 渲染器
 */
export class FlutterRenderer extends BaseRenderer {
  constructor(config: ForgeCodegenConfig) {
    super({
      ...config,
      target: 'flutter',
    });
  }

  get platform() {
    return 'flutter' as const;
  }

  /**
   * 渲染整个文档
   */
  render(document: ForgeDocument): RenderResult[] {
    const results: RenderResult[] = [];

    // 生成主组件文件
    const componentName = this.toComponentName(document.name || 'GeneratedWidget');
    let content = this.generateWidgetFile(componentName, document.root);

    // 应用 Dart 代码格式化
    content = this.formatDartCode(content);

    results.push({
      filename: `${this.toSnakeCase(componentName)}.dart`,
      content,
      type: 'dart',
    });

    return results;
  }

  /**
   * 生成 Widget 文件
   */
  private generateWidgetFile(componentName: string, root: ForgeNode): string {
    let code = '';

    // 导入语句
    code += "import 'package:flutter/material.dart';\n";
    code += '\n';

    // Widget 类
    code += `class ${componentName} extends StatelessWidget {\n`;
    code += `  const ${componentName}({super.key});\n`;
    code += '\n';
    code += '  @override\n';
    code += '  Widget build(BuildContext context) {\n';

    // 渲染根节点
    this.indentLevel = 2;
    code += this.renderNode(root);

    code += '  }\n';
    code += '}\n';

    return code;
  }

  /**
   * 渲染单个节点
   */
  renderNode(node: ForgeNode): string {
    switch (node.type) {
      case 'frame':
      case 'group':
        return this.renderContainer(node as ForgeContainerNode);
      case 'rectangle':
        return this.renderRectangle(node as ForgeRectangleNode);
      case 'ellipse':
        return this.renderEllipse(node as ForgeEllipseNode);
      case 'text':
        return this.renderText(node as ForgeTextNode);
      case 'image':
        return this.renderImage(node as ForgeImageNode);
      case 'component':
      case 'instance':
        return this.renderContainer(node as unknown as ForgeContainerNode);
      default:
        return this.line(`// Unsupported node type: ${node.type}`);
    }
  }

  /**
   * 渲染容器节点
   */
  private renderContainer(node: ForgeContainerNode): string {
    const hasDecoration = !!(
      (node.fills && node.fills.length > 0) ||
      (node.strokes && node.strokes.length > 0) ||
      (node.shadows && node.shadows.length > 0) ||
      node.cornerRadius
    );

    const hasLayout = !!(node.layoutDirection && node.layoutDirection !== 'none');
    const hasPadding = !!(node.padding && !this.isZeroPadding(node.padding));
    const hasResponsiveConstraints = this.hasResponsiveConstraints(node.constraints);

    // 如果没有子节点且没有样式，返回 SizedBox
    if (node.children.length === 0 && !hasDecoration && !hasResponsiveConstraints) {
      return this.line(
        `return SizedBox(width: ${this.formatNumber(node.width)}, height: ${this.formatNumber(node.height)});`
      );
    }

    let code = '';

    // 响应式布局包装
    if (hasResponsiveConstraints && this.config.useResponsive) {
      code += this.renderResponsiveWrapper(node.constraints!, () => {
        return this.renderContainerContent(
          node,
          hasDecoration,
          hasLayout,
          hasPadding,
          hasResponsiveConstraints
        );
      });
    } else {
      code += this.renderContainerContent(
        node,
        hasDecoration,
        hasLayout,
        hasPadding,
        hasResponsiveConstraints
      );
    }

    return code;
  }

  /**
   * 渲染容器内容
   */
  private renderContainerContent(
    node: ForgeContainerNode,
    hasDecoration: boolean,
    hasLayout: boolean,
    hasPadding: boolean,
    hasResponsiveConstraints: boolean
  ): string {
    let code = '';

    // 开始 Container 或布局组件
    if (hasDecoration || hasPadding) {
      code += this.line('return Container(');
      this.pushIndent();

      // 尺寸 - 如果使用响应式约束，可能不需要固定尺寸
      if (node.width > 0 && !hasResponsiveConstraints) {
        code += this.line(`width: ${this.formatNumber(node.width)},`);
      }
      if (node.height > 0 && !hasResponsiveConstraints) {
        code += this.line(`height: ${this.formatNumber(node.height)},`);
      }

      // 约束
      if (node.constraints && !this.config.useResponsive) {
        code += this.renderConstraints(node.constraints);
      }

      // 内边距
      if (hasPadding) {
        code += this.renderPadding(node.padding!);
      }

      // 装饰
      if (hasDecoration) {
        code += this.renderBoxDecoration(node.fills, node.strokes, node.shadows, node.cornerRadius);
      }

      // 子元素
      if (node.children.length > 0) {
        code += this.line('child: ');
        this.pushIndent();
        code += this.renderChildren(node, !!hasLayout);
        this.popIndent();
      }

      this.popIndent();
      code += this.line(');');
    } else {
      // 直接渲染布局组件
      code += this.line('return ');
      this.pushIndent();
      code += this.renderChildren(node, !!hasLayout);
      this.popIndent();
      code += this.line(';');
    }

    return code;
  }

  /**
   * 渲染子元素
   */
  private renderChildren(node: ForgeContainerNode, hasLayout: boolean): string {
    if (node.children.length === 0) {
      return this.line('const SizedBox.shrink()');
    }

    if (node.children.length === 1) {
      // 递归渲染单个子元素
      const child = node.children[0];
      return this.renderChildWidget(child, hasLayout);
    }

    let code = '';

    if (hasLayout) {
      // 使用 Row 或 Column
      const isHorizontal = node.layoutDirection === 'horizontal';
      const layoutWidget = isHorizontal ? 'Row' : 'Column';

      code += this.line(`${layoutWidget}(`);
      this.pushIndent();

      // 主轴对齐
      if (node.mainAxisAlignment) {
        code += this.line(
          `mainAxisAlignment: MainAxisAlignment.${this.convertMainAxisAlignment(node.mainAxisAlignment)},`
        );
      }

      // 交叉轴对齐
      if (node.crossAxisAlignment) {
        code += this.line(
          `crossAxisAlignment: CrossAxisAlignment.${this.convertCrossAxisAlignment(node.crossAxisAlignment)},`
        );
      }

      // 子元素
      code += this.line('children: [');
      this.pushIndent();

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        code += this.renderChildWidget(child, hasLayout);
        code += ',\n';

        // 添加间距
        if (node.itemSpacing && node.itemSpacing > 0 && i < node.children.length - 1) {
          if (isHorizontal) {
            code += this.line(`SizedBox(width: ${node.itemSpacing}),`);
          } else {
            code += this.line(`SizedBox(height: ${node.itemSpacing}),`);
          }
        }
      }

      this.popIndent();
      code += this.line('],');
      this.popIndent();
      code += this.line(')');
    } else {
      // 使用 Stack
      code += this.line('Stack(');
      this.pushIndent();
      code += this.line('children: [');
      this.pushIndent();

      for (const child of node.children) {
        // 使用 Positioned
        code += this.line('Positioned(');
        this.pushIndent();
        code += this.line(`left: ${this.formatNumber(child.x)},`);
        code += this.line(`top: ${this.formatNumber(child.y)},`);
        code += this.line('child: ');
        code += this.renderChildWidget(child);
        code += ',\n';
        this.popIndent();
        code += this.line('),');
      }

      this.popIndent();
      code += this.line('],');
      this.popIndent();
      code += this.line(')');
    }

    return code;
  }

  /**
   * 渲染子 Widget
   */
  private renderChildWidget(node: ForgeNode, inFlexLayout: boolean = false): string {
    // 检查是否需要 Flexible/Expanded 包装
    const constraints =
      'constraints' in node ? (node as ForgeContainerNode).constraints : undefined;
    const needsFlexWrap =
      inFlexLayout &&
      this.config.useResponsive &&
      constraints &&
      (constraints.widthPercent || constraints.heightPercent);

    let widgetCode = '';

    switch (node.type) {
      case 'frame':
      case 'group':
      case 'component':
      case 'instance':
        widgetCode = this.renderContainerAsChild(node as ForgeContainerNode, inFlexLayout);
        break;
      case 'rectangle':
        widgetCode = this.renderRectangleAsChild(node as ForgeRectangleNode);
        break;
      case 'ellipse':
        widgetCode = this.renderEllipseAsChild(node as ForgeEllipseNode);
        break;
      case 'text':
        widgetCode = this.renderTextAsChild(node as ForgeTextNode);
        break;
      case 'image':
        widgetCode = this.renderImageAsChild(node as ForgeImageNode);
        break;
      default:
        widgetCode = this.line(`// Unsupported: ${node.type}`);
    }

    // 如果需要 Flexible 包装
    if (needsFlexWrap && constraints) {
      return this.wrapWithFlexible(widgetCode, constraints);
    }

    return widgetCode;
  }

  /**
   * 渲染容器作为子元素
   */
  private renderContainerAsChild(node: ForgeContainerNode, inFlexLayout: boolean = false): string {
    const hasDecoration = !!(
      (node.fills && node.fills.length > 0) ||
      (node.strokes && node.strokes.length > 0) ||
      (node.shadows && node.shadows.length > 0) ||
      node.cornerRadius
    );

    const hasLayout = !!(node.layoutDirection && node.layoutDirection !== 'none');
    const hasPadding = !!(node.padding && !this.isZeroPadding(node.padding));
    const hasResponsiveConstraints = !!(
      this.config.useResponsive && this.hasResponsiveConstraints(node.constraints)
    );

    let code = '';

    // 如果使用百分比宽度/高度且不在flex布局中，使用 FractionallySizedBox
    if (hasResponsiveConstraints && !inFlexLayout) {
      code += this.renderFractionallySizedBox(node, hasDecoration, hasLayout, hasPadding);
    } else if (hasDecoration || hasPadding) {
      code += this.line('Container(');
      this.pushIndent();

      if (node.width > 0 && !hasResponsiveConstraints) {
        code += this.line(`width: ${this.formatNumber(node.width)},`);
      }
      if (node.height > 0 && !hasResponsiveConstraints) {
        code += this.line(`height: ${this.formatNumber(node.height)},`);
      }

      // 添加约束
      if (node.constraints && !this.config.useResponsive) {
        code += this.renderConstraints(node.constraints);
      }

      if (hasPadding) {
        code += this.renderPadding(node.padding!);
      }

      if (hasDecoration) {
        code += this.renderBoxDecoration(node.fills, node.strokes, node.shadows, node.cornerRadius);
      }

      if (node.children.length > 0) {
        code += this.line('child: ');
        this.pushIndent();
        code += this.renderChildren(node, !!hasLayout);
        this.popIndent();
        code += ',\n';
      }

      this.popIndent();
      code += this.indent() + ')';
    } else if (node.children.length > 0) {
      code += this.renderChildren(node, !!hasLayout);
    } else {
      code += this.indent() + `SizedBox(width: ${node.width}, height: ${node.height})`;
    }

    return code;
  }

  /**
   * 渲染矩形
   */
  private renderRectangle(node: ForgeRectangleNode): string {
    let code = '';
    code += this.line('return Container(');
    this.pushIndent();

    code += this.line(`width: ${this.formatNumber(node.width)},`);
    code += this.line(`height: ${this.formatNumber(node.height)},`);

    code += this.renderBoxDecoration(node.fills, node.strokes, node.shadows, node.cornerRadius);

    this.popIndent();
    code += this.line(');');

    return code;
  }

  /**
   * 渲染矩形作为子元素
   */
  private renderRectangleAsChild(node: ForgeRectangleNode): string {
    let code = '';
    code += this.line('Container(');
    this.pushIndent();

    code += this.line(`width: ${this.formatNumber(node.width)},`);
    code += this.line(`height: ${this.formatNumber(node.height)},`);

    code += this.renderBoxDecoration(node.fills, node.strokes, node.shadows, node.cornerRadius);

    this.popIndent();
    code += this.indent() + ')';

    return code;
  }

  /**
   * 渲染椭圆
   */
  private renderEllipse(node: ForgeEllipseNode): string {
    let code = '';
    code += this.line('return Container(');
    this.pushIndent();

    code += this.line(`width: ${this.formatNumber(node.width)},`);
    code += this.line(`height: ${this.formatNumber(node.height)},`);

    // 椭圆使用 BoxShape.circle 或椭圆形 BorderRadius
    code += this.line('decoration: BoxDecoration(');
    this.pushIndent();

    if (node.width === node.height) {
      code += this.line('shape: BoxShape.circle,');
    } else {
      code += this.line(
        `borderRadius: BorderRadius.all(Radius.elliptical(${node.width / 2}, ${node.height / 2})),`
      );
    }

    if (node.fills && node.fills.length > 0) {
      code += this.renderFillColor(node.fills[0]);
    }

    if (node.shadows && node.shadows.length > 0) {
      code += this.renderBoxShadows(node.shadows);
    }

    this.popIndent();
    code += this.line('),');
    this.popIndent();
    code += this.line(');');

    return code;
  }

  /**
   * 渲染椭圆作为子元素
   */
  private renderEllipseAsChild(node: ForgeEllipseNode): string {
    let code = '';
    code += this.line('Container(');
    this.pushIndent();

    code += this.line(`width: ${this.formatNumber(node.width)},`);
    code += this.line(`height: ${this.formatNumber(node.height)},`);

    code += this.line('decoration: BoxDecoration(');
    this.pushIndent();

    if (node.width === node.height) {
      code += this.line('shape: BoxShape.circle,');
    } else {
      code += this.line(
        `borderRadius: BorderRadius.all(Radius.elliptical(${node.width / 2}, ${node.height / 2})),`
      );
    }

    if (node.fills && node.fills.length > 0) {
      code += this.renderFillColor(node.fills[0]);
    }

    this.popIndent();
    code += this.line('),');
    this.popIndent();
    code += this.indent() + ')';

    return code;
  }

  /**
   * 渲染文本
   */
  private renderText(node: ForgeTextNode): string {
    let code = '';
    code += this.line('return Text(');
    this.pushIndent();

    code += this.line(`'${this.escapeString(node.content)}',`);
    code += this.renderTextStyle(node);

    this.popIndent();
    code += this.line(');');

    return code;
  }

  /**
   * 渲染文本作为子元素
   */
  private renderTextAsChild(node: ForgeTextNode): string {
    let code = '';
    code += this.line('Text(');
    this.pushIndent();

    code += this.line(`'${this.escapeString(node.content)}',`);
    code += this.renderTextStyle(node);

    this.popIndent();
    code += this.indent() + ')';

    return code;
  }

  /**
   * 渲染文本样式
   */
  private renderTextStyle(node: ForgeTextNode): string {
    const style = node.textStyle;
    let code = '';

    code += this.line('style: TextStyle(');
    this.pushIndent();

    if (style.fontFamily) {
      code += this.line(`fontFamily: '${style.fontFamily}',`);
    }

    code += this.line(`fontSize: ${this.formatNumber(style.fontSize)},`);

    if (style.fontWeight) {
      code += this.line(`fontWeight: FontWeight.${this.convertFontWeight(style.fontWeight)},`);
    }

    if (style.italic) {
      code += this.line('fontStyle: FontStyle.italic,');
    }

    if (style.color) {
      code += this.line(`color: ${this.colorToFlutter(style.color)},`);
    }

    if (style.lineHeight) {
      const heightRatio = style.lineHeight / style.fontSize;
      code += this.line(`height: ${this.formatNumber(heightRatio, 2)},`);
    }

    if (style.letterSpacing) {
      code += this.line(`letterSpacing: ${this.formatNumber(style.letterSpacing)},`);
    }

    if (style.decoration && style.decoration !== 'none') {
      code += this.line(
        `decoration: TextDecoration.${this.convertTextDecoration(style.decoration)},`
      );
    }

    this.popIndent();
    code += this.line('),');

    return code;
  }

  /**
   * 渲染图片
   */
  private renderImage(node: ForgeImageNode): string {
    let code = '';

    if (node.cornerRadius) {
      code += this.line('return ClipRRect(');
      this.pushIndent();
      code += this.renderBorderRadius(node.cornerRadius);
      code += this.line('child: ');
    } else {
      code += this.line('return ');
    }

    code += this.line('Image.network(');
    this.pushIndent();
    code += this.line(`'${node.imageUrl || DEFAULT_PLACEHOLDER_URL}',`);
    code += this.line(`width: ${this.formatNumber(node.width)},`);
    code += this.line(`height: ${this.formatNumber(node.height)},`);
    code += this.line(`fit: BoxFit.${this.convertImageMode(node.imageMode)},`);
    this.popIndent();
    code += this.line(')');

    if (node.cornerRadius) {
      code += ',\n';
      this.popIndent();
      code += this.line(');');
    } else {
      code += ';\n';
    }

    return code;
  }

  /**
   * 渲染图片作为子元素
   */
  private renderImageAsChild(node: ForgeImageNode): string {
    let code = '';

    if (node.cornerRadius) {
      code += this.line('ClipRRect(');
      this.pushIndent();
      code += this.renderBorderRadius(node.cornerRadius);
      code += this.line('child: ');
    }

    code += this.line('Image.network(');
    this.pushIndent();
    code += this.line(`'${node.imageUrl || DEFAULT_PLACEHOLDER_URL}',`);
    code += this.line(`width: ${this.formatNumber(node.width)},`);
    code += this.line(`height: ${this.formatNumber(node.height)},`);
    code += this.line(`fit: BoxFit.${this.convertImageMode(node.imageMode)},`);
    this.popIndent();
    code += this.indent() + ')';

    if (node.cornerRadius) {
      code += ',\n';
      this.popIndent();
      code += this.indent() + ')';
    }

    return code;
  }

  // ============================================================================
  // 装饰渲染
  // ============================================================================

  /**
   * 渲染 BoxDecoration
   */
  private renderBoxDecoration(
    fills?: ForgeFill[],
    strokes?: ForgeStroke[],
    shadows?: ForgeShadow[],
    cornerRadius?: ForgeCornerRadius | number
  ): string {
    let code = '';
    code += this.line('decoration: BoxDecoration(');
    this.pushIndent();

    // 填充
    if (fills && fills.length > 0) {
      code += this.renderFillColor(fills[0]);
    }

    // 圆角
    if (cornerRadius) {
      code += this.renderBorderRadius(cornerRadius);
    }

    // 边框
    if (strokes && strokes.length > 0) {
      code += this.renderBorder(strokes[0]);
    }

    // 阴影
    if (shadows && shadows.length > 0) {
      code += this.renderBoxShadows(shadows);
    }

    this.popIndent();
    code += this.line('),');

    return code;
  }

  /**
   * 渲染填充颜色
   */
  private renderFillColor(fill: ForgeFill): string {
    if (fill.type === 'solid' && fill.color) {
      return this.line(`color: ${this.colorToFlutter(fill.color)},`);
    }

    if (fill.type === 'gradient' && fill.gradient) {
      let code = '';
      const gradient = fill.gradient;

      if (gradient.type === 'linear') {
        code += this.line('gradient: LinearGradient(');
      } else if (gradient.type === 'radial') {
        code += this.line('gradient: RadialGradient(');
      } else {
        code += this.line('gradient: LinearGradient(');
      }

      this.pushIndent();
      code += this.line('colors: [');
      this.pushIndent();

      for (const stop of gradient.stops) {
        code += this.line(`${this.colorToFlutter(stop.color)},`);
      }

      this.popIndent();
      code += this.line('],');

      // 渐变停止点
      code += this.line('stops: [');
      this.pushIndent();
      for (const stop of gradient.stops) {
        code += this.line(`${this.formatNumber(stop.position, 2)},`);
      }
      this.popIndent();
      code += this.line('],');

      this.popIndent();
      code += this.line('),');

      return code;
    }

    return '';
  }

  /**
   * 渲染圆角
   */
  private renderBorderRadius(cornerRadius: ForgeCornerRadius | number): string {
    if (typeof cornerRadius === 'number') {
      return this.line(`borderRadius: BorderRadius.circular(${this.formatNumber(cornerRadius)}),`);
    }

    // 不同角不同圆角
    return this.line(
      `borderRadius: BorderRadius.only(` +
        `topLeft: Radius.circular(${cornerRadius.topLeft}), ` +
        `topRight: Radius.circular(${cornerRadius.topRight}), ` +
        `bottomRight: Radius.circular(${cornerRadius.bottomRight}), ` +
        `bottomLeft: Radius.circular(${cornerRadius.bottomLeft})),`
    );
  }

  /**
   * 渲染边框
   */
  private renderBorder(stroke: ForgeStroke): string {
    return this.line(
      `border: Border.all(color: ${this.colorToFlutter(stroke.color)}, width: ${stroke.width}),`
    );
  }

  /**
   * 渲染阴影
   */
  private renderBoxShadows(shadows: ForgeShadow[]): string {
    let code = '';
    code += this.line('boxShadow: [');
    this.pushIndent();

    for (const shadow of shadows) {
      code += this.line('BoxShadow(');
      this.pushIndent();
      code += this.line(`color: ${this.colorToFlutter(shadow.color)},`);
      code += this.line(`offset: Offset(${shadow.offsetX}, ${shadow.offsetY}),`);
      code += this.line(`blurRadius: ${shadow.blur},`);
      if (shadow.spread) {
        code += this.line(`spreadRadius: ${shadow.spread},`);
      }
      this.popIndent();
      code += this.line('),');
    }

    this.popIndent();
    code += this.line('],');

    return code;
  }

  /**
   * 渲染内边距
   */
  private renderPadding(padding: ForgePadding): string {
    if (this.isUniformPadding(padding)) {
      return this.line(`padding: EdgeInsets.all(${padding.top}),`);
    }

    if (padding.left === padding.right && padding.top === padding.bottom) {
      return this.line(
        `padding: EdgeInsets.symmetric(horizontal: ${padding.left}, vertical: ${padding.top}),`
      );
    }

    return this.line(
      `padding: EdgeInsets.only(` +
        `left: ${padding.left}, top: ${padding.top}, ` +
        `right: ${padding.right}, bottom: ${padding.bottom}),`
    );
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  /**
   * 颜色转 Flutter Color
   */
  private colorToFlutter(color: ForgeColor): string {
    if (color.a < 1) {
      const a = Math.round(color.a * 255);
      return `Color.fromARGB(${a}, ${color.r}, ${color.g}, ${color.b})`;
    }

    const hex = ((color.r << 16) | (color.g << 8) | color.b).toString(16).padStart(6, '0');
    return `Color(0xFF${hex.toUpperCase()})`;
  }

  /**
   * 转换主轴对齐
   */
  private convertMainAxisAlignment(align: string): string {
    const map: Record<string, string> = {
      start: 'start',
      center: 'center',
      end: 'end',
      spaceBetween: 'spaceBetween',
      spaceAround: 'spaceAround',
      spaceEvenly: 'spaceEvenly',
    };
    return map[align] || 'start';
  }

  /**
   * 转换交叉轴对齐
   */
  private convertCrossAxisAlignment(align: string): string {
    const map: Record<string, string> = {
      start: 'start',
      center: 'center',
      end: 'end',
      stretch: 'stretch',
      baseline: 'baseline',
    };
    return map[align] || 'start';
  }

  /**
   * 转换字体粗细
   */
  private convertFontWeight(weight: string): string {
    const map: Record<string, string> = {
      thin: 'w100',
      extraLight: 'w200',
      light: 'w300',
      regular: 'w400',
      medium: 'w500',
      semiBold: 'w600',
      bold: 'w700',
      extraBold: 'w800',
      black: 'w900',
    };
    return map[weight] || 'w400';
  }

  /**
   * 转换文本装饰
   */
  private convertTextDecoration(decoration: string): string {
    const map: Record<string, string> = {
      underline: 'underline',
      lineThrough: 'lineThrough',
      overline: 'overline',
    };
    return map[decoration] || 'none';
  }

  /**
   * 转换图片模式
   */
  private convertImageMode(mode?: string): string {
    const map: Record<string, string> = {
      fill: 'cover',
      fit: 'contain',
      crop: 'cover',
      tile: 'none',
    };
    return map[mode || 'fill'] || 'cover';
  }

  /**
   * 转换为 snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * 转义字符串
   */
  private escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  }

  /**
   * 检查是否为零内边距
   */
  private isZeroPadding(padding: ForgePadding): boolean {
    return padding.top === 0 && padding.right === 0 && padding.bottom === 0 && padding.left === 0;
  }

  // ============================================================================
  // 响应式布局支持
  // ============================================================================

  /**
   * 检查是否有响应式约束
   */
  private hasResponsiveConstraints(constraints?: ForgeConstraints): boolean {
    if (!constraints) return false;
    return !!(
      constraints.widthPercent ||
      constraints.heightPercent ||
      constraints.minWidth ||
      constraints.maxWidth ||
      constraints.minHeight ||
      constraints.maxHeight
    );
  }

  /**
   * 渲染响应式包装器
   */
  private renderResponsiveWrapper(
    _constraints: ForgeConstraints,
    renderContent: () => string
  ): string {
    let code = '';

    // 使用 LayoutBuilder 获取父容器约束
    code += this.line('return LayoutBuilder(');
    this.pushIndent();
    code += this.line('builder: (context, constraints) {');
    this.pushIndent();

    // 渲染内容
    const content = renderContent();
    code += content;

    this.popIndent();
    code += this.line('},');
    this.popIndent();
    code += this.line(');');

    return code;
  }

  /**
   * 渲染 FractionallySizedBox
   */
  private renderFractionallySizedBox(
    node: ForgeContainerNode,
    hasDecoration: boolean,
    hasLayout: boolean,
    hasPadding: boolean
  ): string {
    let code = '';
    const constraints = node.constraints;

    code += this.line('FractionallySizedBox(');
    this.pushIndent();

    // 宽度百分比
    if (constraints?.widthPercent) {
      code += this.line(`widthFactor: ${this.formatNumber(constraints.widthPercent, 2)},`);
    }

    // 高度百分比
    if (constraints?.heightPercent) {
      code += this.line(`heightFactor: ${this.formatNumber(constraints.heightPercent, 2)},`);
    }

    // 对齐方式
    code += this.line('alignment: Alignment.topLeft,');

    // 子元素
    if (hasDecoration || hasPadding || node.children.length > 0) {
      code += this.line('child: Container(');
      this.pushIndent();

      if (hasPadding) {
        code += this.renderPadding(node.padding!);
      }

      if (hasDecoration) {
        code += this.renderBoxDecoration(node.fills, node.strokes, node.shadows, node.cornerRadius);
      }

      if (node.children.length > 0) {
        code += this.line('child: ');
        this.pushIndent();
        code += this.renderChildren(node, !!hasLayout);
        this.popIndent();
        code += ',\n';
      }

      this.popIndent();
      code += this.line('),');
    }

    this.popIndent();
    code += this.indent() + ')';

    return code;
  }

  /**
   * 使用 Flexible 包装子元素
   */
  private wrapWithFlexible(widgetCode: string, constraints: ForgeConstraints): string {
    let code = '';

    // 如果是 100% 宽度/高度，使用 Expanded
    const useExpanded = constraints.widthPercent === 1 || constraints.heightPercent === 1;

    if (useExpanded) {
      code += this.line('Expanded(');
    } else {
      code += this.line('Flexible(');
      this.pushIndent();
      // 计算 flex 值（基于百分比）
      const flexValue = Math.round(
        (constraints.widthPercent || constraints.heightPercent || 1) * 10
      );
      code += this.line(`flex: ${flexValue},`);
      this.popIndent();
    }

    this.pushIndent();
    code += this.line('child: ');
    code += widgetCode;
    code += ',\n';
    this.popIndent();
    code += this.indent() + ')';

    return code;
  }

  /**
   * 渲染约束
   */
  private renderConstraints(constraints: ForgeConstraints): string {
    let code = '';
    const hasMinMax =
      constraints.minWidth ||
      constraints.maxWidth ||
      constraints.minHeight ||
      constraints.maxHeight;

    if (hasMinMax) {
      code += this.line('constraints: BoxConstraints(');
      this.pushIndent();

      if (constraints.minWidth) {
        code += this.line(`minWidth: ${this.formatNumber(constraints.minWidth)},`);
      }
      if (constraints.maxWidth) {
        code += this.line(`maxWidth: ${this.formatNumber(constraints.maxWidth)},`);
      }
      if (constraints.minHeight) {
        code += this.line(`minHeight: ${this.formatNumber(constraints.minHeight)},`);
      }
      if (constraints.maxHeight) {
        code += this.line(`maxHeight: ${this.formatNumber(constraints.maxHeight)},`);
      }

      this.popIndent();
      code += this.line('),');
    }

    return code;
  }

  // ============================================================================
  // Dart 代码格式化
  // ============================================================================

  /**
   * 格式化 Dart 代码
   * 遵循 dart format 风格规范
   */
  private formatDartCode(code: string): string {
    let formatted = code;

    // 1. 规范化换行 - 移除多余空行
    formatted = this.normalizeBlankLines(formatted);

    // 2. 修复尾随逗号格式
    formatted = this.fixTrailingCommas(formatted);

    // 3. 移除行尾空格
    formatted = this.trimTrailingWhitespace(formatted);

    // 4. 确保文件末尾有换行
    if (!formatted.endsWith('\n')) {
      formatted += '\n';
    }

    return formatted;
  }

  /**
   * 规范化空行（最多保留一个连续空行）
   */
  private normalizeBlankLines(code: string): string {
    return code.replace(/\n{3,}/g, '\n\n');
  }

  /**
   * 修复尾随逗号格式
   * 确保多行参数列表的最后一个参数有尾随逗号
   */
  private fixTrailingCommas(code: string): string {
    // 在闭括号前添加尾随逗号（如果前面是参数行）
    return code.replace(/([^,\s])\n(\s*[)\]])/g, '$1,\n$2');
  }

  /**
   * 移除行尾空格
   */
  private trimTrailingWhitespace(code: string): string {
    return code
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
  }
}
