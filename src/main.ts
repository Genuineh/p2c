/**
 * Pixso CodeForge - 插件主入口
 *
 * 这是插件的主线程代码，运行在 Pixso 的沙箱环境中。
 * 主要负责与 Pixso API 交互，处理节点分析和代码生成。
 */

import { NodeAnalyzer } from './ir/analyzer';
import { IROptimizer } from './ir/optimizer';
import { FlutterRenderer } from './codegen/flutter';
import type { ForgeDocument, ForgeTargetPlatform, ForgeCodegenConfig } from './ir/types';
import type { RenderResult } from './codegen/base';

// 显示插件 UI
pixso.showUI(__html__, {
  width: 400,
  height: 600,
  themeColors: true,
});

/**
 * 当前配置
 */
let currentConfig: ForgeCodegenConfig = {
  target: 'flutter',
  generateComments: true,
  useResponsive: false,
  indentSize: 2,
  useSpaces: true,
};

/**
 * 处理来自 UI 的消息
 */
pixso.ui.onmessage = async (msg: { type: string; [key: string]: unknown }) => {
  switch (msg.type) {
    case 'generate':
      await handleGenerate(msg.target as ForgeTargetPlatform);
      break;

    case 'update-config':
      currentConfig = {
        ...currentConfig,
        ...(msg.config as Partial<ForgeCodegenConfig>),
      };
      break;

    case 'get-selection':
      await handleGetSelection();
      break;

    case 'close':
      pixso.closePlugin();
      break;

    default:
      // eslint-disable-next-line no-console
      console.warn('Unknown message type:', msg.type);
  }
};

/**
 * 监听选择变化
 */
pixso.on('selectionchange', async () => {
  await handleGetSelection();
});

/**
 * 处理获取选择
 */
async function handleGetSelection(): Promise<void> {
  const selection = pixso.currentPage.selection;

  if (selection.length === 0) {
    pixso.ui.postMessage({
      type: 'selection-changed',
      hasSelection: false,
      count: 0,
      name: null,
    });
    return;
  }

  const name = selection.length === 1 ? selection[0].name : `${selection.length} 个元素`;

  pixso.ui.postMessage({
    type: 'selection-changed',
    hasSelection: true,
    count: selection.length,
    name,
  });
}

/**
 * 处理代码生成
 */
async function handleGenerate(target: ForgeTargetPlatform): Promise<void> {
  const selection = pixso.currentPage.selection;

  if (selection.length === 0) {
    pixso.notify('请先选择要转换的设计元素', { error: true });
    return;
  }

  try {
    // 发送开始生成消息
    pixso.ui.postMessage({ type: 'generating', status: true });

    // 分析节点
    const analyzer = new NodeAnalyzer();
    const document = await analyzer.analyzeSelection(selection);

    if (!document) {
      pixso.notify('无法分析选中的节点', { error: true });
      pixso.ui.postMessage({ type: 'generating', status: false });
      return;
    }

    // 优化 IR
    const optimizer = new IROptimizer();
    const optimizedDocument = optimizer.optimize(document);

    // 生成代码
    const results = await generateCode(optimizedDocument, target);

    // 发送结果
    pixso.ui.postMessage({
      type: 'code-generated',
      results,
    });

    pixso.notify(`成功生成 ${target} 代码！`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    pixso.notify(`生成失败: ${errorMessage}`, { error: true });
    pixso.ui.postMessage({
      type: 'error',
      message: errorMessage,
    });
  } finally {
    pixso.ui.postMessage({ type: 'generating', status: false });
  }
}

/**
 * 根据目标平台生成代码
 */
async function generateCode(
  document: ForgeDocument,
  target: ForgeTargetPlatform
): Promise<RenderResult[]> {
  const config: ForgeCodegenConfig = {
    ...currentConfig,
    target,
  };

  switch (target) {
    case 'flutter': {
      const renderer = new FlutterRenderer(config);
      return renderer.render(document);
    }

    // TODO: 添加更多渲染器
    case 'swiftui':
    case 'compose':
    case 'react':
    case 'vue':
    case 'weapp':
      throw new Error(`${target} 渲染器正在开发中，敬请期待！`);

    default:
      throw new Error(`不支持的目标平台: ${target}`);
  }
}

// 初始化时获取当前选择
handleGetSelection();
