import type { Directive } from 'vue';

declare module 'vue' {
  export interface ComponentCustomProperties {
    /**
     * 判断权限: v-access:code=""
     * 判断角色  v-access:role=""
     * 需要VueOfficial插件版本 >= 2.1.8
     */
    vAccess: Directive<Element, string | string[], string, 'code' | 'role'>;
  }
}
