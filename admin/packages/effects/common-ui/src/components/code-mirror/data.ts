import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { vue } from '@codemirror/lang-vue';
import { xml } from '@codemirror/lang-xml';

/**
 * 可自行安装依赖并按格式配置 函数形参为配置项
 * @see https://github.com/logue/vue-codemirror6?tab=readme-ov-file#supported-languages Language Support项
 */
export const languageSupportMap = {
  html: html(),
  java: java(),
  js: javascript(),
  jsx: javascript({ jsx: true }),
  sql: sql(),
  ts: javascript({ typescript: true }),
  tsx: javascript({ jsx: true, typescript: true }),
  vue: vue(),
  xml: xml(),
};

export type LanguageSupport = keyof typeof languageSupportMap;
