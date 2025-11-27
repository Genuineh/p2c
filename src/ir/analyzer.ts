/**
 * 节点分析器
 * 将 Pixso 设计节点转换为 ForgeIR
 */

import type {
  ForgeNode,
  ForgeContainerNode,
  ForgeTextNode,
  ForgeRectangleNode,
  ForgeEllipseNode,
  ForgeVectorNode,
  ForgeComponentNode,
  ForgeInstanceNode,
  ForgeFill,
  ForgeStroke,
  ForgeShadow,
  ForgeColor,
  ForgePadding,
  ForgeCornerRadius,
  ForgeLayoutDirection,
  ForgeMainAxisAlignment,
  ForgeCrossAxisAlignment,
  ForgeTextStyle,
  ForgeFontWeight,
  ForgeDocument,
  ForgeTheme,
} from './types';

/**
 * 分析器配置
 */
export interface AnalyzerConfig {
  /** 是否包含隐藏节点 */
  includeHidden?: boolean;
  /** 是否导出图片 */
  exportImages?: boolean;
  /** 图片导出格式 */
  imageFormat?: 'png' | 'jpg' | 'svg';
}

/**
 * 节点分析器类
 */
export class NodeAnalyzer {
  private config: AnalyzerConfig;
  private extractedColors: Map<string, ForgeColor> = new Map();
  private extractedTextStyles: Map<string, ForgeTextStyle> = new Map();

  constructor(config: AnalyzerConfig = {}) {
    this.config = {
      includeHidden: false,
      exportImages: true,
      imageFormat: 'png',
      ...config,
    };
  }

  /**
   * 分析选中的节点，生成 ForgeDocument
   */
  async analyzeSelection(selection: readonly SceneNode[]): Promise<ForgeDocument | null> {
    if (selection.length === 0) {
      return null;
    }

    // 如果只选中一个节点，直接分析
    // 如果选中多个节点，创建虚拟容器
    const root =
      selection.length === 1
        ? await this.analyzeNode(selection[0])
        : await this.createVirtualContainer([...selection]);

    if (!root) {
      return null;
    }

    // 提取主题
    const theme = this.extractTheme();

    return {
      name: selection.length === 1 ? selection[0].name : 'Selection',
      root,
      theme,
      metadata: {
        createdAt: new Date().toISOString(),
        pluginVersion: '0.1.0',
      },
    };
  }

  /**
   * 分析单个节点
   */
  async analyzeNode(node: SceneNode): Promise<ForgeNode | null> {
    // 跳过隐藏节点（除非配置了包含）
    if (!this.config.includeHidden && !node.visible) {
      return null;
    }

    switch (node.type) {
      case 'FRAME':
      case 'GROUP':
      case 'SECTION':
        return this.analyzeContainerNode(node as FrameNode | GroupNode);

      case 'RECTANGLE':
        return this.analyzeRectangleNode(node as RectangleNode);

      case 'ELLIPSE':
        return this.analyzeEllipseNode(node as EllipseNode);

      case 'TEXT':
        return this.analyzeTextNode(node as TextNode);

      case 'VECTOR':
      case 'STAR':
      case 'POLYGON':
      case 'LINE':
        return this.analyzeVectorNode(node as VectorNode);

      case 'COMPONENT':
        return this.analyzeComponentNode(node as ComponentNode);

      case 'INSTANCE':
        return this.analyzeInstanceNode(node as InstanceNode);

      default:
        // 尝试作为容器节点处理
        if ('children' in node) {
          return this.analyzeContainerNode(node as unknown as FrameNode);
        }
        return null;
    }
  }

  /**
   * 分析容器节点（Frame/Group）
   */
  private async analyzeContainerNode(node: FrameNode | GroupNode): Promise<ForgeContainerNode> {
    const children: ForgeNode[] = [];

    if ('children' in node) {
      for (const child of node.children) {
        const analyzedChild = await this.analyzeNode(child);
        if (analyzedChild) {
          children.push(analyzedChild);
        }
      }
    }

    const baseProps = this.getBaseProps(node);

    const container: ForgeContainerNode = {
      ...baseProps,
      type: node.type === 'GROUP' ? 'group' : 'frame',
      children,
    };

    // Frame 特有属性
    if (node.type === 'FRAME') {
      const frame = node as FrameNode;

      // 布局属性
      // Note: Pixso API only supports 'HORIZONTAL' and 'VERTICAL' layout modes (no 'GRID')
      if (frame.layoutMode && frame.layoutMode !== 'NONE') {
        container.layoutDirection = this.convertLayoutDirection(frame.layoutMode);
        container.mainAxisAlignment = this.convertMainAxisAlignment(frame.primaryAxisAlignItems);
        container.crossAxisAlignment = this.convertCrossAxisAlignment(frame.counterAxisAlignItems);
        container.itemSpacing = frame.itemSpacing;
      }

      // 内边距
      container.padding = this.extractPadding(frame);

      // 填充和边框
      container.fills = this.extractFills(frame.fills);
      container.strokes = this.extractStrokes(frame.strokes, frame.strokeWeight);
      container.shadows = this.extractShadows(frame.effects);
      container.cornerRadius = this.extractCornerRadius(frame);
      container.clipsContent = frame.clipsContent;
    }

    return container;
  }

  /**
   * 分析矩形节点
   */
  private analyzeRectangleNode(node: RectangleNode): ForgeRectangleNode {
    return {
      ...this.getBaseProps(node),
      type: 'rectangle',
      fills: this.extractFills(node.fills),
      strokes: this.extractStrokes(node.strokes, node.strokeWeight),
      shadows: this.extractShadows(node.effects),
      cornerRadius: this.extractCornerRadius(node),
    };
  }

  /**
   * 分析椭圆节点
   */
  private analyzeEllipseNode(node: EllipseNode): ForgeEllipseNode {
    return {
      ...this.getBaseProps(node),
      type: 'ellipse',
      fills: this.extractFills(node.fills),
      strokes: this.extractStrokes(node.strokes, node.strokeWeight),
      shadows: this.extractShadows(node.effects),
    };
  }

  /**
   * 分析文本节点
   */
  private analyzeTextNode(node: TextNode): ForgeTextNode {
    const textStyle = this.extractTextStyle(node);

    // 记录提取的文本样式
    const styleKey = this.getTextStyleKey(textStyle);
    this.extractedTextStyles.set(styleKey, textStyle);

    return {
      ...this.getBaseProps(node),
      type: 'text',
      content: node.characters,
      textStyle,
      autoResize: this.convertTextAutoResize(node.textAutoResize),
    };
  }

  /**
   * 分析矢量节点
   */
  private analyzeVectorNode(node: VectorNode): ForgeVectorNode {
    return {
      ...this.getBaseProps(node),
      type: 'vector',
      fills: this.extractFills(node.fills),
      strokes: this.extractStrokes(node.strokes, node.strokeWeight),
    };
  }

  /**
   * 分析组件节点
   */
  private async analyzeComponentNode(node: ComponentNode): Promise<ForgeComponentNode> {
    const children: ForgeNode[] = [];

    for (const child of node.children) {
      const analyzedChild = await this.analyzeNode(child);
      if (analyzedChild) {
        children.push(analyzedChild);
      }
    }

    return {
      ...this.getBaseProps(node),
      type: 'component',
      children,
      description: node.description || undefined,
    };
  }

  /**
   * 分析组件实例节点
   */
  private async analyzeInstanceNode(node: InstanceNode): Promise<ForgeInstanceNode> {
    const children: ForgeNode[] = [];

    for (const child of node.children) {
      const analyzedChild = await this.analyzeNode(child);
      if (analyzedChild) {
        children.push(analyzedChild);
      }
    }

    return {
      ...this.getBaseProps(node),
      type: 'instance',
      children,
      mainComponentId: node.mainComponent?.id,
      componentName: node.mainComponent?.name,
    };
  }

  /**
   * 创建虚拟容器（多选时使用）
   */
  private async createVirtualContainer(nodes: SceneNode[]): Promise<ForgeContainerNode> {
    const children: ForgeNode[] = [];

    for (const node of nodes) {
      const analyzedNode = await this.analyzeNode(node);
      if (analyzedNode) {
        children.push(analyzedNode);
      }
    }

    // 计算包围盒
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }

    return {
      id: 'virtual-container',
      name: 'Selection',
      type: 'frame',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      children,
    };
  }

  /**
   * 获取基础属性
   */
  private getBaseProps(node: SceneNode) {
    return {
      id: node.id,
      name: node.name,
      width: node.width,
      height: node.height,
      x: node.x,
      y: node.y,
      rotation: 'rotation' in node ? (node.rotation as number) : undefined,
      opacity: 'opacity' in node ? (node.opacity as number) : undefined,
      visible: node.visible,
    };
  }

  /**
   * 提取填充
   */
  private extractFills(fills: readonly Paint[] | string): ForgeFill[] {
    if (typeof fills === 'string' || !fills) {
      return [];
    }

    return (fills as readonly Paint[])
      .filter((fill: Paint) => fill.visible !== false)
      .map((fill: Paint) => {
        const forgeFill: ForgeFill = {
          type: 'solid',
          opacity: fill.opacity,
        };

        if (fill.type === 'SOLID') {
          forgeFill.type = 'solid';
          forgeFill.color = this.convertColor((fill as SolidPaint).color, fill.opacity);

          // 记录提取的颜色
          const colorKey = this.getColorKey(forgeFill.color);
          this.extractedColors.set(colorKey, forgeFill.color);
        } else if (
          fill.type === 'GRADIENT_LINEAR' ||
          fill.type === 'GRADIENT_RADIAL' ||
          fill.type === 'GRADIENT_ANGULAR' ||
          fill.type === 'GRADIENT_DIAMOND'
        ) {
          forgeFill.type = 'gradient';
          const gradientFill = fill as GradientPaint;
          forgeFill.gradient = {
            type: this.convertGradientType(fill.type),
            stops: gradientFill.gradientStops.map((stop: ColorStop) => ({
              position: stop.position,
              color: this.convertColor(stop.color),
            })),
          };
        } else if (fill.type === 'IMAGE') {
          forgeFill.type = 'image';
          forgeFill.imageMode = this.convertImageMode((fill as ImagePaint).scaleMode);
        }

        return forgeFill;
      });
  }

  /**
   * 提取边框
   */
  private extractStrokes(
    strokes: readonly Paint[] | string,
    strokeWeight: number | string
  ): ForgeStroke[] {
    if (typeof strokes === 'string' || !strokes) {
      return [];
    }

    const weight = typeof strokeWeight === 'string' ? 1 : strokeWeight;

    return (strokes as readonly Paint[])
      .filter((stroke: Paint) => stroke.visible !== false && stroke.type === 'SOLID')
      .map((stroke: Paint) => ({
        color: this.convertColor((stroke as SolidPaint).color, stroke.opacity),
        width: weight,
      }));
  }

  /**
   * 提取阴影
   */
  private extractShadows(effects: readonly Effect[]): ForgeShadow[] {
    return effects
      .filter((effect) => effect.visible !== false && effect.type.includes('SHADOW'))
      .map((effect) => {
        const shadow = effect as DropShadowEffect | InnerShadowEffect;
        return {
          color: this.convertColor(shadow.color),
          offsetX: shadow.offset.x,
          offsetY: shadow.offset.y,
          blur: shadow.radius,
          spread: shadow.spread || 0,
          inner: effect.type === 'INNER_SHADOW',
        };
      });
  }

  /**
   * 提取圆角
   */
  private extractCornerRadius(
    node: RectangleNode | FrameNode
  ): ForgeCornerRadius | number | undefined {
    if ('cornerRadius' in node) {
      if (typeof node.cornerRadius === 'string') {
        // 不同角有不同圆角 (mixed)
        return {
          topLeft: node.topLeftRadius || 0,
          topRight: node.topRightRadius || 0,
          bottomRight: node.bottomRightRadius || 0,
          bottomLeft: node.bottomLeftRadius || 0,
        };
      }
      return node.cornerRadius as number;
    }
    return undefined;
  }

  /**
   * 提取内边距
   */
  private extractPadding(node: FrameNode): ForgePadding | undefined {
    if (
      node.paddingTop === 0 &&
      node.paddingRight === 0 &&
      node.paddingBottom === 0 &&
      node.paddingLeft === 0
    ) {
      return undefined;
    }

    return {
      top: node.paddingTop,
      right: node.paddingRight,
      bottom: node.paddingBottom,
      left: node.paddingLeft,
    };
  }

  /**
   * 提取文本样式
   */
  private extractTextStyle(node: TextNode): ForgeTextStyle {
    const fontSize = typeof node.fontSize === 'string' ? 14 : (node.fontSize as number);
    const fontName =
      typeof node.fontName === 'string'
        ? { family: 'Inter', style: 'Regular' }
        : (node.fontName as FontName);
    const lineHeight =
      typeof node.lineHeight === 'string'
        ? { unit: 'AUTO' as const }
        : (node.lineHeight as LineHeight);
    const letterSpacing =
      typeof node.letterSpacing === 'string'
        ? { unit: 'PERCENT' as const, value: 0 }
        : (node.letterSpacing as LetterSpacing);

    const style: ForgeTextStyle = {
      fontFamily: fontName.family,
      fontSize,
      fontWeight: this.convertFontWeight(fontName.style),
      italic: fontName.style.toLowerCase().includes('italic'),
    };

    // 行高
    if (lineHeight.unit === 'PIXELS') {
      style.lineHeight = lineHeight.value;
    } else if (lineHeight.unit === 'PERCENT') {
      style.lineHeight = (fontSize * lineHeight.value) / 100;
    }

    // 字间距
    if (letterSpacing.unit === 'PIXELS') {
      style.letterSpacing = letterSpacing.value;
    } else if (letterSpacing.unit === 'PERCENT') {
      style.letterSpacing = (fontSize * letterSpacing.value) / 100;
    }

    // 颜色（从填充中获取）
    const fills = node.fills;
    if (typeof fills !== 'string' && fills.length > 0 && fills[0].type === 'SOLID') {
      style.color = this.convertColor((fills[0] as SolidPaint).color, fills[0].opacity);
    }

    return style;
  }

  /**
   * 提取主题
   */
  private extractTheme(): ForgeTheme {
    const theme: ForgeTheme = {
      colors: {
        custom: {},
      },
      textStyles: {
        custom: {},
      },
    };

    // 添加提取的颜色
    let colorIndex = 1;
    this.extractedColors.forEach((color, _key) => {
      if (theme.colors?.custom) {
        theme.colors.custom[`color${colorIndex}`] = color;
        colorIndex++;
      }
    });

    // 添加提取的文本样式
    let styleIndex = 1;
    this.extractedTextStyles.forEach((textStyle, _key) => {
      if (theme.textStyles?.custom) {
        theme.textStyles.custom[`textStyle${styleIndex}`] = textStyle;
        styleIndex++;
      }
    });

    return theme;
  }

  // ============================================================================
  // 辅助转换方法
  // ============================================================================

  private convertColor(color: RGB | RGBA, opacity?: number): ForgeColor {
    const a = 'a' in color ? color.a : 1;
    return {
      r: Math.round(color.r * 255),
      g: Math.round(color.g * 255),
      b: Math.round(color.b * 255),
      a: opacity !== undefined ? opacity * a : a,
    };
  }

  private convertLayoutDirection(mode: 'HORIZONTAL' | 'VERTICAL'): ForgeLayoutDirection {
    switch (mode) {
      case 'HORIZONTAL':
        return 'horizontal';
      case 'VERTICAL':
        return 'vertical';
    }
  }

  private convertMainAxisAlignment(
    align: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  ): ForgeMainAxisAlignment {
    switch (align) {
      case 'MIN':
        return 'start';
      case 'CENTER':
        return 'center';
      case 'MAX':
        return 'end';
      case 'SPACE_BETWEEN':
        return 'spaceBetween';
      default:
        return 'start';
    }
  }

  private convertCrossAxisAlignment(
    align: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'
  ): ForgeCrossAxisAlignment {
    switch (align) {
      case 'MIN':
        return 'start';
      case 'CENTER':
        return 'center';
      case 'MAX':
        return 'end';
      case 'BASELINE':
        return 'baseline';
      default:
        return 'start';
    }
  }

  private convertFontWeight(style: string): ForgeFontWeight {
    const lowerStyle = style.toLowerCase();
    if (lowerStyle.includes('thin')) return 'thin';
    if (lowerStyle.includes('extralight') || lowerStyle.includes('extra light'))
      return 'extraLight';
    if (lowerStyle.includes('light')) return 'light';
    if (lowerStyle.includes('medium')) return 'medium';
    if (lowerStyle.includes('semibold') || lowerStyle.includes('semi bold')) return 'semiBold';
    if (lowerStyle.includes('extrabold') || lowerStyle.includes('extra bold')) return 'extraBold';
    if (lowerStyle.includes('black')) return 'black';
    if (lowerStyle.includes('bold')) return 'bold';
    return 'regular';
  }

  private convertGradientType(
    type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'
  ) {
    switch (type) {
      case 'GRADIENT_LINEAR':
        return 'linear' as const;
      case 'GRADIENT_RADIAL':
        return 'radial' as const;
      case 'GRADIENT_ANGULAR':
        return 'angular' as const;
      case 'GRADIENT_DIAMOND':
        return 'diamond' as const;
    }
  }

  private convertImageMode(mode: 'FILL' | 'FIT' | 'CROP' | 'TILE') {
    switch (mode) {
      case 'FILL':
        return 'fill' as const;
      case 'FIT':
        return 'fit' as const;
      case 'CROP':
        return 'crop' as const;
      case 'TILE':
        return 'tile' as const;
    }
  }

  private convertTextAutoResize(mode: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE') {
    switch (mode) {
      case 'WIDTH_AND_HEIGHT':
        return 'width' as const;
      case 'HEIGHT':
        return 'height' as const;
      default:
        return 'none' as const;
    }
  }

  private getColorKey(color: ForgeColor): string {
    return `${color.r}-${color.g}-${color.b}-${Math.round(color.a * 100)}`;
  }

  private getTextStyleKey(style: ForgeTextStyle): string {
    return `${style.fontFamily}-${style.fontSize}-${style.fontWeight}`;
  }
}
