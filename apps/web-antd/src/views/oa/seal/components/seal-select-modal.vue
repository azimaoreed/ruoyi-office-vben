<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SealApi } from '#/api/oa/seal/sealinfo';

import { reactive } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSealPage } from '#/api/oa/seal/sealinfo';

import { useSealSelectColumns, useSealSelectFormSchema } from './seal-select-data';

/** 定义组件事件 */
const emit = defineEmits<{
  (e: 'select', seal: SealApi.Seal): void;
}>();

const formData = reactive({
  selectedSeal: null as SealApi.Seal | null,
});

/** 表格实例 */
const [Grid, gridApi] = useVbenVxeGrid({
  separator: false,
  formOptions: {
    schema: useSealSelectFormSchema(),
    submitOnChange: true,
    collapsed: true,
  },
  gridOptions: {
    columns: useSealSelectColumns(),
    height: 440,
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 合并分类筛选条件
          const queryParams = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            status: 0, // 只显示在库状态的印章
            ...formValues,
          };
          return await getSealPage(queryParams);
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
  } as VxeTableGridOptions<SealApi.Seal>,
});

/** 模态框实例 */
const [Modal, modalApi] = useVbenModal({
  title: '选择印章',
  class: 'w-3/5 max-w-4xl',
  onConfirm: () => {
    const selectedRows = gridApi.grid.getRadioRecord();
    if (!selectedRows) {
      message.warning('请选择一个印章');
      return false;
    }
    formData.selectedSeal = selectedRows;
    emit('select', selectedRows);
    return true;
  },
});

/** 暴露模态框API */
defineExpose({
  modalApi,
});
</script>

<template>
  <Modal>
    <Grid />
  </Modal>
</template>
