import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import { peerDependencies } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      name: 'FrontendUtilities',
      fileName: 'index',
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), '@vue/devtools-kit'],
    }
  },
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    glsl(),
    dts({
      rollupTypes: true,
      tsconfigPath: 'tsconfig.json',
    }),
  ],
  define: {
    'process.env': {},
  },
})
