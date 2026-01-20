import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'sharedPkg',
          pattern: 'src/**',
        },
        {
          type: 'uiPkg',
          pattern: '../../packages/ui/src/**',
        },
        {
          type: 'webApp',
          pattern: '../../apps/web/src/**',
        },
      ],
    },
    rules: {
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: ['sharedPkg'],
              allow: ['sharedPkg'],
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../apps/web/**', '../../packages/ui/**'],
              message: 'packages/shared must not import apps/web or packages/ui.',
            },
          ],
        },
      ],
    },
  },
])
