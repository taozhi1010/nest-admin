/**
 * 用户常量信息
 */

/*** 平台内系统用户的唯一标志*/
export const SYS_USER = 'SYS_USER';

/** 正常状态 */
export const NORMAL = '0';

/** 异常状态 */
export const EXCEPTION = '1';

/** 用户封禁状态 */
export const USER_DISABLE = '1';

/** 角色封禁状态 */
export const ROLE_DISABLE = '1';

/** 部门正常状态 */
export const DEPT_NORMAL = '0';

/** 部门停用状态 */
export const DEPT_DISABLE = '1';

/** 字典正常状态 */
export const DICT_NORMAL = '0';

/** 是否为系统默认（是） */
export const YES = 'Y';

/** 是否菜单外链（是） */
export const YES_FRAME = '0';

/** 是否菜单外链（否） */
export const NO_FRAME = '1';

/** 菜单类型（目录） */
export const TYPE_DIR = 'M';

/** 菜单类型（菜单） */
export const TYPE_MENU = 'C';

/** 菜单类型（按钮） */
export const TYPE_BUTTON = 'F';

/** Layout组件标识 */
export const LAYOUT = 'Layout';

/** ParentView组件标识 */
export const PARENT_VIEW = 'ParentView';

/** InnerLink组件标识 */
export const INNER_LINK = 'InnerLink';

/** 校验是否唯一的返回标识 */
export const UNIQUE = true;
export const NOT_UNIQUE = false;

/**
 * 用户名长度限制
 */
export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 20;

/**
 * 密码长度限制
 */
export const PASSWORD_MIN_LENGTH = 5;
export const PASSWORD_MAX_LENGTH = 20;
