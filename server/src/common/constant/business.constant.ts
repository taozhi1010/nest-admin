export class BusinessType {
	/**
	 * 其它
	 */
	public static readonly OTHER = 0;

	/**
	 * 新增
	 */
	public static readonly INSERT = 1;

	/**
	 * 修改
	 */
	public static readonly UPDATE = 2;

	/**
	 * 删除
	 */
	public static readonly DELETE = 3;

	/**
	 * 授权
	 */
	public static readonly GRANT = 4;

	/**
	 * 导出
	 */
	public static readonly EXPORT = 5;

	/**
	 * 导入
	 */
	public static readonly IMPORT = 6;

	/**
	 * 强退
	 */
	public static readonly FORCE = 7;

	/**
	 * 生成代码
	 */
	public static readonly GENCODE = 8;

	/**
	 * 清空数据
	 */
	public static readonly CLEAN = 9;
}

export const BusinessTypeMap = [
	'其它',
	'新增',
	'修改',
	'删除',
	'授权',
	'导出',
	'导入',
	'强退',
	'生成代码',
	'清空数据',
];
