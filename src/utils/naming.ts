/**
 * 命名工具函数
 * 用于生成语义化的变量名、组件名等
 */

/**
 * 转换为 camelCase
 */
export function toCamelCase(str: string): string {
  return str
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
 * 转换为 PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * 转换为 snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '');
}

/**
 * 转换为 kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

/**
 * 转换为 CONSTANT_CASE
 */
export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

/**
 * 生成安全的变量名（确保以字母开头）
 */
export function toSafeVariableName(str: string): string {
  let name = toCamelCase(str);

  // 如果以数字开头，添加前缀
  if (/^\d/.test(name)) {
    name = '_' + name;
  }

  // 如果为空，使用默认名称
  if (!name) {
    name = 'unnamed';
  }

  return name;
}

/**
 * 生成组件名称
 */
export function toComponentName(str: string, prefix: string = ''): string {
  const name = toPascalCase(str);
  return prefix + (name || 'Component');
}

/**
 * 生成唯一名称（带数字后缀）
 */
export function generateUniqueName(baseName: string, existingNames: Set<string>): string {
  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let counter = 1;
  let uniqueName = `${baseName}${counter}`;

  while (existingNames.has(uniqueName)) {
    counter++;
    uniqueName = `${baseName}${counter}`;
  }

  return uniqueName;
}

/**
 * 从路径提取文件名
 */
export function extractFileName(path: string): string {
  const parts = path.split(/[/\\]/);
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^.]+$/, '');
}

/**
 * 验证是否为有效的标识符
 */
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
}

/**
 * 清理名称中的特殊字符
 */
export function sanitizeName(str: string): string {
  return str.replace(/[^\w\u4e00-\u9fa5]/g, '');
}
