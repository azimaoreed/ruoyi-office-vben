import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EmployeeArchiveApi } from '#/api/hrm/employee';

import dayjs from 'dayjs';

import { handleTree } from '@vben/utils';

import { getEmployeeArchiveSelectPage } from '#/api/hrm/employee';
import { getDeptList } from '#/api/system/dept';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

/** 选择弹窗 - 搜索条件 */
export function useEmployeeSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'deptId',
      label: '所属部门',
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        placeholder: '请选择所属部门',
        api: async () => {
          const data = await getDeptList();
          return handleTree(data, 'id');
        },
        fieldNames: {
          label: 'name',
          value: 'id',
        },
      },
    },
    {
      fieldName: 'employeeNo',
      label: '员工工号',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入员工工号',
      },
    },
    {
      fieldName: 'name',
      label: '员工姓名',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入员工姓名',
      },
    },
    {
      fieldName: 'employeeStatus',
      label: '人员状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.HRM_EMPLOYEE_STATUS, 'number').filter(
          (item) => item.value !== 1,
        ),
        placeholder: '请选择人员状态（已过滤正式员工）',
      },
    },
    {
      fieldName: 'jobPost',
      label: '职位',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.HRM_JOB_POST),
        placeholder: '请选择职位',
      },
    },
    {
      fieldName: 'jobPosition',
      label: '职务',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.HRM_JOB_POSITION),
        placeholder: '请选择职务',
      },
    },
  ];
}

/** 选择弹窗 - 表格列 */
export function useEmployeeSelectColumns(): VxeGridProps['columns'] {
  return [
    {
      type: 'radio',
      width: 60,
      align: 'center',
    },
    {
      title: '员工工号',
      field: 'employeeNo',
      width: 120,
    },
    {
      title: '员工姓名',
      field: 'name',
      width: 120,
    },
    {
      title: '人员状态',
      field: 'employeeStatus',
      width: 110,
      cellRender: {
        name: 'CellDict',
        props: {
          type: DICT_TYPE.HRM_EMPLOYEE_STATUS,
        },
      },
    },
    {
      title: '所属部门',
      field: 'deptName',
      width: 160,
    },
    {
      title: '所属单位',
      field: 'companyName',
      width: 200,
    },
    {
      title: '职位',
      field: 'jobPost',
      width: 140,
      cellRender: {
        name: 'CellDict',
        props: {
          type: DICT_TYPE.HRM_JOB_POST,
        },
      },
    },
    {
      title: '职务',
      field: 'jobPosition',
      width: 140,
      cellRender: {
        name: 'CellDict',
        props: {
          type: DICT_TYPE.HRM_JOB_POSITION,
        },
      },
    },
    {
      title: '入职日期',
      field: 'entryDate',
      width: 130,
      formatter: ({ cellValue }) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '',
    },
    {
      title: '转正日期',
      field: 'formalDate',
      width: 130,
      formatter: ({ cellValue }) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '',
    },
  ];
}

/** 选择弹窗 - 查询方法 */
export async function queryEmployeeSelectPage(
  page: { currentPage: number; pageSize: number },
  formValues: Record<string, any>,
) {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    ...formValues,
    // 默认排除正式员工（1），如有需要可在 formValues 中覆盖
    excludeEmployeeStatusList: [1],
  } as EmployeeArchiveApi.EmployeeArchiveSelectReqVO;
  return await getEmployeeArchiveSelectPage(queryParams);
}

