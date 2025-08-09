import antfu from '@antfu/eslint-config'

export default antfu({
  // 开启格式化工具
  formatters: true,
  rules: {
    // 关闭对使用严格等于(===)和严格不等于(!==)的强制要求
    'eqeqeq': 'off',
    // 关闭对在Node.js中优先使用全局process对象的检查
    'node/prefer-global/process': 'off',
    // 关闭对在Node.js中优先使用全局buffer对象的检查
    'node/prefer-global/buffer': 'off',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/check-param-names': 'off',

    'unused-imports/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'ts/no-use-before-define': 'off',

    'ts/no-unused-vars': 'off',
    // 忽略不存在属性的检查
    'no-prototype-builtins': 'off',

    'ts/consistent-type-imports': [
      'warn',
      {
        prefer: 'no-type-imports',
      },
    ],
  },
  // 忽略的文件
  ignores: ['**/prisma-client/*'],
})
