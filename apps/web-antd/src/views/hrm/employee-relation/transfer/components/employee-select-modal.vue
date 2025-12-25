<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { EmployeeArchiveApi } from '#/api/hrm/employee';

import { reactive } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  queryEmployeeSelectPage,
  useEmployeeSelectColumns,
  useEmployeeSelectFormSchema,
} from './employee-select-data';

/** 定义组件事件 */
const emit = defineEmits<{
  (e: 'select', employee: EmployeeArchiveApi.EmployeeArchive): void;
}>();

const formData = reactive({
  selectedEmployee: null as EmployeeArchiveApi.EmployeeArchive | null,
});

/** 表格实例 */
const [Grid] = useVbenVxeGrid({
  separator: false,
  formOptions: {
    schema: useEmployeeSelectFormSchema(),
    submitOnChange: true,
    collapsed: true,
  },
  gridOptions: {
    columns: useEmployeeSelectColumns(),
    height: 440,
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await queryEmployeeSelectPage(page, formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    radioConfig: {
      labelField: 'id',
      trigger: 'row',
    },
    pagerConfig: {
      enabled: true,
    },
  } as VxeTableGridOptions<EmployeeArchiveApi.EmployeeArchive>,
  gridEvents: {
    radioChange: ({ row }: { row: EmployeeArchiveApi.EmployeeArchive }) => {
      formData.selectedEmployee = row;
    },
    cellDblclick: ({ row }: { row: EmployeeArchiveApi.EmployeeArchive }) => {
      formData.selectedEmployee = row;
      handleConfirm();
    },
  },
});

/** 模态框实例 */
const [Modal, modalApi] = useVbenModal({
  title: '选择员工',
  class: 'w-3/5 max-w-4xl',
  async onConfirm() {
    return handleConfirm();
  },
});

/** 确认选择 */
async function handleConfirm() {
  if (!formData.selectedEmployee) {
    message.error('请选择员工');
    return false;
  }

  emit('select', formData.selectedEmployee);
  formData.selectedEmployee = null;
  await modalApi.close();
  return true;
}

/** 暴露modal API供外部调用 */
defineExpose({
  modalApi,
});
</script>

<template>
  <Modal>
    <Grid />
  </Modal>
</template>



