export {};

/* prettier-ignore */
declare module 'vue' {
  export interface GlobalComponents {
    AButton: typeof import('ant-design-vue/es/button')['default'];
    GhostButton: typeof import('#/components/global/button')['GhostButton']
  }
}
