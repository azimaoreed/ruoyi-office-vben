import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getCurrentUserCompanyDeptTree } from '#/utils/dept-tree';

/** 新增/修改的表单 */
export function useFormSchema(
  employeeSelectModalRef?: any,
  readonly?: Ref<boolean>,
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
    // ========== 员工信息 ==========
    // 隐藏员工ID字段，仅用于提交
    {
      fieldName: 'employeeId',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    // 可见字段：员工名称 + 选择弹窗
    {
      fieldName: 'name',
      label: '员工',
      rules: 'required',
      component: 'HelpInput',
      componentProps: {
        placeholder: '请选择员工',
        bind: {
          readonly,
          onClick: () => {
            if (!readonly?.value) {
              employeeSelectModalRef?.value?.modalApi.open();
            }
          },
        },
        onClick: () => {
          if (!readonly?.value) {
            employeeSelectModalRef?.value?.modalApi.open();
          }
        },
      },
    },
    {
      fieldName: 'employeeNo',
      label: '员工工号',
      component: 'Input',
      componentProps: {
        placeholder: '员工工号',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'sex',
      label: '性别',
      component: 'Select',
      componentProps: {
        placeholder: '性别',
        options: getDictOptions(DICT_TYPE.SYSTEM_USER_SEX, 'number'),
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'mobile',
      label: '手机号',
      component: 'Input',
      componentProps: {
        placeholder: '手机号',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'empDeptName',
      label: '所属部门',
      component: 'Input',
      componentProps: {
        placeholder: '所属部门',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'empDeptId',
      label: '部门ID',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'empCompanyName',
      label: '所属公司',
      component: 'Input',
      componentProps: {
        placeholder: '所属公司',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'empCompanyId',
      label: '公司ID',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'jobPost',
      label: '职位',
      component: 'Select',
      componentProps: {
        placeholder: '职位',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POST),
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'jobPosition',
      label: '职务',
      component: 'Select',
      componentProps: {
        placeholder: '职务',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POSITION),
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'employeeStatus',
      label: '当前人员状态',
      component: 'Select',
      componentProps: {
        placeholder: '当前人员状态',
        options: getDictOptions(DICT_TYPE.HRM_EMPLOYEE_STATUS, 'number'),
        readonly: true,
        disabled: true,
      },
    },
    // ========== 调动信息 ==========
    {
      fieldName: 'transferType',
      label: '异动类型',
      rules: 'required',
      component: 'Select',
      componentProps: {
        placeholder: '请选择异动类型',
        options: getDictOptions(DICT_TYPE.HRM_TRANSFER_TYPE),
      },
    },
    {
      fieldName: 'transferReason',
      label: '异动原因',
      component: 'Textarea',
      formItemClass: 'col-span-full',
      componentProps: {
        placeholder: '请输入异动原因',
      },
    },
    {
      fieldName: 'originalJobPost',
      label: '原职位',
      component: 'Select',
      componentProps: {
        placeholder: '原职位',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POST),
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'newJobPost',
      label: '变更为职位',
      component: 'Select',
      componentProps: {
        placeholder: '请选择变更为职位',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POST),
      },
    },
    {
      fieldName: 'originalJobPosition',
      label: '原职务',
      component: 'Select',
      componentProps: {
        placeholder: '原职务',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POSITION),
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'newJobPosition',
      label: '变更为职务',
      component: 'Select',
      componentProps: {
        placeholder: '请选择变更为职务',
        options: getDictOptions(DICT_TYPE.HRM_JOB_POSITION),
      },
    },
    {
      fieldName: 'originalCompanyName',
      label: '原公司',
      component: 'Input',
      componentProps: {
        placeholder: '原公司',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'originalCompanyId',
      label: '原公司ID',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'originalDeptName',
      label: '原部门',
      component: 'Input',
      componentProps: {
        placeholder: '原部门',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'originalDeptId',
      label: '原部门ID',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'newCompanyId',
      label: '变更为公司',
      rules: 'required',
      component: 'ApiTreeSelect',
      componentProps: (_values, formApi) => ({
        allowClear: true,
        api: () => getCurrentUserCompanyDeptTree(true), // true表示包含公司本身
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
        placeholder: '请选择变更为公司',
        treeDefaultExpandAll: true,
        onChange: (_value: any, option: any) => {
          if (option && formApi) {
            // 如果是公司节点，设置公司名称
            if (option.type === 'company') {
              formApi.setFieldValue('newCompanyName', option.name || '');
              formApi.setFieldValue('newDeptId', null);
              formApi.setFieldValue('newDeptName', '');
            }
          }
        },
      }),
    },
    {
      fieldName: 'newCompanyName',
      label: '变更为公司名称',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'newDeptId',
      label: '变更为部门',
      rules: 'required',
      component: 'ApiTreeSelect',
      componentProps: (_values, formApi) => ({
        allowClear: true,
        api: () => getCurrentUserCompanyDeptTree(false), // false表示不包含公司本身
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
        placeholder: '请选择变更为部门',
        treeDefaultExpandAll: true,
        onChange: (_value: any, option: any) => {
          if (option && formApi) {
            formApi.setFieldValue('newDeptName', option.name || '');
            // 如果选择了部门，自动设置部门所属的公司
            if (option.companyId) {
              formApi.setFieldValue('newCompanyId', option.companyId);
              formApi.setFieldValue('newCompanyName', option.companyName || '');
            }
          }
        },
      }),
    },
    {
      fieldName: 'newDeptName',
      label: '变更为部门名称',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'effectiveDate',
      label: '生效日期',
      rules: 'required',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择生效日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
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



