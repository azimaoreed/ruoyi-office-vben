<script lang="ts" setup>
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { useFormSchema } from '../data';

interface Props {
  formData: Partial<CarApplyBillApi.CarApplyBill>;
  disabled?: boolean;
}

const props = defineProps<Props>();

// const activeTab = ref('bill');
const formRef = ref();

// 创建表单实例
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1', // 每行四列，所以每个表单项占1/4
    labelWidth: 120,
    disabled: props.disabled,
  },
  layout: 'horizontal',
  schema: useFormSchema(null), // 先传入 null，后续更新
  showDefaultActions: false,
  wrapperClass: 'grid-cols-4', // 设置为4列布局
});

// 更新 schema 以传入 formApi
formApi.setState({ schema: useFormSchema(formApi) });

// 监听表单数据变化
watch(
  () => props.formData,
  async (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      await formApi.setValues(newData);
    }
  },
  { immediate: true, deep: true },
);

// 监听disabled状态变化
watch(
  () => props.disabled,
  (disabled) => {
    // 更新所有表单项的disabled状态
    const currentSchema = useFormSchema(formApi);
    const updatedSchema = currentSchema.map((schema) => ({
      ...schema,
      componentProps: {
        ...schema.componentProps,
        disabled: disabled,
      },
    }));
    formApi.updateSchema(updatedSchema);
  },
  { immediate: true },
);

// 暴露方法给父组件
defineExpose({
  async getFormValues() {
    return await formApi.getValues();
  },
  async validateForm() {
    return await formApi.validate();
  },
  async setFormValues(values: any) {
    return await formApi.setValues(values);
  },
  resetForm() {
    // 使用setValues来重置表单
    formApi.setValues({});
  },
});
</script>

<template>
  <div class="form-content flex h-full flex-col bg-white">
    <!-- <Tabs v-model:active-key="activeTab" class="flex flex-1 flex-col px-6 pt-4">
      <TabPane key="bill" tab="单据信息" class="h-full"> -->
    <div class="h-full overflow-auto pb-6">
      <Form ref="formRef" />
    </div>
    <!-- </TabPane> -->
    <!-- <TabPane key="approval" tab="审批信息" class="h-full">
        <div class="flex h-full items-center justify-center pb-6">
          <div class="text-center text-gray-500">
            <Icon icon="lucide:clock" class="mb-2 text-2xl" />
            <p>审批信息暂无数据</p>
          </div>
        </div>
      </TabPane> -->
    <!-- </Tabs> -->
  </div>
</template>

<style scoped>
.form-content {
  min-height: 400px;
}

:deep(.ant-tabs-content-holder) {
  padding: 0;
}

:deep(.ant-tabs-tabpane) {
  padding: 0;
}

/* 表单布局优化 */
:deep(.vben-form) {
  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

/* 表单项样式调整 */
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
  text-align: left;
}
</style>
