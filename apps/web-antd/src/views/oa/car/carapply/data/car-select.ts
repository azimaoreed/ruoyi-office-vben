import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { CarApi } from '#/api/oa/car/carinfo';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { $t } from '#/locales';

/** 车辆选择搜索表单配置 */
export function useCarSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'companyName',
      label: '公司名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司名称',
      },
    },
    {
      fieldName: 'carCls',
      label: '车辆分类',
      component: 'Select',
      componentProps: {
        placeholder: '请选择车辆分类',
        options: [
          { label: '轿车', value: 1 },
          { label: 'SUV', value: 2 },
          { label: '商务车', value: 3 },
          { label: '货车', value: 4 },
        ],
      },
    },
    {
      fieldName: 'carName',
      label: '车辆名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入车辆名称',
      },
    },
  ];
}

/** 车辆选择表格列配置 */
export function useCarSelectColumns(): VxeTableGridOptions<CarApi.Car>['columns'] {
  return [
    {
      type: 'radio',
      width: 60,
      align: 'center',
    },
    {
      field: 'carNo',
      title: '车牌号',
      width: 120,
      slots: {
        default: ({ row }: { row: CarApi.Car }) => {
          return h(Tag, { color: 'blue' }, { default: () => row.carNo });
        },
      },
    },
    {
      field: 'carName',
      title: '车辆名称',
      width: 150,
    },
    {
      field: 'brand',
      title: '品牌型号',
      width: 150,
    },
    {
      field: 'carCls',
      title: '车辆分类',
      width: 100,
      slots: {
        default: ({ row }: { row: CarApi.Car }) => {
          const clsMap: Record<number, { text: string; color: string }> = {
            1: { text: '轿车', color: 'blue' },
            2: { text: 'SUV', color: 'green' },
            3: { text: '商务车', color: 'orange' },
            4: { text: '货车', color: 'purple' },
          };
          const cls = clsMap[row.carCls!] || { text: '未知', color: 'default' };
          return h(Tag, { color: cls.color }, { default: () => cls.text });
        },
      },
    },
    {
      field: 'seatNum',
      title: '座位数',
      width: 80,
      align: 'center',
    },
    {
      field: 'companyName',
      title: '所属公司',
      width: 150,
    },
    {
      field: 'status',
      title: '状态',
      width: 80,
      align: 'center',
      slots: {
        default: ({ row }: { row: CarApi.Car }) => {
          const isAvailable = row.status === 1;
          return h(
            Tag,
            { color: isAvailable ? 'green' : 'red' },
            { default: () => (isAvailable ? '可用' : '不可用') }
          );
        },
      },
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 150,
    },
  ];
} 