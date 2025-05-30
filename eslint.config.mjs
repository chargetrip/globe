import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['node_modules', 'dist', 'release'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
])
