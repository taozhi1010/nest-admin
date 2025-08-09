/**
 * @description 租户套餐
 * @param packageId id
 * @param packageName 名称
 * @param menuIds 菜单id  格式为[1,2,3] 返回为string 提交为数组
 * @param remark 备注
 * @param menuCheckStrictly 是否关联父节点
 * @param status 状态
 */
export interface TenantPackage {
  packageId: string;
  packageName: string;
  menuIds: number[] | string;
  remark: string;
  menuCheckStrictly: boolean;
  status: string;
}
