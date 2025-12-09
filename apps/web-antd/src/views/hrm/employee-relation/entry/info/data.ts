import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { EmployeeEntryBillApi } from '#/api/hrm/employee-entry';

import { h } from 'vue';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { Button, DatePicker, Input } from 'ant-design-vue';
import dayjs from 'dayjs';

import { z } from '#/adapter/form';

/** 新增/修改的表单 */
export function useFormSchema(
  deptSelectModalRef?: any,
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
    // ========== 入职相关信息（员工所属的组织信息） ==========
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
      fieldName: 'empDeptName',
      label: '员工所属部门',
      rules: 'required',
      component: 'HelpInput',
      componentProps: {
        placeholder: '请选择员工所属部门',
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
      fieldName: 'empDeptId',
      label: '员工所属部门ID',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'empCompanyName',
      label: '员工所属公司',
      component: 'Input',
      componentProps: {
        placeholder: '员工所属公司',
        readonly: true,
        disabled: true,
      },
    },
    {
      fieldName: 'empCompanyId',
      label: '员工所属公司ID',
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

/**
 * 工作经历表格列定义
 */
export function useWorkExperienceColumns(
  readonly: Ref<boolean>,
  workExperienceList: Ref<EmployeeEntryBillApi.EmployeeWorkExperience[]>,
  handleDelete: (index: number) => void,
) {
  return [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(DatePicker, {
          value: text ? dayjs(text) : null,
          format: 'YYYY-MM-DD',
          placeholder: '请选择开始时间',
          style: { width: '100%' },
          onChange: (date: any) => {
            if (workExperienceList.value[index]) {
              workExperienceList.value[index].startTime = date
                ? dayjs(date).format('YYYY-MM-DD')
                : undefined;
            }
          },
        } as any);
      },
    },
    {
      title: '截止时间',
      dataIndex: 'endTime',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(DatePicker, {
          value: text ? dayjs(text) : null,
          format: 'YYYY-MM-DD',
          placeholder: '请选择截止时间',
          style: { width: '100%' },
          onChange: (date: any) => {
            if (workExperienceList.value[index]) {
              workExperienceList.value[index].endTime = date
                ? dayjs(date).format('YYYY-MM-DD')
                : undefined;
            }
          },
        } as any);
      },
    },
    {
      title: '职务',
      dataIndex: 'jobPosition',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入职务',
          onChange: (e: any) => {
            if (workExperienceList.value[index]) {
              workExperienceList.value[index].jobPosition = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '单位名称',
      dataIndex: 'companyName',
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入单位名称',
          onChange: (e: any) => {
            if (workExperienceList.value[index]) {
              workExperienceList.value[index].companyName = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      customRender: ({ index }: any) => {
        if (readonly.value) return '-';
        return h(
          Button,
          {
            type: 'link',
            size: 'small',
            danger: true,
            onClick: () => handleDelete(index),
          },
          () => '删除',
        );
      },
    },
  ];
}

/**
 * 教育经历表格列定义
 */
export function useEducationColumns(
  readonly: Ref<boolean>,
  educationList: Ref<EmployeeEntryBillApi.EmployeeEducation[]>,
  handleDelete: (index: number) => void,
) {
  return [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(DatePicker, {
          value: text ? dayjs(text) : null,
          format: 'YYYY-MM-DD',
          placeholder: '请选择开始时间',
          style: { width: '100%' },
          onChange: (date: any) => {
            if (educationList.value[index]) {
              educationList.value[index].startTime = date
                ? dayjs(date).format('YYYY-MM-DD')
                : undefined;
            }
          },
        } as any);
      },
    },
    {
      title: '截止时间',
      dataIndex: 'endTime',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(DatePicker, {
          value: text ? dayjs(text) : null,
          format: 'YYYY-MM-DD',
          placeholder: '请选择截止时间',
          style: { width: '100%' },
          onChange: (date: any) => {
            if (educationList.value[index]) {
              educationList.value[index].endTime = date
                ? dayjs(date).format('YYYY-MM-DD')
                : undefined;
            }
          },
        } as any);
      },
    },
    {
      title: '专业',
      dataIndex: 'major',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入专业',
          onChange: (e: any) => {
            if (educationList.value[index]) {
              educationList.value[index].major = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '学校名称',
      dataIndex: 'schoolName',
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入学校名称',
          onChange: (e: any) => {
            if (educationList.value[index]) {
              educationList.value[index].schoolName = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      customRender: ({ index }: any) => {
        if (readonly.value) return '-';
        return h(
          Button,
          {
            type: 'link',
            size: 'small',
            danger: true,
            onClick: () => handleDelete(index),
          },
          () => '删除',
        );
      },
    },
  ];
}

/**
 * 家属信息表格列定义
 */
export function useFamilyColumns(
  readonly: Ref<boolean>,
  familyList: Ref<EmployeeEntryBillApi.EmployeeFamily[]>,
  handleDelete: (index: number) => void,
) {
  return [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入姓名',
          onChange: (e: any) => {
            if (familyList.value[index]) {
              familyList.value[index].name = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '关系',
      dataIndex: 'relationship',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入关系',
          onChange: (e: any) => {
            if (familyList.value[index]) {
              familyList.value[index].relationship = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '联系电话',
      dataIndex: 'mobile',
      width: 150,
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入联系电话',
          onChange: (e: any) => {
            if (familyList.value[index]) {
              familyList.value[index].mobile = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '工作单位',
      dataIndex: 'workUnit',
      customRender: ({ text, index }: any) => {
        if (readonly.value) return text || '-';
        return h(Input, {
          value: text,
          placeholder: '请输入工作单位',
          onChange: (e: any) => {
            if (familyList.value[index]) {
              familyList.value[index].workUnit = e.target.value;
            }
          },
        } as any);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      customRender: ({ index }: any) => {
        if (readonly.value) return '-';
        return h(
          Button,
          {
            type: 'link',
            size: 'small',
            danger: true,
            onClick: () => handleDelete(index),
          },
          () => '删除',
        );
      },
    },
  ];
}
