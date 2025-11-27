import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

// Plugin to inline UI script into HTML
function inlineUiHtml() {
  return {
    name: 'inline-ui-html',
    closeBundle() {
      const uiHtmlPath = resolve(__dirname, 'src/ui.html');
      const uiJsPath = resolve(__dirname, 'dist/ui.js');
      const outputPath = resolve(__dirname, 'dist/ui.html');

      const html = readFileSync(uiHtmlPath, 'utf-8');
      const js = readFileSync(uiJsPath, 'utf-8');

      // Replace <script src="ui.js"></script> with inline script
      const inlinedHtml = html.replace(
        '<script src="ui.js"></script>',
        `<script>${js}</script>`
      );

      writeFileSync(outputPath, inlinedHtml);
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main.ts'),
        ui: resolve(__dirname, 'src/ui.ts'),
      },
      formats: ['es'],
    },
    outDir: 'dist',
    emptyDirBeforeWrite: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [inlineUiHtml()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
