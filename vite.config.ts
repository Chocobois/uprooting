import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack';
import { execSync } from 'child_process';

// https://vitejs.dev/config
export default defineConfig({
  root: 'src',
  plugins: [
    {
      name: 'neu-build',
      apply: 'build',
      closeBundle() {
        console.log('Building standalone app')
        execSync('neu build');
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
    chunkSizeWarningLimit: 4096
  }
});
