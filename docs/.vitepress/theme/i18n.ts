import { ref } from 'vue'

export type Lang = 'zh' | 'en'

const STORAGE_KEY = 'nest-admin-docs-lang'

const zhToEn: Record<string, string> = {
  'nest-admin 文档': 'nest-admin docs',
  // 导航
  首页: 'Home',
  部署: 'Deploy',
  自动部署: 'Auto Deploy',
  开发: 'Development',
  发布记录: 'Releases',
  // 侧边栏
  在线部署: 'Online Deployment',
  部署概览: 'Overview',
  最小闭环: 'Minimal Flow',
  密钥配置: 'Secrets',
  问题排查: 'Troubleshooting',
  命令速查: 'Command Checklist',
  协作开发: 'Collaboration',
  // 页面标题
  流程简介: 'Deployment Overview',
  MySQL部署: 'MySQL Deployment',
  Redis部署: 'Redis Deployment',
  PM2部署: 'PM2 Deployment',
  Nginx部署: 'Nginx Deployment',
  自动部署最小闭环: 'Auto Deploy: Minimal Flow',
  '自动部署 Secrets 与环境变量': 'Auto Deploy: Secrets & Env Vars',
  自动部署问题清单: 'Auto Deploy: Troubleshooting',
  自动部署排障命令速查: 'Auto Deploy: Command Checklist',
  // 主题内置界面文字
  本页目录: 'On this page',
  上一篇: 'Previous page',
  下一篇: 'Next page',
  回到顶部: 'Return to top',
  跳到正文: 'Skip to content',
  菜单: 'Menu',
  搜索: 'Search',
  // 首页
  '让开发，部署更简单': 'Making development and deployment simpler',
  nest中文网: 'NestJS Docs (Chinese)',
  vue3官网: 'Vue 3 Docs',
  vite官方中文文档: 'Vite Docs',
}

const enToZh = Object.fromEntries(Object.entries(zhToEn).map(([zh, en]) => [en, zh]))

const isBrowser = typeof window !== 'undefined'

export const lang = ref<Lang>('zh')

if (isBrowser) {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'zh' || saved === 'en') lang.value = saved
}

function translate(text: string, target: Lang) {
  const table = target === 'en' ? zhToEn : enToZh
  return table[text] ?? text
}

function firstTextNode(node: Node): Text | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node as Text).nodeValue?.trim() ? (node as Text) : null
  }
  for (const child of Array.from(node.childNodes)) {
    const found = firstTextNode(child)
    if (found) return found
  }
  return null
}

function translateElement(selector: string, target: Lang) {
  document.querySelectorAll(selector).forEach((el) => {
    const node = firstTextNode(el)
    if (!node?.nodeValue) return
    const original = node.nodeValue
    const trimmed = original.trim()
    const translated = translate(trimmed, target)
    if (translated === trimmed) return
    node.nodeValue = original.replace(trimmed, translated)
  })
}

function updateDocumentTitle(target: Lang) {
  const siteTitle = translate('nest-admin 文档', target)
  const h1 = document.querySelector('.VPDoc h1')
  const pageTitle = h1 ? firstTextNode(h1)?.nodeValue?.trim() : ''
  if (pageTitle) {
    document.title = `${pageTitle} | ${siteTitle}`
    return
  }
  // 没有 H1 的页面保留 VitePress 生成的页面名，只替换站点标题
  document.title = document.title
    .replace('nest-admin 文档', siteTitle)
    .replace('nest-admin docs', siteTitle)
}

export function applyTitles() {
  if (!isBrowser) return
  const target = lang.value

  document.documentElement.lang = target === 'zh' ? 'zh-CN' : 'en-US'

  // 站点标题、导航、侧边栏、页面大标题
  translateElement('.VPNavBarTitle .title', target)
  translateElement('.VPNavBarMenuLink', target)
  translateElement('.VPNavScreenMenuLink', target)
  translateElement('.VPSidebarItem .text', target)
  translateElement('.VPDoc h1', target)
  translateElement('.pager-link .title', target)

  // 主题内置文字
  translateElement('.pager-link .desc', target)
  translateElement('.VPDocAsideOutline .outline-title', target)
  translateElement('.VPLocalNav .menu-text', target)
  translateElement('.VPLocalNav button', target)
  translateElement('.VPBackToTop .label', target)
  translateElement('.VPSkipLink', target)
  translateElement('.DocSearch-Button-Placeholder', target)

  // 首页文案
  translateElement('.VPHome .tagline', target)
  translateElement('.VPFeature .title', target)

  updateDocumentTitle(target)
}

export function setLang(next: Lang) {
  lang.value = next
  if (isBrowser) window.localStorage.setItem(STORAGE_KEY, next)
  applyTitles()
}
