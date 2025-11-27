var y = Object.defineProperty;
var x = (h, t, e) => t in h ? y(h, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : h[t] = e;
var a = (h, t, e) => x(h, typeof t != "symbol" ? t + "" : t, e);
class C {
  constructor(t = {}) {
    a(this, "config");
    a(this, "extractedColors", /* @__PURE__ */ new Map());
    a(this, "extractedTextStyles", /* @__PURE__ */ new Map());
    this.config = {
      includeHidden: !1,
      exportImages: !0,
      imageFormat: "png",
      ...t
    };
  }
  /**
   * 分析选中的节点，生成 ForgeDocument
   */
  async analyzeSelection(t) {
    if (t.length === 0)
      return null;
    const e = t.length === 1 ? await this.analyzeNode(t[0]) : await this.createVirtualContainer([...t]);
    if (!e)
      return null;
    const i = this.extractTheme();
    return {
      name: t.length === 1 ? t[0].name : "Selection",
      root: e,
      theme: i,
      metadata: {
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        pluginVersion: "0.1.0"
      }
    };
  }
  /**
   * 分析单个节点
   */
  async analyzeNode(t) {
    if (!this.config.includeHidden && !t.visible)
      return null;
    switch (t.type) {
      case "FRAME":
      case "GROUP":
      case "SECTION":
        return this.analyzeContainerNode(t);
      case "RECTANGLE":
        return this.analyzeRectangleNode(t);
      case "ELLIPSE":
        return this.analyzeEllipseNode(t);
      case "TEXT":
        return this.analyzeTextNode(t);
      case "VECTOR":
      case "STAR":
      case "POLYGON":
      case "LINE":
        return this.analyzeVectorNode(t);
      case "COMPONENT":
        return this.analyzeComponentNode(t);
      case "INSTANCE":
        return this.analyzeInstanceNode(t);
      default:
        return "children" in t ? this.analyzeContainerNode(t) : null;
    }
  }
  /**
   * 分析容器节点（Frame/Group）
   */
  async analyzeContainerNode(t) {
    const e = [];
    if ("children" in t)
      for (const r of t.children) {
        const s = await this.analyzeNode(r);
        s && e.push(s);
      }
    const n = {
      ...this.getBaseProps(t),
      type: t.type === "GROUP" ? "group" : "frame",
      children: e
    };
    if (t.type === "FRAME") {
      const r = t;
      r.layoutMode && r.layoutMode !== "NONE" && (n.layoutDirection = this.convertLayoutDirection(r.layoutMode), n.mainAxisAlignment = this.convertMainAxisAlignment(r.primaryAxisAlignItems), n.crossAxisAlignment = this.convertCrossAxisAlignment(r.counterAxisAlignItems), n.itemSpacing = r.itemSpacing), n.padding = this.extractPadding(r), n.fills = this.extractFills(r.fills), n.strokes = this.extractStrokes(r.strokes, r.strokeWeight), n.shadows = this.extractShadows(r.effects), n.cornerRadius = this.extractCornerRadius(r), n.clipsContent = r.clipsContent;
    }
    return n;
  }
  /**
   * 分析矩形节点
   */
  analyzeRectangleNode(t) {
    return {
      ...this.getBaseProps(t),
      type: "rectangle",
      fills: this.extractFills(t.fills),
      strokes: this.extractStrokes(t.strokes, t.strokeWeight),
      shadows: this.extractShadows(t.effects),
      cornerRadius: this.extractCornerRadius(t)
    };
  }
  /**
   * 分析椭圆节点
   */
  analyzeEllipseNode(t) {
    return {
      ...this.getBaseProps(t),
      type: "ellipse",
      fills: this.extractFills(t.fills),
      strokes: this.extractStrokes(t.strokes, t.strokeWeight),
      shadows: this.extractShadows(t.effects)
    };
  }
  /**
   * 分析文本节点
   */
  analyzeTextNode(t) {
    const e = this.extractTextStyle(t), i = this.getTextStyleKey(e);
    return this.extractedTextStyles.set(i, e), {
      ...this.getBaseProps(t),
      type: "text",
      content: t.characters,
      textStyle: e,
      autoResize: this.convertTextAutoResize(t.textAutoResize)
    };
  }
  /**
   * 分析矢量节点
   */
  analyzeVectorNode(t) {
    return {
      ...this.getBaseProps(t),
      type: "vector",
      fills: this.extractFills(t.fills),
      strokes: this.extractStrokes(t.strokes, t.strokeWeight)
    };
  }
  /**
   * 分析组件节点
   */
  async analyzeComponentNode(t) {
    const e = [];
    for (const i of t.children) {
      const n = await this.analyzeNode(i);
      n && e.push(n);
    }
    return {
      ...this.getBaseProps(t),
      type: "component",
      children: e,
      description: t.description || void 0
    };
  }
  /**
   * 分析组件实例节点
   */
  async analyzeInstanceNode(t) {
    var i, n;
    const e = [];
    for (const r of t.children) {
      const s = await this.analyzeNode(r);
      s && e.push(s);
    }
    return {
      ...this.getBaseProps(t),
      type: "instance",
      children: e,
      mainComponentId: (i = t.mainComponent) == null ? void 0 : i.id,
      componentName: (n = t.mainComponent) == null ? void 0 : n.name
    };
  }
  /**
   * 创建虚拟容器（多选时使用）
   */
  async createVirtualContainer(t) {
    const e = [];
    for (const o of t) {
      const l = await this.analyzeNode(o);
      l && e.push(l);
    }
    let i = 1 / 0, n = 1 / 0, r = -1 / 0, s = -1 / 0;
    for (const o of t)
      i = Math.min(i, o.x), n = Math.min(n, o.y), r = Math.max(r, o.x + o.width), s = Math.max(s, o.y + o.height);
    return {
      id: "virtual-container",
      name: "Selection",
      type: "frame",
      x: i,
      y: n,
      width: r - i,
      height: s - n,
      children: e
    };
  }
  /**
   * 获取基础属性
   */
  getBaseProps(t) {
    return {
      id: t.id,
      name: t.name,
      width: t.width,
      height: t.height,
      x: t.x,
      y: t.y,
      rotation: "rotation" in t ? t.rotation : void 0,
      opacity: "opacity" in t ? t.opacity : void 0,
      visible: t.visible
    };
  }
  /**
   * 提取填充
   */
  extractFills(t) {
    return typeof t == "string" || !t ? [] : t.filter((e) => e.visible !== !1).map((e) => {
      const i = {
        type: "solid",
        opacity: e.opacity
      };
      if (e.type === "SOLID") {
        i.type = "solid", i.color = this.convertColor(e.color, e.opacity);
        const n = this.getColorKey(i.color);
        this.extractedColors.set(n, i.color);
      } else if (e.type === "GRADIENT_LINEAR" || e.type === "GRADIENT_RADIAL" || e.type === "GRADIENT_ANGULAR" || e.type === "GRADIENT_DIAMOND") {
        i.type = "gradient";
        const n = e;
        i.gradient = {
          type: this.convertGradientType(e.type),
          stops: n.gradientStops.map((r) => ({
            position: r.position,
            color: this.convertColor(r.color)
          }))
        };
      } else e.type === "IMAGE" && (i.type = "image", i.imageMode = this.convertImageMode(e.scaleMode));
      return i;
    });
  }
  /**
   * 提取边框
   */
  extractStrokes(t, e) {
    if (typeof t == "string" || !t)
      return [];
    const i = typeof e == "string" ? 1 : e;
    return t.filter((n) => n.visible !== !1 && n.type === "SOLID").map((n) => ({
      color: this.convertColor(n.color, n.opacity),
      width: i
    }));
  }
  /**
   * 提取阴影
   */
  extractShadows(t) {
    return t.filter((e) => e.visible !== !1 && e.type.includes("SHADOW")).map((e) => {
      const i = e;
      return {
        color: this.convertColor(i.color),
        offsetX: i.offset.x,
        offsetY: i.offset.y,
        blur: i.radius,
        spread: i.spread || 0,
        inner: e.type === "INNER_SHADOW"
      };
    });
  }
  /**
   * 提取圆角
   */
  extractCornerRadius(t) {
    if ("cornerRadius" in t)
      return typeof t.cornerRadius == "string" ? {
        topLeft: t.topLeftRadius || 0,
        topRight: t.topRightRadius || 0,
        bottomRight: t.bottomRightRadius || 0,
        bottomLeft: t.bottomLeftRadius || 0
      } : t.cornerRadius;
  }
  /**
   * 提取内边距
   */
  extractPadding(t) {
    if (!(t.paddingTop === 0 && t.paddingRight === 0 && t.paddingBottom === 0 && t.paddingLeft === 0))
      return {
        top: t.paddingTop,
        right: t.paddingRight,
        bottom: t.paddingBottom,
        left: t.paddingLeft
      };
  }
  /**
   * 提取文本样式
   */
  extractTextStyle(t) {
    const e = typeof t.fontSize == "string" ? 14 : t.fontSize, i = typeof t.fontName == "string" ? { family: "Inter", style: "Regular" } : t.fontName, n = typeof t.lineHeight == "string" ? { unit: "AUTO" } : t.lineHeight, r = typeof t.letterSpacing == "string" ? { unit: "PERCENT", value: 0 } : t.letterSpacing, s = {
      fontFamily: i.family,
      fontSize: e,
      fontWeight: this.convertFontWeight(i.style),
      italic: i.style.toLowerCase().includes("italic")
    };
    n.unit === "PIXELS" ? s.lineHeight = n.value : n.unit === "PERCENT" && (s.lineHeight = e * n.value / 100), r.unit === "PIXELS" ? s.letterSpacing = r.value : r.unit === "PERCENT" && (s.letterSpacing = e * r.value / 100);
    const o = t.fills;
    return typeof o != "string" && o.length > 0 && o[0].type === "SOLID" && (s.color = this.convertColor(o[0].color, o[0].opacity)), s;
  }
  /**
   * 提取主题
   */
  extractTheme() {
    const t = {
      colors: {
        custom: {}
      },
      textStyles: {
        custom: {}
      }
    };
    let e = 1;
    this.extractedColors.forEach((n, r) => {
      var s;
      (s = t.colors) != null && s.custom && (t.colors.custom[`color${e}`] = n, e++);
    });
    let i = 1;
    return this.extractedTextStyles.forEach((n, r) => {
      var s;
      (s = t.textStyles) != null && s.custom && (t.textStyles.custom[`textStyle${i}`] = n, i++);
    }), t;
  }
  // ============================================================================
  // 辅助转换方法
  // ============================================================================
  convertColor(t, e) {
    const i = "a" in t ? t.a : 1;
    return {
      r: Math.round(t.r * 255),
      g: Math.round(t.g * 255),
      b: Math.round(t.b * 255),
      a: e !== void 0 ? e * i : i
    };
  }
  convertLayoutDirection(t) {
    switch (t) {
      case "HORIZONTAL":
        return "horizontal";
      case "VERTICAL":
        return "vertical";
    }
  }
  convertMainAxisAlignment(t) {
    switch (t) {
      case "MIN":
        return "start";
      case "CENTER":
        return "center";
      case "MAX":
        return "end";
      case "SPACE_BETWEEN":
        return "spaceBetween";
      default:
        return "start";
    }
  }
  convertCrossAxisAlignment(t) {
    switch (t) {
      case "MIN":
        return "start";
      case "CENTER":
        return "center";
      case "MAX":
        return "end";
      case "BASELINE":
        return "baseline";
      default:
        return "start";
    }
  }
  convertFontWeight(t) {
    const e = t.toLowerCase();
    return e.includes("thin") ? "thin" : e.includes("extralight") || e.includes("extra light") ? "extraLight" : e.includes("light") ? "light" : e.includes("medium") ? "medium" : e.includes("semibold") || e.includes("semi bold") ? "semiBold" : e.includes("extrabold") || e.includes("extra bold") ? "extraBold" : e.includes("black") ? "black" : e.includes("bold") ? "bold" : "regular";
  }
  convertGradientType(t) {
    switch (t) {
      case "GRADIENT_LINEAR":
        return "linear";
      case "GRADIENT_RADIAL":
        return "radial";
      case "GRADIENT_ANGULAR":
        return "angular";
      case "GRADIENT_DIAMOND":
        return "diamond";
    }
  }
  convertImageMode(t) {
    switch (t) {
      case "FILL":
        return "fill";
      case "FIT":
        return "fit";
      case "CROP":
        return "crop";
      case "TILE":
        return "tile";
    }
  }
  convertTextAutoResize(t) {
    switch (t) {
      case "WIDTH_AND_HEIGHT":
        return "width";
      case "HEIGHT":
        return "height";
      default:
        return "none";
    }
  }
  getColorKey(t) {
    return `${t.r}-${t.g}-${t.b}-${Math.round(t.a * 100)}`;
  }
  getTextStyleKey(t) {
    return `${t.fontFamily}-${t.fontSize}-${t.fontWeight}`;
  }
}
class I {
  constructor(t = {}) {
    a(this, "config");
    this.config = {
      mergeAdjacentText: !0,
      extractCommonStyles: !0,
      removeEmptyContainers: !0,
      flattenSingleChild: !1,
      ...t
    };
  }
  /**
   * 优化整个文档
   */
  optimize(t) {
    let e = t.root;
    this.config.removeEmptyContainers && (e = this.removeEmptyContainers(e)), this.config.flattenSingleChild && (e = this.flattenSingleChild(e));
    let i = t.theme;
    return this.config.extractCommonStyles && (i = this.extractCommonStyles(e, i)), {
      ...t,
      root: e,
      theme: i
    };
  }
  /**
   * 移除空容器
   */
  removeEmptyContainers(t) {
    if (!this.isContainerNode(t))
      return t;
    const e = t, i = e.children.map((n) => this.removeEmptyContainers(n)).filter((n) => {
      var r, s;
      if (this.isContainerNode(n)) {
        const o = n;
        if (o.children.length === 0 && !((r = o.fills) != null && r.length) && !((s = o.strokes) != null && s.length))
          return !1;
      }
      return !0;
    });
    return {
      ...e,
      children: i
    };
  }
  /**
   * 扁平化单子元素容器
   */
  flattenSingleChild(t) {
    var n, r, s;
    if (!this.isContainerNode(t))
      return t;
    const e = t, i = e.children.map((o) => this.flattenSingleChild(o));
    if (i.length === 1 && !((n = e.fills) != null && n.length) && !((r = e.strokes) != null && r.length) && !((s = e.shadows) != null && s.length) && !e.padding) {
      const o = i[0];
      return {
        ...o,
        x: e.x + o.x,
        y: e.y + o.y
      };
    }
    return {
      ...e,
      children: i
    };
  }
  /**
   * 提取公共样式
   */
  extractCommonStyles(t, e) {
    var f, g;
    const i = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
    this.collectStyles(t, i, n);
    const r = {};
    let s = 1;
    i.forEach(({ color: c, count: u }) => {
      u >= 2 && (r[`commonColor${s}`] = c, s++);
    });
    const o = {};
    let l = 1;
    return n.forEach(({ style: c, count: u }) => {
      u >= 2 && (o[`commonTextStyle${l}`] = c, l++);
    }), {
      ...e,
      colors: {
        ...e == null ? void 0 : e.colors,
        custom: {
          ...(f = e == null ? void 0 : e.colors) == null ? void 0 : f.custom,
          ...r
        }
      },
      textStyles: {
        ...e == null ? void 0 : e.textStyles,
        custom: {
          ...(g = e == null ? void 0 : e.textStyles) == null ? void 0 : g.custom,
          ...o
        }
      }
    };
  }
  /**
   * 递归收集样式
   */
  collectStyles(t, e, i) {
    if ("fills" in t && t.fills) {
      for (const n of t.fills)
        if (n.type === "solid" && n.color) {
          const r = this.colorToKey(n.color), s = e.get(r);
          s ? s.count++ : e.set(r, { color: n.color, count: 1 });
        }
    }
    if (t.type === "text" && "textStyle" in t) {
      const n = this.textStyleToKey(t.textStyle), r = i.get(n);
      r ? r.count++ : i.set(n, { style: t.textStyle, count: 1 });
    }
    if (this.isContainerNode(t))
      for (const n of t.children)
        this.collectStyles(n, e, i);
  }
  /**
   * 颜色转键值
   */
  colorToKey(t) {
    return `${t.r}-${t.g}-${t.b}-${Math.round(t.a * 100)}`;
  }
  /**
   * 文本样式转键值
   */
  textStyleToKey(t) {
    return `${t.fontFamily}-${t.fontSize}-${t.fontWeight}-${t.color ? this.colorToKey(t.color) : "none"}`;
  }
  /**
   * 判断是否为容器节点
   */
  isContainerNode(t) {
    return t.type === "frame" || t.type === "group" || t.type === "component" || t.type === "instance";
  }
}
class S {
  constructor(t) {
    a(this, "config");
    a(this, "indentLevel", 0);
    this.config = {
      indentSize: 2,
      useSpaces: !0,
      generateComments: !0,
      ...t
    };
  }
  // ============================================================================
  // 辅助方法
  // ============================================================================
  /**
   * 获取缩进字符串
   */
  indent() {
    const t = this.config.useSpaces ? " " : "	", e = this.config.useSpaces ? this.config.indentSize || 2 : 1;
    return t.repeat(e * this.indentLevel);
  }
  /**
   * 增加缩进级别
   */
  pushIndent() {
    this.indentLevel++;
  }
  /**
   * 减少缩进级别
   */
  popIndent() {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }
  /**
   * 添加一行代码
   */
  line(t) {
    return `${this.indent()}${t}
`;
  }
  /**
   * 添加空行
   */
  emptyLine() {
    return `
`;
  }
  /**
   * 添加注释
   */
  comment(t) {
    return this.config.generateComments ? this.line(`// ${t}`) : "";
  }
  /**
   * 颜色转 Hex
   */
  colorToHex(t) {
    const e = t.r.toString(16).padStart(2, "0"), i = t.g.toString(16).padStart(2, "0"), n = t.b.toString(16).padStart(2, "0");
    return t.a < 1 ? `#${Math.round(t.a * 255).toString(16).padStart(2, "0")}${e}${i}${n}` : `#${e}${i}${n}`;
  }
  /**
   * 颜色转 RGBA 字符串
   */
  colorToRgba(t) {
    return t.a < 1 ? `rgba(${t.r}, ${t.g}, ${t.b}, ${t.a.toFixed(2)})` : `rgb(${t.r}, ${t.g}, ${t.b})`;
  }
  /**
   * 数值格式化（移除不必要的小数位）
   */
  formatNumber(t, e = 1) {
    const i = t.toFixed(e);
    return parseFloat(i).toString();
  }
  /**
   * 检查圆角是否统一
   */
  isUniformCornerRadius(t) {
    return typeof t == "number";
  }
  /**
   * 获取圆角值
   */
  getCornerRadiusValue(t) {
    return typeof t == "number" ? t : t ? Math.max(t.topLeft, t.topRight, t.bottomRight, t.bottomLeft) : 0;
  }
  /**
   * 检查内边距是否统一
   */
  isUniformPadding(t) {
    return t ? t.top === t.right && t.right === t.bottom && t.bottom === t.left : !0;
  }
  /**
   * 生成安全的变量名
   */
  toSafeVariableName(t) {
    return t.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, " ").trim().split(/\s+/).map((e, i) => i === 0 ? e.toLowerCase() : e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()).join("");
  }
  /**
   * 生成组件名称（PascalCase）
   */
  toComponentName(t) {
    const e = this.config.componentPrefix || "", i = t.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, " ").trim().split(/\s+/).map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join("");
    return e + i;
  }
}
const m = "https://placeholder.com/image";
class w extends S {
  constructor(t) {
    super({
      ...t,
      target: "flutter"
    });
  }
  get platform() {
    return "flutter";
  }
  /**
   * 渲染整个文档
   */
  render(t) {
    const e = [], i = this.toComponentName(t.name || "GeneratedWidget");
    let n = this.generateWidgetFile(i, t.root);
    return n = this.formatDartCode(n), e.push({
      filename: `${this.toSnakeCase(i)}.dart`,
      content: n,
      type: "dart"
    }), e;
  }
  /**
   * 生成 Widget 文件
   */
  generateWidgetFile(t, e) {
    let i = "";
    return i += `import 'package:flutter/material.dart';
`, i += `
`, i += `class ${t} extends StatelessWidget {
`, i += `  const ${t}({super.key});
`, i += `
`, i += `  @override
`, i += `  Widget build(BuildContext context) {
`, this.indentLevel = 2, i += this.renderNode(e), i += `  }
`, i += `}
`, i;
  }
  /**
   * 渲染单个节点
   */
  renderNode(t) {
    switch (t.type) {
      case "frame":
      case "group":
        return this.renderContainer(t);
      case "rectangle":
        return this.renderRectangle(t);
      case "ellipse":
        return this.renderEllipse(t);
      case "text":
        return this.renderText(t);
      case "image":
        return this.renderImage(t);
      case "component":
      case "instance":
        return this.renderContainer(t);
      default:
        return this.line(`// Unsupported node type: ${t.type}`);
    }
  }
  /**
   * 渲染容器节点
   */
  renderContainer(t) {
    const e = !!(t.fills && t.fills.length > 0 || t.strokes && t.strokes.length > 0 || t.shadows && t.shadows.length > 0 || t.cornerRadius), i = !!(t.layoutDirection && t.layoutDirection !== "none"), n = !!(t.padding && !this.isZeroPadding(t.padding)), r = this.hasResponsiveConstraints(t.constraints);
    if (t.children.length === 0 && !e && !r)
      return this.line(
        `return SizedBox(width: ${this.formatNumber(t.width)}, height: ${this.formatNumber(t.height)});`
      );
    let s = "";
    return r && this.config.useResponsive ? s += this.renderResponsiveWrapper(t.constraints, () => this.renderContainerContent(
      t,
      e,
      i,
      n,
      r
    )) : s += this.renderContainerContent(
      t,
      e,
      i,
      n,
      r
    ), s;
  }
  /**
   * 渲染容器内容
   */
  renderContainerContent(t, e, i, n, r) {
    let s = "";
    return e || n ? (s += this.line("return Container("), this.pushIndent(), t.width > 0 && !r && (s += this.line(`width: ${this.formatNumber(t.width)},`)), t.height > 0 && !r && (s += this.line(`height: ${this.formatNumber(t.height)},`)), t.constraints && !this.config.useResponsive && (s += this.renderConstraints(t.constraints)), n && (s += this.renderPadding(t.padding)), e && (s += this.renderBoxDecoration(t.fills, t.strokes, t.shadows, t.cornerRadius)), t.children.length > 0 && (s += this.line("child: "), this.pushIndent(), s += this.renderChildren(t, !!i), this.popIndent()), this.popIndent(), s += this.line(");")) : (s += this.line("return "), this.pushIndent(), s += this.renderChildren(t, !!i), this.popIndent(), s += this.line(";")), s;
  }
  /**
   * 渲染子元素
   */
  renderChildren(t, e) {
    if (t.children.length === 0)
      return this.line("const SizedBox.shrink()");
    if (t.children.length === 1) {
      const n = t.children[0];
      return this.renderChildWidget(n, e);
    }
    let i = "";
    if (e) {
      const n = t.layoutDirection === "horizontal", r = n ? "Row" : "Column";
      i += this.line(`${r}(`), this.pushIndent(), t.mainAxisAlignment && (i += this.line(
        `mainAxisAlignment: MainAxisAlignment.${this.convertMainAxisAlignment(t.mainAxisAlignment)},`
      )), t.crossAxisAlignment && (i += this.line(
        `crossAxisAlignment: CrossAxisAlignment.${this.convertCrossAxisAlignment(t.crossAxisAlignment)},`
      )), i += this.line("children: ["), this.pushIndent();
      for (let s = 0; s < t.children.length; s++) {
        const o = t.children[s];
        i += this.renderChildWidget(o, e), i += `,
`, t.itemSpacing && t.itemSpacing > 0 && s < t.children.length - 1 && (n ? i += this.line(`SizedBox(width: ${t.itemSpacing}),`) : i += this.line(`SizedBox(height: ${t.itemSpacing}),`));
      }
      this.popIndent(), i += this.line("],"), this.popIndent(), i += this.line(")");
    } else {
      i += this.line("Stack("), this.pushIndent(), i += this.line("children: ["), this.pushIndent();
      for (const n of t.children)
        i += this.line("Positioned("), this.pushIndent(), i += this.line(`left: ${this.formatNumber(n.x)},`), i += this.line(`top: ${this.formatNumber(n.y)},`), i += this.line("child: "), i += this.renderChildWidget(n), i += `,
`, this.popIndent(), i += this.line("),");
      this.popIndent(), i += this.line("],"), this.popIndent(), i += this.line(")");
    }
    return i;
  }
  /**
   * 渲染子 Widget
   */
  renderChildWidget(t, e = !1) {
    const i = "constraints" in t ? t.constraints : void 0, n = e && this.config.useResponsive && i && (i.widthPercent || i.heightPercent);
    let r = "";
    switch (t.type) {
      case "frame":
      case "group":
      case "component":
      case "instance":
        r = this.renderContainerAsChild(t, e);
        break;
      case "rectangle":
        r = this.renderRectangleAsChild(t);
        break;
      case "ellipse":
        r = this.renderEllipseAsChild(t);
        break;
      case "text":
        r = this.renderTextAsChild(t);
        break;
      case "image":
        r = this.renderImageAsChild(t);
        break;
      default:
        r = this.line(`// Unsupported: ${t.type}`);
    }
    return n && i ? this.wrapWithFlexible(r, i) : r;
  }
  /**
   * 渲染容器作为子元素
   */
  renderContainerAsChild(t, e = !1) {
    const i = !!(t.fills && t.fills.length > 0 || t.strokes && t.strokes.length > 0 || t.shadows && t.shadows.length > 0 || t.cornerRadius), n = !!(t.layoutDirection && t.layoutDirection !== "none"), r = !!(t.padding && !this.isZeroPadding(t.padding)), s = !!(this.config.useResponsive && this.hasResponsiveConstraints(t.constraints));
    let o = "";
    return s && !e ? o += this.renderFractionallySizedBox(t, i, n, r) : i || r ? (o += this.line("Container("), this.pushIndent(), t.width > 0 && !s && (o += this.line(`width: ${this.formatNumber(t.width)},`)), t.height > 0 && !s && (o += this.line(`height: ${this.formatNumber(t.height)},`)), t.constraints && !this.config.useResponsive && (o += this.renderConstraints(t.constraints)), r && (o += this.renderPadding(t.padding)), i && (o += this.renderBoxDecoration(t.fills, t.strokes, t.shadows, t.cornerRadius)), t.children.length > 0 && (o += this.line("child: "), this.pushIndent(), o += this.renderChildren(t, !!n), this.popIndent(), o += `,
`), this.popIndent(), o += this.indent() + ")") : t.children.length > 0 ? o += this.renderChildren(t, !!n) : o += this.indent() + `SizedBox(width: ${t.width}, height: ${t.height})`, o;
  }
  /**
   * 渲染矩形
   */
  renderRectangle(t) {
    let e = "";
    return e += this.line("return Container("), this.pushIndent(), e += this.line(`width: ${this.formatNumber(t.width)},`), e += this.line(`height: ${this.formatNumber(t.height)},`), e += this.renderBoxDecoration(t.fills, t.strokes, t.shadows, t.cornerRadius), this.popIndent(), e += this.line(");"), e;
  }
  /**
   * 渲染矩形作为子元素
   */
  renderRectangleAsChild(t) {
    let e = "";
    return e += this.line("Container("), this.pushIndent(), e += this.line(`width: ${this.formatNumber(t.width)},`), e += this.line(`height: ${this.formatNumber(t.height)},`), e += this.renderBoxDecoration(t.fills, t.strokes, t.shadows, t.cornerRadius), this.popIndent(), e += this.indent() + ")", e;
  }
  /**
   * 渲染椭圆
   */
  renderEllipse(t) {
    let e = "";
    return e += this.line("return Container("), this.pushIndent(), e += this.line(`width: ${this.formatNumber(t.width)},`), e += this.line(`height: ${this.formatNumber(t.height)},`), e += this.line("decoration: BoxDecoration("), this.pushIndent(), t.width === t.height ? e += this.line("shape: BoxShape.circle,") : e += this.line(
      `borderRadius: BorderRadius.all(Radius.elliptical(${t.width / 2}, ${t.height / 2})),`
    ), t.fills && t.fills.length > 0 && (e += this.renderFillColor(t.fills[0])), t.shadows && t.shadows.length > 0 && (e += this.renderBoxShadows(t.shadows)), this.popIndent(), e += this.line("),"), this.popIndent(), e += this.line(");"), e;
  }
  /**
   * 渲染椭圆作为子元素
   */
  renderEllipseAsChild(t) {
    let e = "";
    return e += this.line("Container("), this.pushIndent(), e += this.line(`width: ${this.formatNumber(t.width)},`), e += this.line(`height: ${this.formatNumber(t.height)},`), e += this.line("decoration: BoxDecoration("), this.pushIndent(), t.width === t.height ? e += this.line("shape: BoxShape.circle,") : e += this.line(
      `borderRadius: BorderRadius.all(Radius.elliptical(${t.width / 2}, ${t.height / 2})),`
    ), t.fills && t.fills.length > 0 && (e += this.renderFillColor(t.fills[0])), this.popIndent(), e += this.line("),"), this.popIndent(), e += this.indent() + ")", e;
  }
  /**
   * 渲染文本
   */
  renderText(t) {
    let e = "";
    return e += this.line("return Text("), this.pushIndent(), e += this.line(`'${this.escapeString(t.content)}',`), e += this.renderTextStyle(t), this.popIndent(), e += this.line(");"), e;
  }
  /**
   * 渲染文本作为子元素
   */
  renderTextAsChild(t) {
    let e = "";
    return e += this.line("Text("), this.pushIndent(), e += this.line(`'${this.escapeString(t.content)}',`), e += this.renderTextStyle(t), this.popIndent(), e += this.indent() + ")", e;
  }
  /**
   * 渲染文本样式
   */
  renderTextStyle(t) {
    const e = t.textStyle;
    let i = "";
    if (i += this.line("style: TextStyle("), this.pushIndent(), e.fontFamily && (i += this.line(`fontFamily: '${e.fontFamily}',`)), i += this.line(`fontSize: ${this.formatNumber(e.fontSize)},`), e.fontWeight && (i += this.line(`fontWeight: FontWeight.${this.convertFontWeight(e.fontWeight)},`)), e.italic && (i += this.line("fontStyle: FontStyle.italic,")), e.color && (i += this.line(`color: ${this.colorToFlutter(e.color)},`)), e.lineHeight) {
      const n = e.lineHeight / e.fontSize;
      i += this.line(`height: ${this.formatNumber(n, 2)},`);
    }
    return e.letterSpacing && (i += this.line(`letterSpacing: ${this.formatNumber(e.letterSpacing)},`)), e.decoration && e.decoration !== "none" && (i += this.line(
      `decoration: TextDecoration.${this.convertTextDecoration(e.decoration)},`
    )), this.popIndent(), i += this.line("),"), i;
  }
  /**
   * 渲染图片
   */
  renderImage(t) {
    let e = "";
    return t.cornerRadius ? (e += this.line("return ClipRRect("), this.pushIndent(), e += this.renderBorderRadius(t.cornerRadius), e += this.line("child: ")) : e += this.line("return "), e += this.line("Image.network("), this.pushIndent(), e += this.line(`'${t.imageUrl || m}',`), e += this.line(`width: ${this.formatNumber(t.width)},`), e += this.line(`height: ${this.formatNumber(t.height)},`), e += this.line(`fit: BoxFit.${this.convertImageMode(t.imageMode)},`), this.popIndent(), e += this.line(")"), t.cornerRadius ? (e += `,
`, this.popIndent(), e += this.line(");")) : e += `;
`, e;
  }
  /**
   * 渲染图片作为子元素
   */
  renderImageAsChild(t) {
    let e = "";
    return t.cornerRadius && (e += this.line("ClipRRect("), this.pushIndent(), e += this.renderBorderRadius(t.cornerRadius), e += this.line("child: ")), e += this.line("Image.network("), this.pushIndent(), e += this.line(`'${t.imageUrl || m}',`), e += this.line(`width: ${this.formatNumber(t.width)},`), e += this.line(`height: ${this.formatNumber(t.height)},`), e += this.line(`fit: BoxFit.${this.convertImageMode(t.imageMode)},`), this.popIndent(), e += this.indent() + ")", t.cornerRadius && (e += `,
`, this.popIndent(), e += this.indent() + ")"), e;
  }
  // ============================================================================
  // 装饰渲染
  // ============================================================================
  /**
   * 渲染 BoxDecoration
   */
  renderBoxDecoration(t, e, i, n) {
    let r = "";
    return r += this.line("decoration: BoxDecoration("), this.pushIndent(), t && t.length > 0 && (r += this.renderFillColor(t[0])), n && (r += this.renderBorderRadius(n)), e && e.length > 0 && (r += this.renderBorder(e[0])), i && i.length > 0 && (r += this.renderBoxShadows(i)), this.popIndent(), r += this.line("),"), r;
  }
  /**
   * 渲染填充颜色
   */
  renderFillColor(t) {
    if (t.type === "solid" && t.color)
      return this.line(`color: ${this.colorToFlutter(t.color)},`);
    if (t.type === "gradient" && t.gradient) {
      let e = "";
      const i = t.gradient;
      i.type === "linear" ? e += this.line("gradient: LinearGradient(") : i.type === "radial" ? e += this.line("gradient: RadialGradient(") : e += this.line("gradient: LinearGradient("), this.pushIndent(), e += this.line("colors: ["), this.pushIndent();
      for (const n of i.stops)
        e += this.line(`${this.colorToFlutter(n.color)},`);
      this.popIndent(), e += this.line("],"), e += this.line("stops: ["), this.pushIndent();
      for (const n of i.stops)
        e += this.line(`${this.formatNumber(n.position, 2)},`);
      return this.popIndent(), e += this.line("],"), this.popIndent(), e += this.line("),"), e;
    }
    return "";
  }
  /**
   * 渲染圆角
   */
  renderBorderRadius(t) {
    return typeof t == "number" ? this.line(`borderRadius: BorderRadius.circular(${this.formatNumber(t)}),`) : this.line(
      `borderRadius: BorderRadius.only(topLeft: Radius.circular(${t.topLeft}), topRight: Radius.circular(${t.topRight}), bottomRight: Radius.circular(${t.bottomRight}), bottomLeft: Radius.circular(${t.bottomLeft})),`
    );
  }
  /**
   * 渲染边框
   */
  renderBorder(t) {
    return this.line(
      `border: Border.all(color: ${this.colorToFlutter(t.color)}, width: ${t.width}),`
    );
  }
  /**
   * 渲染阴影
   */
  renderBoxShadows(t) {
    let e = "";
    e += this.line("boxShadow: ["), this.pushIndent();
    for (const i of t)
      e += this.line("BoxShadow("), this.pushIndent(), e += this.line(`color: ${this.colorToFlutter(i.color)},`), e += this.line(`offset: Offset(${i.offsetX}, ${i.offsetY}),`), e += this.line(`blurRadius: ${i.blur},`), i.spread && (e += this.line(`spreadRadius: ${i.spread},`)), this.popIndent(), e += this.line("),");
    return this.popIndent(), e += this.line("],"), e;
  }
  /**
   * 渲染内边距
   */
  renderPadding(t) {
    return this.isUniformPadding(t) ? this.line(`padding: EdgeInsets.all(${t.top}),`) : t.left === t.right && t.top === t.bottom ? this.line(
      `padding: EdgeInsets.symmetric(horizontal: ${t.left}, vertical: ${t.top}),`
    ) : this.line(
      `padding: EdgeInsets.only(left: ${t.left}, top: ${t.top}, right: ${t.right}, bottom: ${t.bottom}),`
    );
  }
  // ============================================================================
  // 辅助方法
  // ============================================================================
  /**
   * 颜色转 Flutter Color
   */
  colorToFlutter(t) {
    return t.a < 1 ? `Color.fromARGB(${Math.round(t.a * 255)}, ${t.r}, ${t.g}, ${t.b})` : `Color(0xFF${(t.r << 16 | t.g << 8 | t.b).toString(16).padStart(6, "0").toUpperCase()})`;
  }
  /**
   * 转换主轴对齐
   */
  convertMainAxisAlignment(t) {
    return {
      start: "start",
      center: "center",
      end: "end",
      spaceBetween: "spaceBetween",
      spaceAround: "spaceAround",
      spaceEvenly: "spaceEvenly"
    }[t] || "start";
  }
  /**
   * 转换交叉轴对齐
   */
  convertCrossAxisAlignment(t) {
    return {
      start: "start",
      center: "center",
      end: "end",
      stretch: "stretch",
      baseline: "baseline"
    }[t] || "start";
  }
  /**
   * 转换字体粗细
   */
  convertFontWeight(t) {
    return {
      thin: "w100",
      extraLight: "w200",
      light: "w300",
      regular: "w400",
      medium: "w500",
      semiBold: "w600",
      bold: "w700",
      extraBold: "w800",
      black: "w900"
    }[t] || "w400";
  }
  /**
   * 转换文本装饰
   */
  convertTextDecoration(t) {
    return {
      underline: "underline",
      lineThrough: "lineThrough",
      overline: "overline"
    }[t] || "none";
  }
  /**
   * 转换图片模式
   */
  convertImageMode(t) {
    return {
      fill: "cover",
      fit: "contain",
      crop: "cover",
      tile: "none"
    }[t || "fill"] || "cover";
  }
  /**
   * 转换为 snake_case
   */
  toSnakeCase(t) {
    return t.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  }
  /**
   * 转义字符串
   */
  escapeString(t) {
    return t.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
  }
  /**
   * 检查是否为零内边距
   */
  isZeroPadding(t) {
    return t.top === 0 && t.right === 0 && t.bottom === 0 && t.left === 0;
  }
  // ============================================================================
  // 响应式布局支持
  // ============================================================================
  /**
   * 检查是否有响应式约束
   */
  hasResponsiveConstraints(t) {
    return t ? !!(t.widthPercent || t.heightPercent || t.minWidth || t.maxWidth || t.minHeight || t.maxHeight) : !1;
  }
  /**
   * 渲染响应式包装器
   */
  renderResponsiveWrapper(t, e) {
    let i = "";
    i += this.line("return LayoutBuilder("), this.pushIndent(), i += this.line("builder: (context, constraints) {"), this.pushIndent();
    const n = e();
    return i += n, this.popIndent(), i += this.line("},"), this.popIndent(), i += this.line(");"), i;
  }
  /**
   * 渲染 FractionallySizedBox
   */
  renderFractionallySizedBox(t, e, i, n) {
    let r = "";
    const s = t.constraints;
    return r += this.line("FractionallySizedBox("), this.pushIndent(), s != null && s.widthPercent && (r += this.line(`widthFactor: ${this.formatNumber(s.widthPercent, 2)},`)), s != null && s.heightPercent && (r += this.line(`heightFactor: ${this.formatNumber(s.heightPercent, 2)},`)), r += this.line("alignment: Alignment.topLeft,"), (e || n || t.children.length > 0) && (r += this.line("child: Container("), this.pushIndent(), n && (r += this.renderPadding(t.padding)), e && (r += this.renderBoxDecoration(t.fills, t.strokes, t.shadows, t.cornerRadius)), t.children.length > 0 && (r += this.line("child: "), this.pushIndent(), r += this.renderChildren(t, !!i), this.popIndent(), r += `,
`), this.popIndent(), r += this.line("),")), this.popIndent(), r += this.indent() + ")", r;
  }
  /**
   * 使用 Flexible 包装子元素
   */
  wrapWithFlexible(t, e) {
    let i = "";
    if (e.widthPercent === 1 || e.heightPercent === 1)
      i += this.line("Expanded(");
    else {
      i += this.line("Flexible("), this.pushIndent();
      const r = e.widthPercent ?? e.heightPercent ?? 1, s = Math.max(1, Math.round(r * 10));
      i += this.line(`flex: ${s},`), this.popIndent();
    }
    return this.pushIndent(), i += this.line("child: "), i += t, i += `,
`, this.popIndent(), i += this.indent() + ")", i;
  }
  /**
   * 渲染约束
   */
  renderConstraints(t) {
    let e = "";
    return (t.minWidth || t.maxWidth || t.minHeight || t.maxHeight) && (e += this.line("constraints: BoxConstraints("), this.pushIndent(), t.minWidth && (e += this.line(`minWidth: ${this.formatNumber(t.minWidth)},`)), t.maxWidth && (e += this.line(`maxWidth: ${this.formatNumber(t.maxWidth)},`)), t.minHeight && (e += this.line(`minHeight: ${this.formatNumber(t.minHeight)},`)), t.maxHeight && (e += this.line(`maxHeight: ${this.formatNumber(t.maxHeight)},`)), this.popIndent(), e += this.line("),")), e;
  }
  // ============================================================================
  // Dart 代码格式化
  // ============================================================================
  /**
   * 格式化 Dart 代码
   * 遵循 dart format 风格规范
   */
  formatDartCode(t) {
    let e = t;
    return e = this.normalizeBlankLines(e), e = this.fixTrailingCommas(e), e = this.trimTrailingWhitespace(e), e.endsWith(`
`) || (e += `
`), e;
  }
  /**
   * 规范化空行（最多保留一个连续空行）
   */
  normalizeBlankLines(t) {
    return t.replace(/\n{3,}/g, `

`);
  }
  /**
   * 修复尾随逗号格式
   * 确保多行参数列表的最后一个参数有尾随逗号
   * 仅在明确是 Widget/函数调用结束处添加
   */
  fixTrailingCommas(t) {
    const e = t.split(`
`), i = [];
    for (let n = 0; n < e.length; n++) {
      const r = e[n], s = e[n + 1];
      s && /^\s*[)\]},]+\s*$/.test(s) && /[^\s,]$/.test(r.trim()) && !r.trim().endsWith(",") && !r.trim().endsWith("{") && !r.trim().endsWith("(") && !r.trim().endsWith("[") ? i.push(r.trimEnd() + ",") : i.push(r);
    }
    return i.join(`
`);
  }
  /**
   * 移除行尾空格
   */
  trimTrailingWhitespace(t) {
    return t.split(`
`).map((e) => e.trimEnd()).join(`
`);
  }
}
pixso.showUI(__html__, {
  width: 400,
  height: 600,
  themeColors: !0
});
let p = {
  target: "flutter",
  generateComments: !0,
  useResponsive: !1,
  indentSize: 2,
  useSpaces: !0
};
pixso.ui.onmessage = async (h) => {
  switch (h.type) {
    case "generate":
      await $(h.target);
      break;
    case "update-config":
      p = {
        ...p,
        ...h.config
      };
      break;
    case "get-selection":
      await d();
      break;
    case "close":
      pixso.closePlugin();
      break;
    default:
      console.warn("Unknown message type:", h.type);
  }
};
pixso.on("selectionchange", async () => {
  await d();
});
async function d() {
  const h = pixso.currentPage.selection;
  if (h.length === 0) {
    pixso.ui.postMessage({
      type: "selection-changed",
      hasSelection: !1,
      count: 0,
      name: null
    });
    return;
  }
  const t = h.length === 1 ? h[0].name : `${h.length} 个元素`;
  pixso.ui.postMessage({
    type: "selection-changed",
    hasSelection: !0,
    count: h.length,
    name: t
  });
}
async function $(h) {
  const t = pixso.currentPage.selection;
  if (t.length === 0) {
    pixso.notify("请先选择要转换的设计元素", { error: !0 });
    return;
  }
  try {
    pixso.ui.postMessage({ type: "generating", status: !0 });
    const i = await new C().analyzeSelection(t);
    if (!i) {
      pixso.notify("无法分析选中的节点", { error: !0 }), pixso.ui.postMessage({ type: "generating", status: !1 });
      return;
    }
    const r = new I().optimize(i), s = await R(r, h);
    pixso.ui.postMessage({
      type: "code-generated",
      results: s
    }), pixso.notify(`成功生成 ${h} 代码！`);
  } catch (e) {
    const i = e instanceof Error ? e.message : "未知错误";
    pixso.notify(`生成失败: ${i}`, { error: !0 }), pixso.ui.postMessage({
      type: "error",
      message: i
    });
  } finally {
    pixso.ui.postMessage({ type: "generating", status: !1 });
  }
}
async function R(h, t) {
  const e = {
    ...p,
    target: t
  };
  switch (t) {
    case "flutter":
      return new w(e).render(h);
    case "swiftui":
    case "compose":
    case "react":
    case "vue":
    case "weapp":
      throw new Error(`${t} 渲染器正在开发中，敬请期待！`);
    default:
      throw new Error(`不支持的目标平台: ${t}`);
  }
}
d();
