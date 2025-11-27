/**
 * Pixso CodeForge - UI 组件
 *
 * 使用 React 实现的插件 UI
 */
import { useState, useEffect, useCallback } from 'react';
import './app.css';

/**
 * 目标平台类型
 */
type TargetPlatform = 'flutter' | 'swiftui' | 'compose' | 'react' | 'vue' | 'weapp';

/**
 * 代码生成结果
 */
interface CodeResult {
  filename: string;
  content: string;
}

/**
 * 平台配置
 */
interface PlatformConfig {
  id: TargetPlatform;
  name: string;
  icon: string;
  enabled: boolean;
}

/**
 * 可用平台列表
 */
const PLATFORMS: PlatformConfig[] = [
  { id: 'flutter', name: 'Flutter', icon: '💙', enabled: true },
  { id: 'swiftui', name: 'SwiftUI', icon: '🍎', enabled: false },
  { id: 'compose', name: 'Compose', icon: '🤖', enabled: false },
  { id: 'react', name: 'React', icon: '⚛️', enabled: false },
  { id: 'vue', name: 'Vue 3', icon: '💚', enabled: false },
  { id: 'weapp', name: '小程序', icon: '💬', enabled: false },
];

/**
 * 主应用组件
 */
const App = () => {
  // 状态
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [selectionName, setSelectionName] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<TargetPlatform>('flutter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeResult, setCodeResult] = useState<CodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * 发送消息到插件主线程
   */
  const postMessage = useCallback((type: string, data: Record<string, unknown> = {}) => {
    parent.postMessage({ pluginMessage: { type, ...data } }, '*');
  }, []);

  /**
   * 处理生成代码
   */
  const handleGenerate = useCallback(() => {
    if (!hasSelection || isGenerating) return;
    setError(null);
    postMessage('generate', { target: selectedPlatform });
  }, [hasSelection, isGenerating, selectedPlatform, postMessage]);

  /**
   * 处理平台选择
   */
  const handlePlatformSelect = useCallback(
    (platform: TargetPlatform) => {
      setSelectedPlatform(platform);
      postMessage('update-config', { config: { target: platform } });
    },
    [postMessage]
  );

  /**
   * 处理复制代码
   */
  const handleCopy = useCallback(async () => {
    if (!codeResult?.content) return;

    try {
      await navigator.clipboard.writeText(codeResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 回退方案
      const textarea = document.createElement('textarea');
      textarea.value = codeResult.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeResult]);

  /**
   * 监听来自插件的消息
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'selection-changed':
          setHasSelection(msg.hasSelection);
          setSelectionCount(msg.count);
          setSelectionName(msg.name);
          break;

        case 'generating':
          setIsGenerating(msg.status);
          break;

        case 'code-generated':
          if (msg.results && msg.results.length > 0) {
            setCodeResult(msg.results[0]);
          }
          break;

        case 'error':
          setError(msg.message);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // 请求初始选择状态
    postMessage('get-selection');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [postMessage]);

  return (
    <div className="container">
      {/* 头部 */}
      <div className="header">
        <div className="logo">⚡</div>
        <div>
          <div className="title">Pixso CodeForge</div>
          <div className="subtitle">像素锻造 · 一键生成多端代码</div>
        </div>
      </div>

      {/* 选择信息 */}
      <div className="section">
        <div className="section-title">当前选择</div>
        <div className="selection-info">
          <div className="selection-icon">📦</div>
          <div className="selection-text">
            <div className={`selection-name ${!hasSelection ? 'no-selection' : ''}`}>
              {hasSelection ? selectionName || '未命名元素' : '请选择设计元素'}
            </div>
            <div className="selection-hint">
              {hasSelection
                ? selectionCount > 1
                  ? `已选择 ${selectionCount} 个元素`
                  : '点击生成代码'
                : ''}
            </div>
          </div>
        </div>
      </div>

      {/* 平台选择 */}
      <div className="section">
        <div className="section-title">目标平台</div>
        <div className="platform-grid">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              className={`platform-btn ${selectedPlatform === platform.id ? 'active' : ''}`}
              disabled={!platform.enabled}
              onClick={() => platform.enabled && handlePlatformSelect(platform.id)}
            >
              <span className="platform-icon">{platform.icon}</span>
              <span className="platform-name">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <div className="section">
        <button
          className={`generate-btn ${isGenerating ? 'loading' : ''}`}
          disabled={!hasSelection || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? '' : '生成代码'}
        </button>
      </div>

      {/* 代码输出 */}
      {codeResult ? (
        <div className="code-output">
          <div className="code-header">
            <span className="code-filename">{codeResult.filename}</span>
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? '已复制！' : '复制代码'}
            </button>
          </div>
          <div className="code-area">
            <pre className="code-content">{error ? `// 错误: ${error}` : codeResult.content}</pre>
          </div>
        </div>
      ) : (
        <div className="placeholder">
          <div className="placeholder-icon">✨</div>
          <div>选择设计元素后点击"生成代码"</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>
            支持 Frame、Group、Text、Rectangle 等
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
