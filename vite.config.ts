import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack';
import { execSync } from 'child_process';
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config
export default defineConfig({
  base: './',
  root: 'src',
  plugins: [
    checker({
      typescript: true
    }),
    {
      name: 'neu-build',
      apply: 'build',
      closeBundle() {
        console.log('Building standalone app')
        execSync('neu build --release');
      }
    },
    zip({
      inDir: './dist/unpacked',
      outDir: './dist',
      outFileName: 'game-web.zip'
    })
  ],
  build: {
    outDir: '../dist/unpacked',
    chunkSizeWarningLimit: 4096,
    assetsInlineLimit: 0,
    target: 'esnext'
  },
  server: {
    host: '127.0.0.1'
  }
});
