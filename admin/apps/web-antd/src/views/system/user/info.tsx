import type { DescItem } from '#/components/description';

import { DictEnum } from '@vben/constants';

import { Tag } from 'ant-design-vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import { renderDict } from '#/utils/render';

dayjs.extend(duration);
dayjs.extend(relativeTime);

function renderTags(list: string[]) {
  return (
    <div class="flex flex-row flex-wrap gap-0.5">
      {list.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}

export const descSchema: DescItem[] = [
  {
    field: 'userId',
    label: '用户ID',
  },
  {
    field: 'status',
    label: '用户状态',
    render(value) {
      return renderDict(value, DictEnum.SYS_NORMAL_DISABLE);
    },
  },
  {
    field: 'nickName',
    label: '用户信息',
    render(_, data) {
      const { deptName = '暂无部门信息', nickName, username } = data;
      // 为了兼容新版本和旧版本
      let currentDept = deptName;
      if (data.dept && data.dept.deptName) {
        currentDept = data.dept.deptName;
      }
      return `${username} / ${nickName} / ${currentDept}`;
    },
  },
  {
    field: 'phonenumber',
    label: '手机号',
    render(value) {
      return value || '未设置手机号码';
    },
  },
  {
    field: 'email',
    label: '邮箱',
    render(value) {
      return value || '未设置邮箱地址';
    },
  },
  {
    field: 'postNames',
    label: '岗位',
    render(value) {
      if (Array.isArray(value) && value.length === 0) {
        return '暂无信息';
      }
      return renderTags(value);
    },
  },
  {
    field: 'roleNames',
    label: '权限',
    render(value) {
      if (Array.isArray(value) && value.length === 0) {
        return '暂无信息';
      }
      return renderTags(value);
    },
  },
  {
    field: 'createTime',
    label: '创建时间',
  },
  {
    field: 'loginIp',
    label: '上次登录IP',
    render(value) {
      return value || <span class="text-orange-500">从未登录过</span>;
    },
  },
  {
    field: 'loginDate',
    label: '上次登录时间',
    render(value) {
      if (!value) {
        return <span class="text-orange-500">从未登录过</span>;
      }
      // 默认en显示
      dayjs.locale('zh-cn');
      // 计算相差秒数
      const diffSeconds = dayjs().diff(dayjs(value), 'second');
      /**
       * 转为时间显示(x月 x天)
       * https://dayjs.fenxianglu.cn/category/duration.html#%E4%BA%BA%E6%80%A7%E5%8C%96
       *
       */
      const diffText = dayjs.duration(diffSeconds, 'seconds').humanize();
      return (
        <div class="flex gap-2">
          {value}
          <Tag bordered={false} color="cyan">
            {diffText}前
          </Tag>
        </div>
      );
    },
  },
  {
    field: 'remark',
    label: '备注',
    render(value) {
      return value || '无';
    },
  },
];
