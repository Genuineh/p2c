/**
 * 颜色处理工具函数
 */

import type { ForgeColor } from '../ir/types';

/**
 * RGB 转 Hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Hex 转 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * ForgeColor 转 Hex
 */
export function forgeColorToHex(color: ForgeColor): string {
  return rgbToHex(color.r, color.g, color.b);
}

/**
 * ForgeColor 转 RGBA 字符串
 */
export function forgeColorToRgba(color: ForgeColor): string {
  if (color.a < 1) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * ForgeColor 转 Flutter Color 字符串
 */
export function forgeColorToFlutter(color: ForgeColor): string {
  if (color.a < 1) {
    const a = Math.round(color.a * 255);
    return `Color.fromARGB(${a}, ${color.r}, ${color.g}, ${color.b})`;
  }
  const hex = ((color.r << 16) | (color.g << 8) | color.b).toString(16).padStart(6, '0');
  return `Color(0xFF${hex.toUpperCase()})`;
}

/**
 * ForgeColor 转 SwiftUI Color 字符串
 */
export function forgeColorToSwiftUI(color: ForgeColor): string {
  const r = (color.r / 255).toFixed(3);
  const g = (color.g / 255).toFixed(3);
  const b = (color.b / 255).toFixed(3);
  if (color.a < 1) {
    return `Color(red: ${r}, green: ${g}, blue: ${b}, opacity: ${color.a.toFixed(2)})`;
  }
  return `Color(red: ${r}, green: ${g}, blue: ${b})`;
}

/**
 * ForgeColor 转 Compose Color 字符串
 */
export function forgeColorToCompose(color: ForgeColor): string {
  const hex = ((color.r << 16) | (color.g << 8) | color.b).toString(16).padStart(6, '0');
  if (color.a < 1) {
    const a = Math.round(color.a * 255)
      .toString(16)
      .padStart(2, '0');
    return `Color(0x${a.toUpperCase()}${hex.toUpperCase()})`;
  }
  return `Color(0xFF${hex.toUpperCase()})`;
}

/**
 * 计算颜色亮度 (0-1)
 */
export function getColorLuminance(color: ForgeColor): number {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const adjust = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
}

/**
 * 判断是否为浅色
 */
export function isLightColor(color: ForgeColor): boolean {
  return getColorLuminance(color) > 0.5;
}

/**
 * 创建 ForgeColor
 */
export function createForgeColor(r: number, g: number, b: number, a: number = 1): ForgeColor {
  return { r, g, b, a };
}

/**
 * 比较两个颜色是否相等
 */
export function colorsEqual(a: ForgeColor, b: ForgeColor): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && Math.abs(a.a - b.a) < 0.01;
}
