import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { z } from '#/adapter/form';

/** 新增/修改的表单 */
export function useFormSchema(
  deptSelectModalRef?: any,
  readonly?: Ref<boolean>
): VbenFormSchema[] {
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
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    // ========== 员工基本信息 ==========
    {
      fieldName: 'name',
      label: '姓名',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入姓名',
      },
    },
    {
      fieldName: 'sex',
      label: '性别',
      rules: 'required',
      component: 'RadioGroup',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SYSTEM_USER_SEX),
      },
    },
    {
      fieldName: 'birthday',
      label: '出生日期',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择出生日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      fieldName: 'idCard',
      label: '身份证号码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入身份证号码',
      },
    },
    {
      fieldName: 'mobile',
      label: '手机号',
      rules: z
        .string()
        .min(1, '手机号不能为空')
        .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码'),
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
        maxLength: 11,
      },
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      rules: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(val),
          '请输入正确的邮箱地址',
        ),
    },
    {
      fieldName: 'nation',
      label: '民族',
      component: 'Input',
      componentProps: {
        placeholder: '请输入民族',
      },
    },
    {
      fieldName: 'nativePlace',
      label: '籍贯',
      component: 'Input',
      componentProps: {
        placeholder: '请输入籍贯',
      },
    },
    {
      fieldName: 'householdAddress',
      label: '户籍所在地',
      component: 'Input',
      componentProps: {
        placeholder: '请输入户籍所在地',
      },
    },
    {
      fieldName: 'currentAddress',
      label: '现居住地址',
      component: 'Input',
      componentProps: {
        placeholder: '请输入现居住地址',
      },
    },
    {
      fieldName: 'emergencyContact',
      label: '紧急联系人',
      component: 'Input',
      componentProps: {
        placeholder: '请输入紧急联系人',
      },
    },
    {
      fieldName: 'emergencyPhone',
      label: '联系电话',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系电话',
      },
    },
    {
      fieldName: 'avatar',
      label: '照片',
      component: 'ImageUpload',
      componentProps: {
        contentText: '上传员工照片',
        showDescription: false,
        maxNumber: 1,
      },
    },
    // ========== 入职相关信息 ==========
    {
      fieldName: 'entryDate',
      label: '入职日期',
      rules: 'required',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择入职日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      fieldName: 'probationPeriod',
      label: '试用期（月数）',
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入试用期',
        min: 0,
        max: 12,
      },
    },
    {
      fieldName: 'expectedFormalDate',
      label: '预计转正日期',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择预计转正日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      fieldName: 'deptName',
      label: '所属部门',
      rules: 'required',
      component: 'HelpInput',
      componentProps: {
        placeholder: '请选择所属部门',
        bind: {
          readonly,
          onClick: () => {
            if (!readonly?.value && deptSelectModalRef?.value) {
              deptSelectModalRef.value.modalApi.open();
            }
          },
        },
        onClick: () => {
          if (!readonly?.value && deptSelectModalRef?.value) {
            deptSelectModalRef.value.modalApi.open();
          }
        },
      },
    },
    {
      fieldName: 'deptId',
      label: '部门ID',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'jobPosition',
      label: '职务',
      component: 'Select',
      componentProps: {
        placeholder: '请选择职务',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POSITION),
      },
    },
    {
      fieldName: 'jobTitle',
      label: '职称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入职称',
      },
    },
    {
      fieldName: 'employeeStatus',
      label: '人员状态',
      rules: 'required',
      component: 'Select',
      componentProps: {
        placeholder: '请选择人员状态',
        options: getDictOptions(DICT_TYPE.HRM_EMPLOYEE_STATUS),
      },
    },
    {
      fieldName: 'education',
      label: '文化程度',
      component: 'Select',
      componentProps: {
        placeholder: '请选择文化程度',
        options: getDictOptions(DICT_TYPE.HRM_EDUCATION),
      },
    },
    {
      fieldName: 'salary',
      label: '薪资',
      component: 'InputAmount',
      componentProps: {
        placeholder: '请输入薪资',
        showUnit: false,
        precision: 2,
      },
    },
    {
      fieldName: 'bankName',
      label: '工资开户行',
      component: 'Input',
      componentProps: {
        placeholder: '请输入工资开户行',
      },
    },
    {
      fieldName: 'bankAccount',
      label: '工资卡账户',
      component: 'Input',
      componentProps: {
        placeholder: '请输入工资卡账户',
      },
    },
    {
      fieldName: 'companyName',
      label: '所属公司',
      component: 'Input',
      componentProps: {
        placeholder: '所属公司',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      formItemClass: 'col-span-full',
      componentProps: {
        placeholder: '请输入备注',
      },
    },
  ];
}
