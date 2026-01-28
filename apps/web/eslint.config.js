import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(rootDir, '..', '..')

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
      parserOptions: {
        project: [
          path.join(rootDir, 'tsconfig.app.json'),
          path.join(rootDir, 'tsconfig.node.json'),
        ],
        tsconfigRootDir: rootDir,
      },
    },
    settings: {
      'boundaries/root-path': repoRoot,
      'boundaries/include': [
        'apps/web/src/**',
        'packages/shared/src/**',
        'packages/ui/src/**',
        'packages/logic/src/**',
        'packages/db/src/**',
      ],
      'boundaries/ignore': ['**/node_modules/**', '**/dist/**'],
      'boundaries/elements': [
        {
          type: 'featurePublic',
          pattern: 'apps/web/src/features/*/index.ts',
          mode: 'file',
          capture: ['feature'],
        },
        {
          type: 'featurePublic',
          pattern: 'apps/web/src/features/*/index.tsx',
          mode: 'file',
          capture: ['feature'],
        },
        {
          type: 'featurePrivate',
          pattern: [
            'apps/web/src/features/*/atoms/**',
            'apps/web/src/features/*/components/**',
            'apps/web/src/features/*/hooks/**',
            'apps/web/src/features/*/layout/**',
            'apps/web/src/features/*/pages/**',
            'apps/web/src/features/*/utils/**',
            'apps/web/src/features/*/types/**',
          ],
          mode: 'full',
          capture: ['feature'],
        },
        {
          type: 'shared',
          pattern: 'apps/web/src/shared/**',
          mode: 'full',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/App.tsx',
          mode: 'file',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/main.tsx',
          mode: 'file',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/pages/**',
          mode: 'full',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/layout/**',
          mode: 'full',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/lib/**',
          mode: 'full',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/i18n/**',
          mode: 'full',
        },
        {
          type: 'app',
          pattern: 'apps/web/src/stores/**',
          mode: 'full',
        },
        {
          type: 'appInternal',
          pattern: 'apps/web/src/**',
          mode: 'full',
        },
        {
          type: 'sharedPkg',
          pattern: 'packages/shared/src/**',
        },
        {
          type: 'uiPkg',
          pattern: 'packages/ui/src/**',
        },
        {
          type: 'logicPkg',
          pattern: 'packages/logic/src/**',
        },
        {
          type: 'dbPkg',
          pattern: 'packages/db/src/**',
        },
      ],
      'import/resolver': {
        typescript: {
          project: path.join(rootDir, 'tsconfig.json'),
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
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
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "CallExpression[callee.name='useEffect'] CallExpression[callee.name=/^set[A-Z].*/]",
          message:
            'Avoid syncing query data into atoms inside useEffect. Prefer atomWithQuery/jotai-tanstack-query.',
        },
      ],
      'boundaries/no-unknown': 'off',
      'boundaries/entry-point': [
        'error',
        {
          rules: [
            {
              target: [
                'app',
                'appInternal',
                'shared',
                'featurePublic',
                'sharedPkg',
                'uiPkg',
                'logicPkg',
                'dbPkg',
              ],
              allow: ['**/*'],
            },
            {
              target: ['featurePrivate'],
              disallow: ['**/*'],
              message:
                'Do not import feature internals. Use the feature index.ts public entry.',
            },
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: ['app', 'appInternal', 'shared'],
              allow: [
                'app',
                'appInternal',
                'shared',
                'featurePublic',
                'featurePrivate',
                'sharedPkg',
                'uiPkg',
                'logicPkg',
              ],
            },
            {
              from: ['featurePublic'],
              allow: [
                'app',
                'appInternal',
                'shared',
                'featurePublic',
                'featurePrivate',
                'sharedPkg',
                'uiPkg',
                'logicPkg',
              ],
            },
            {
              from: ['featurePrivate'],
              allow: [
                'app',
                'appInternal',
                'shared',
                'featurePublic',
                'featurePrivate',
                'sharedPkg',
                'uiPkg',
                'logicPkg',
              ],
            },
            {
              from: ['sharedPkg', 'uiPkg', 'logicPkg', 'dbPkg'],
              allow: ['sharedPkg', 'logicPkg'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'boundaries/entry-point': 'off',
    },
  },
  {
    files: ['../../packages/shared/src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(repoRoot, 'packages/shared/tsconfig.json')],
        tsconfigRootDir: repoRoot,
      },
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
