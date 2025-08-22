import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { createRouterLinkColumn } from '#/adapter/vxe-table';

import {
    DICT_TYPE,
    getRangePickerDefaultProps,
} from '#/utils';

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'billCode',
      label: '单据编号',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入单据编号',
      },
    },
    {
      fieldName: 'processStatus',
      label: '单据状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [],
        placeholder: '请选择单据状态',
      },
    },
    {
      fieldName: 'carId',
      label: '车辆',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [],
        placeholder: '请选择车辆',
      },
    },
    {
      fieldName: 'companyId',
      label: '公司ID',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [],
        placeholder: '请选择公司ID',
      },
    },
    {
      fieldName: 'deptId',
      label: '部门ID',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [],
        placeholder: '请选择部门ID',
      },
    },
    {
      fieldName: 'creatorName',
      label: '创建者姓名',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入创建者姓名',
      },
    },
    {
      fieldName: 'createTime',
      label: '创建时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<CarApplyBillApi.CarApplyBill>['columns'] {
  return [
  { type: 'checkbox', width: 40 },
    createRouterLinkColumn({
      field: 'billCode',
      title: '单据编号',
      path: '/oa/car/car-apply-info',
      idField: 'id',
      queryParam: 'id',
    }),
    {
      field: 'processInstanceId',
      title: '流程实例编号',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'processStatus',
      title: '单据状态',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS },
      },
    },
    {
      field: 'carNo',
      title: '车辆',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'cause',
      title: '用车事由',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'goTime',
      title: '出车时间',
      minWidth: 120,
      formatter: 'formatDateTime',
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'returnTime',
      title: '回车时间',
      minWidth: 120,
      formatter: 'formatDateTime',
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'goArea',
      title: '出车地点',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'returnArea',
      title: '回车地点',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'passenger',
      title: '随行人',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'companyName',
      title: '公司名称',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'deptName',
      title: '部门名称',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'creatorName',
      title: '创建者姓名',
      minWidth: 120,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      formatter: 'formatDateTime',
      headerAlign: 'center',
      align: 'left',
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      headerAlign: 'center',
      slots: { default: 'actions' },
    },
  ];
}

