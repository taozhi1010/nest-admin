import type { VxeGridPropTypes } from '@vben/plugins/vxe-table';

import { h } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Button, Image } from 'ant-design-vue';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'rows',
            total: 'total',
            list: 'rows',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        // 溢出展示形式
        showOverflow: true,
        pagerConfig: {
          // 默认条数
          pageSize: 10,
          // 分页可选条数
          pageSizes: [10, 20, 30, 40, 50],
        },
        rowConfig: {
          // 鼠标移入行显示 hover 样式
          isHover: true,
          // 点击行高亮
          isCurrent: false,
        },
        columnConfig: {
          // 可拖拽列宽
          resizable: true,
        },
        // 右上角工具栏
        toolbarConfig: {
          // 自定义列
          custom: {
            icon: 'vxe-icon-setting',
          },
          // 最大化
          zoom: true,
          // 刷新
          refresh: {
            // 默认为reload 修改为在当前页刷新
            code: 'query',
          },
        },
        // 圆角按钮
        round: true,
        // 表格尺寸
        size: 'medium',
        customConfig: {
          // 表格右上角自定义列配置 是否保存到localStorage
          // 必须存在id参数才能使用
          storage: false,
        },
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        return h(Image, { src: row[column.field] });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          Button,
          { size: 'small', type: 'link' },
          { default: () => props?.text },
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

export { useVbenVxeGrid };

export type * from '@vben/plugins/vxe-table';

/**
 * 判断vxe-table的复选框是否选中
 * @param tableApi api
 * @returns boolean
 */
export function vxeCheckboxChecked(
  tableApi: ReturnType<typeof useVbenVxeGrid>[1],
) {
  return tableApi?.grid?.getCheckboxRecords?.()?.length > 0;
}

/**
 * 通用的 排序参数添加到请求参数中
 * @param params 请求参数
 * @param sortList vxe-table的排序参数
 */
export function addSortParams(
  params: Record<string, any>,
  sortList: VxeGridPropTypes.ProxyAjaxQuerySortCheckedParams[],
) {
  // 这里是排序取消 length为0 就不添加参数了
  if (sortList.length === 0) {
    return;
  }
  // 支持单/多字段排序
  const orderByColumn = sortList.map((item) => item.field).join(',');
  const isAsc = sortList.map((item) => item.order).join(',');
  params.orderByColumn = orderByColumn;
  params.isAsc = isAsc;
}
