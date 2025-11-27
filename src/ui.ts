/**
 * Pixso CodeForge - UI 逻辑
 *
 * 这是插件 UI 的逻辑代码，运行在 iframe 中。
 */

// 状态
let hasSelection = false;
let selectedPlatform = 'flutter';
let isGenerating = false;

// 元素引用
const selectionName = document.getElementById('selectionName') as HTMLElement;
const selectionHint = document.getElementById('selectionHint') as HTMLElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const codeOutput = document.getElementById('codeOutput') as HTMLElement;
const placeholder = document.getElementById('placeholder') as HTMLElement;
const codeFilename = document.getElementById('codeFilename') as HTMLElement;
const codeContent = document.getElementById('codeContent') as HTMLElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const platformBtns = document.querySelectorAll('.platform-btn') as NodeListOf<HTMLButtonElement>;

/**
 * 初始化
 */
function init(): void {
  // 平台选择
  platformBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      platformBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPlatform = btn.dataset.platform || 'flutter';

      // 更新配置
      parent.postMessage(
        {
          pluginMessage: {
            type: 'update-config',
            config: { target: selectedPlatform },
          },
        },
        '*'
      );
    });
  });

  // 生成按钮
  generateBtn.addEventListener('click', handleGenerate);

  // 复制按钮
  copyBtn.addEventListener('click', handleCopy);

  // 请求初始选择状态
  parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
}

/**
 * 处理生成
 */
function handleGenerate(): void {
  if (!hasSelection || isGenerating) return;

  parent.postMessage(
    {
      pluginMessage: {
        type: 'generate',
        target: selectedPlatform,
      },
    },
    '*'
  );
}

/**
 * 处理复制
 */
async function handleCopy(): Promise<void> {
  const code = codeContent.textContent || '';
  if (!code) return;

  try {
    await navigator.clipboard.writeText(code);
    copyBtn.textContent = '已复制！';
    copyBtn.classList.add('copied');

    setTimeout(() => {
      copyBtn.textContent = '复制代码';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch {
    // 回退方案
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    copyBtn.textContent = '已复制！';
    copyBtn.classList.add('copied');

    setTimeout(() => {
      copyBtn.textContent = '复制代码';
      copyBtn.classList.remove('copied');
    }, 2000);
  }
}

/**
 * 更新选择状态
 */
function updateSelection(data: {
  hasSelection: boolean;
  count: number;
  name: string | null;
}): void {
  hasSelection = data.hasSelection;

  if (hasSelection) {
    selectionName.textContent = data.name || '未命名元素';
    selectionName.classList.remove('no-selection');
    selectionHint.textContent = data.count > 1 ? `已选择 ${data.count} 个元素` : '点击生成代码';
    generateBtn.disabled = false;
  } else {
    selectionName.textContent = '请选择设计元素';
    selectionName.classList.add('no-selection');
    selectionHint.textContent = '';
    generateBtn.disabled = true;
  }
}

/**
 * 更新生成状态
 */
function updateGenerating(status: boolean): void {
  isGenerating = status;
  generateBtn.disabled = status || !hasSelection;

  if (status) {
    generateBtn.classList.add('loading');
    generateBtn.textContent = '';
  } else {
    generateBtn.classList.remove('loading');
    generateBtn.textContent = '生成代码';
  }
}

/**
 * 显示生成的代码
 */
function showGeneratedCode(results: Array<{ filename: string; content: string }>): void {
  if (results.length === 0) return;

  const result = results[0]; // 目前只显示第一个文件
  codeFilename.textContent = result.filename;
  codeContent.textContent = result.content;

  codeOutput.style.display = 'flex';
  placeholder.style.display = 'none';
}

/**
 * 显示错误
 */
function showError(message: string): void {
  codeContent.textContent = `// 错误: ${message}`;
  codeOutput.style.display = 'flex';
  placeholder.style.display = 'none';
}

/**
 * 监听来自插件的消息
 */
window.onmessage = (event: MessageEvent): void => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'selection-changed':
      updateSelection(msg);
      break;

    case 'generating':
      updateGenerating(msg.status);
      break;

    case 'code-generated':
      showGeneratedCode(msg.results);
      break;

    case 'error':
      showError(msg.message);
      break;
  }
};

// 启动
init();
