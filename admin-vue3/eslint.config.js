import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
import { configureVueProject } from '@vue/eslint-config-typescript'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'

// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup
configureVueProject({ scriptLangs: ['ts', 'tsx'] })

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  skipFormatting,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      // vue
      'vue/multi-word-component-names': 'off',

      // typescript
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',

      // perfectionist
      'perfectionist/sort-exports': 'warn',
      'perfectionist/sort-imports': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        },
      ],
      'perfectionist/sort-objects': 'off',
    },
  },
)
