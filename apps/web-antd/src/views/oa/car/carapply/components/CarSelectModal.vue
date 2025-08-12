<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CarApi } from '#/api/oa/car/carinfo';

import { reactive } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCarPage } from '#/api/oa/car/carinfo';
import { $t } from '#/locales';

import { useCarSelectColumns, useCarSelectFormSchema } from '../data/car-select';

/** 定义组件事件 */
const emit = defineEmits<{
  (e: 'select', car: CarApi.Car): void;
}>();

const formData = reactive({
  selectedCar: null as CarApi.Car | null,
});

/** 表格实例 */
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useCarSelectFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useCarSelectColumns(),
    height: 500,
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const params = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            companyName: formValues.companyName,
            carCls: formValues.carCls,
            carName: formValues.carName,
          };
          
          const result = await getCarPage(params);
          return {
            result: result.list || [],
            page: {
              total: result.total || 0,
            },
          };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      enabled: false,
    },
    radioConfig: {
      highlight: true,
    },
    pagerConfig: {
      enabled: true,
    },
  } as VxeTableGridOptions<CarApi.Car>,
  gridEvents: {
    radioChange: ({ row }: { row: CarApi.Car }) => {
      formData.selectedCar = row;
    },
    cellDblclick: ({ row }: { row: CarApi.Car }) => {
      // 双击直接选择
      formData.selectedCar = row;
      handleConfirm();
    },
  },
});

/** 模态框实例 */
const [Modal, modalApi] = useVbenModal({
  title: '选择车辆',
  class: 'w-4/5 max-w-6xl',
  async onConfirm() {
    return handleConfirm();
  },
});

/** 确认选择 */
async function handleConfirm() {
  if (!formData.selectedCar) {
    message.error('请选择车辆');
    return false;
  }
  
  emit('select', formData.selectedCar);
  formData.selectedCar = null;
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