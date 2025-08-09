import { createIconifyOfflineIcon } from '@vben-core/icons';

import githubOutlined from '@iconify/icons-ant-design/github-outlined';
import inboxIcon from '@iconify/icons-ant-design/inbox-outlined';
import userOutlined from '@iconify/icons-ant-design/user-outlined';
import ucIcon from '@iconify/icons-arcticons/uc-browser';
import defaultFileIcon from '@iconify/icons-bx/file';
import sqlIcon from '@iconify/icons-carbon/sql';
import linuxIcon from '@iconify/icons-devicon/linux';
import windowsIcon from '@iconify/icons-devicon/windows8';
import alipayIcon from '@iconify/icons-fa-brands/alipay';
import androidIcon from '@iconify/icons-flat-color-icons/android-os';
import comandLine from '@iconify/icons-flat-color-icons/command-line';
import folderIcon from '@iconify/icons-flat-color-icons/folder';
import defaultOsIcon from '@iconify/icons-ic/outline-computer';
import memoryIcon from '@iconify/icons-la/memory';
import chromeIcon from '@iconify/icons-logos/chrome';
import firefoxIcon from '@iconify/icons-logos/firefox';
import edgeIcon from '@iconify/icons-logos/microsoft-edge';
import operaIcon from '@iconify/icons-logos/opera';
import quarkIcon from '@iconify/icons-logos/quarkus-icon';
import redisIcon from '@iconify/icons-logos/redis';
import safariIcon from '@iconify/icons-logos/safari';
import vueIcon from '@iconify/icons-logos/vue';
import iphoneIcon from '@iconify/icons-majesticons/iphone-x-apps-line';
import menuIcon from '@iconify/icons-material-symbols/menu';
import okButtonIcon from '@iconify/icons-mdi/button-pointer';
import micromessengerIcon from '@iconify/icons-mdi/wechat';
import defaultBrowserIcon from '@iconify/icons-ph/browser-duotone';
import baiduIcon from '@iconify/icons-ri/baidu-fill';
import dingdingFill from '@iconify/icons-ri/dingding-fill';
import dingtalkIcon from '@iconify/icons-ri/dingding-line';
import taobaoIconFill from '@iconify/icons-ri/taobao-fill';
import giteeIcon from '@iconify/icons-simple-icons/gitee';
import qqIcon from '@iconify/icons-simple-icons/tencentqq';
import javaIcon from '@iconify/icons-skill-icons/java-light';
import tsIcon from '@iconify/icons-skill-icons/typescript';
import xmlIcon from '@iconify/icons-tabler/file-type-xml';
import githubOAuthIcon from '@iconify/icons-uiw/github';
import excelIcon from '@iconify/icons-vscode-icons/file-type-excel';
import osxIcon from '@iconify/icons-wpf/macos';

import './menu-icons';

// 用户 下拉菜单
export const GitHubOutlined = createIconifyOfflineIcon(
  'ant-design:github-outlined',
  githubOutlined,
);

export const UserOutlined = createIconifyOfflineIcon(
  'ant-design:user-outlined',
  userOutlined,
);

// 缓存监控使用
export const RedisIcon = createIconifyOfflineIcon('logos:redis', redisIcon);
export const CommandLineIcon = createIconifyOfflineIcon(
  'flat-color-icons:command-line',
  comandLine,
);
export const MemoryIcon = createIconifyOfflineIcon('la:memory', memoryIcon);

// 用户管理 导入
// Excel图标
export const ExcelIcon = createIconifyOfflineIcon(
  'vscode-icons:file-type-excel',
  excelIcon,
);
// 拖拽上传图标
export const InBoxIcon = createIconifyOfflineIcon(
  'ant-design:inbox-outlined',
  inboxIcon,
);

// 第三方登录相关图标
export const TaobaoIcon = createIconifyOfflineIcon(
  'ri:taobao-fill',
  taobaoIconFill,
);
export const AlipayIcon = createIconifyOfflineIcon(
  'fa-brands:alipay',
  alipayIcon,
);
export const DingdingIcon = createIconifyOfflineIcon(
  'ri:dingding-fill',
  dingdingFill,
);
export const GiteeIcon = createIconifyOfflineIcon(
  'simple-icons:gitee',
  giteeIcon,
);
export const GithubOAuthIcon = createIconifyOfflineIcon(
  'uiw:github',
  githubOAuthIcon,
);

// 系统相关图标
export const WindowsIcon = createIconifyOfflineIcon(
  'devicon:windows8',
  windowsIcon,
);
export const LinuxIcon = createIconifyOfflineIcon('devicon:linux', linuxIcon);
export const OSXIcon = createIconifyOfflineIcon('wpf:macos', osxIcon);
export const AndroidIcon = createIconifyOfflineIcon(
  'flat-color-icons:android-os',
  androidIcon,
);
export const IPhoneIcon = createIconifyOfflineIcon(
  'majesticons:iphone-x-apps-line',
  iphoneIcon,
);
// 上面图标没找到 默认图标
export const DefaultOsIcon = createIconifyOfflineIcon(
  'ic:outline-computer',
  defaultOsIcon,
);

// 浏览器相关图标
export const ChromeIcon = createIconifyOfflineIcon('logos:chrome', chromeIcon);
export const EdgeIcon = createIconifyOfflineIcon(
  'logos:microsoft-edge',
  edgeIcon,
);
export const FirefoxIcon = createIconifyOfflineIcon(
  'logos:firefox',
  firefoxIcon,
);
export const OperaIcon = createIconifyOfflineIcon('logos:opera', operaIcon);
export const SafariIcon = createIconifyOfflineIcon('logos:safari', safariIcon);
export const MicromessengerIcon = createIconifyOfflineIcon(
  'mdi:wechat',
  micromessengerIcon,
);
export const QuarkIcon = createIconifyOfflineIcon(
  'logos:quarkus-icon',
  quarkIcon,
);
export const QQIcon = createIconifyOfflineIcon(
  'simple-icons:tencentqq',
  qqIcon,
);
export const DingtalkIcon = createIconifyOfflineIcon(
  'ri:dingding-line',
  dingtalkIcon,
);
export const UcIcon = createIconifyOfflineIcon('arcticons:uc-browser', ucIcon);
export const BaiduIcon = createIconifyOfflineIcon('ri:baidu-fill', baiduIcon);
// 未知浏览器图标
export const DefaultBrowserIcon = createIconifyOfflineIcon(
  'ph:browser-duotone',
  defaultBrowserIcon,
);

// 菜单类型 目录/按钮/菜单
export const FolderIcon = createIconifyOfflineIcon(
  'flat-color-icons:folder',
  folderIcon,
);
export const OkButtonIcon = createIconifyOfflineIcon(
  'mdi:button-pointer',
  okButtonIcon,
);
export const MenuIcon = createIconifyOfflineIcon(
  'material-symbols:menu',
  menuIcon,
);

export const JavaIcon = createIconifyOfflineIcon(
  'skill-icons:java-light',
  javaIcon,
);
export const XmlIcon = createIconifyOfflineIcon(
  'tabler:file-type-xml',
  xmlIcon,
);
export const SqlIcon = createIconifyOfflineIcon('carbon:sql', sqlIcon);
export const TsIcon = createIconifyOfflineIcon(
  'skill-icons:typescript',
  tsIcon,
);
export const VueIcon = createIconifyOfflineIcon('logos:vue', vueIcon);
export const DefaultFileIcon = createIconifyOfflineIcon(
  'flat-color-icons:folder',
  defaultFileIcon,
);
