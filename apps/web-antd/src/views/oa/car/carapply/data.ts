import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { z } from '#/adapter/form';
import {
    getDictOptions,
    getRangePickerDefaultProps,
} from '#/utils';

/** 新增/修改的表单 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'billCode',
      label: '单据编号',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入单据编号',
      },
    },
    {
      fieldName: 'processInstanceId',
      label: '流程实例编号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入流程实例编号',
      },
    },
    {
      fieldName: 'processStatus',
      label: '单据状态',
      component: 'RadioGroup',
      componentProps: {
        options: [],
        buttonStyle: 'solid',
        optionType: 'button',
      },
    },
    {
      fieldName: 'carId',
      label: '车辆',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择车辆',
      },
    },
    {
      fieldName: 'goTime',
      label: '出车时间',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
      },
    },
    {
      fieldName: 'returnTime',
      label: '回车时间',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
      },
    },
    {
      fieldName: 'goArea',
      label: '出车地点',
      component: 'Input',
      componentProps: {
        placeholder: '请输入出车地点',
      },
    },
    {
      fieldName: 'returnArea',
      label: '回车地点',
      component: 'Input',
      componentProps: {
        placeholder: '请输入回车地点',
      },
    },
    {
      fieldName: 'cause',
      label: '用车事由',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入用车事由',
      },
    },
    {
      fieldName: 'applyer',
      label: '申请人',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择申请人',
      },
    },
    {
      fieldName: 'passenger',
      label: '随行人',
      component: 'Input',
      componentProps: {
        placeholder: '请输入随行人',
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Input',
      componentProps: {
        placeholder: '请输入备注',
      },
    },
    {
      fieldName: 'creatorName',
      label: '创建者姓名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入创建者姓名',
      },
    },
    {
      fieldName: 'deptId',
      label: '部门ID',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择部门ID',
      },
    },
    {
      fieldName: 'deptName',
      label: '部门名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入部门名称',
      },
    },
    {
      fieldName: 'companyId',
      label: '公司ID',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择公司ID',
      },
    },
    {
      fieldName: 'companyName',
      label: '公司名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司名称',
      },
    },
  ];
}

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
      fieldName: 'applyer',
      label: '申请人',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [],
        placeholder: '请选择申请人',
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
    {
      field: 'billCode',
      title: '单据编号',
      minWidth: 120,
    },
    {
      field: 'processInstanceId',
      title: '流程实例编号',
      minWidth: 120,
    },
    {
      field: 'processStatus',
      title: '单据状态',
      minWidth: 120,
    },
    {
      field: 'carId',
      title: '车辆',
      minWidth: 120,
    },
    {
      field: 'applyer',
      title: '申请人',
      minWidth: 120,
    },
    {
      field: 'cause',
      title: '用车事由',
      minWidth: 120,
    },
    {
      field: 'goTime',
      title: '出车时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },
    {
      field: 'returnTime',
      title: '回车时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },
    {
      field: 'goArea',
      title: '出车地点',
      minWidth: 120,
    },
    {
      field: 'returnArea',
      title: '回车地点',
      minWidth: 120,
    },
    {
      field: 'passenger',
      title: '随行人',
      minWidth: 120,
    },
    {
      field: 'companyName',
      title: '公司名称',
      minWidth: 120,
    },
    {
      field: 'deptName',
      title: '部门名称',
      minWidth: 120,
    },
    {
      field: 'creatorName',
      title: '创建者姓名',
      minWidth: 120,
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },




    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}

