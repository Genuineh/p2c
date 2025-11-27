import { defineConfig } from 'vite';
import { resolve } from 'path';

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
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
