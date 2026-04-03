import eslint from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierConfig from '@vue/eslint-config-prettier'
import typescriptConfig from '@vue/eslint-config-typescript'

export default [
  // ESLint 推荐规则
  eslint.configs.recommended,

  // Vue 插件配置
  ...vuePlugin.configs['flat/recommended'],

  // TypeScript 配置
  {
    ...typescriptConfig,
    files: ['**/*.{ts,tsx,vue}']
  },

  // Prettier 配置 (必须放在最后以覆盖其他规则)
  prettierConfig,

  // 项目特定配置
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Vue 3 组合式 API
        ref: 'readonly',
        shallowRef: 'readonly',
        computed: 'readonly',
        reactive: 'readonly',
        readonly: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        watchPostEffect: 'readonly',
        watchSyncEffect: 'readonly',
        onMounted: 'readonly',
        onUpdated: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUpdate: 'readonly',
        onBeforeUnmount: 'readonly',
        onUnmounted: 'readonly',
        onActivated: 'readonly',
        onDeactivated: 'readonly',
        onServerPrefetch: 'readonly',
        onScopeDispose: 'readonly',
        provide: 'readonly',
        inject: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        nextTick: 'readonly',
        useSlots: 'readonly',
        useAttrs: 'readonly',
        toRef: 'readonly',
        toRefs: 'readonly',
        toValue: 'readonly',
        unref: 'readonly',
        isRef: 'readonly',
        isReactive: 'readonly',
        isReadonly: 'readonly',
        isProxy: 'readonly',
        markRaw: 'readonly',
        shallowReactive: 'readonly',
        shallowReadonly: 'readonly',
        triggerRef: 'readonly',
        customRef: 'readonly',
        effectScope: 'readonly',
        getCurrentScope: 'readonly',
        h: 'readonly',
        mergeProps: 'readonly',
        cloneVNode: 'readonly',
        isVNode: 'readonly',
        resolveComponent: 'readonly',
        resolveDirective: 'readonly',
        // 其他全局变量
        defineOptions: 'writable',
        getCurrentInstance: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        proxy: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        process: 'readonly',
        __dirname: 'readonly'
      }
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
        }
      }
    },
    rules: {
      // TypeScript 规则
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-this-alias': 'off',

      // 基础规则
      'array-callback-return': 'off',
      'no-alert': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-restricted-imports': 'off',
      'no-return-await': 'off',
      'prefer-const': 'off',
      'prefer-template': 'error',
      camelcase: 'off',
      'no-unused-vars': 'off', // 关闭未使用变量检查
      'no-undef': 'warn', // 改为警告，允许全局变量

      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/no-setup-props-destructure': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',

      // Vue 属性顺序规则 - 关闭，让 Prettier 控制
      'vue/attributes-order': 'off',

      // Vue 组件命名规则
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        {
          registeredComponentsOnly: false,
          ignores: []
        }
      ],

      // Vue 自闭合标签规则 - 允许 HTML 元素使用自闭合（Vue 项目推荐）
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always', // void 元素使用自闭合
            normal: 'any', // 普通元素可选
            component: 'always' // 组件使用自闭合
          },
          svg: 'always',
          math: 'always'
        }
      ],

      // Vue 事件绑定短横线规则 - 关闭 autofix，让 Prettier 处理格式化
      'vue/v-on-event-hyphenation': [
        'warn',
        'always'
      ],

      // 关闭属性换行规则，让 Prettier 控制
      'vue/first-attribute-linebreak': 'off',

      // 关闭其他可能影响换行的规则
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-newline': 'off'
    }
  },

  // 忽略文件配置
  {
    ignores: ['node_modules/', 'src/assets/', 'src/icons/', 'public/', 'dist/', '.vite/', 'auto-imports.d.ts', 'components.d.ts', 'website.html', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '**/*.min.js', '**/*.min.css', '.lingma/', 'coverage/']
  }
]
