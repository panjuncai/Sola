import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      boundaries,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'featurePublic',
          pattern: 'src/features/*/index.{ts,tsx}',
          capture: ['feature'],
        },
        {
          type: 'featurePrivate',
          pattern: 'src/features/*/**',
          capture: ['feature'],
        },
        {
          type: 'shared',
          pattern: 'src/shared/**',
        },
        {
          type: 'app',
          pattern: 'src/**',
        },
      ],
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/features/*/*',
                '@/features/*/*/*',
                '@/features/*/*/*/*',
                '@/features/*/*/*/*/*',
              ],
              message: 'Use the feature public entry (e.g. "@/features/articles") instead of deep imports.',
            },
          ],
        },
      ],
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: ['app', 'shared'],
              allow: ['shared', 'featurePublic'],
            },
            {
              from: ['featurePublic'],
              allow: ['shared', 'featurePublic', { type: 'featurePrivate', same: true }],
            },
            {
              from: ['featurePrivate'],
              allow: [
                'shared',
                'featurePublic',
                { type: 'featurePrivate', same: true },
                { type: 'featurePublic', same: true },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['../../packages/shared/src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'sharedPkg',
          pattern: '../../packages/shared/src/**',
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
