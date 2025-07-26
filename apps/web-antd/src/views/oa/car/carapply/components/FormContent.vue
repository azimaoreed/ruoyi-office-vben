<script lang="ts" setup>
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { ref, watch } from 'vue';

import { TabPane, Tabs } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { useFormSchema } from '../data';

interface Props {
  formData: Partial<CarApplyBillApi.CarApplyBill>;
  disabled?: boolean;
}

const props = defineProps<Props>();

const activeTab = ref('bill');
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
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-4', // 设置为4列布局
});

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
    // 通过重新设置commonConfig来更新disabled状态
    // updateSchema方法暂不支持componentProps，使用其他方式处理
  },
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
  <div class="form-content flex h-full flex-col">
    <Tabs v-model:active-key="activeTab" class="flex flex-1 flex-col px-6 pt-4">
      <TabPane key="bill" tab="单据信息" class="h-full">
        <div class="h-full overflow-auto pb-6">
          <div class="form-container">
            <Form ref="formRef" />
          </div>
        </div>
      </TabPane>
      <TabPane key="approval" tab="审批信息" class="h-full">
        <div class="flex h-full items-center justify-center pb-6">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3 class="empty-title">审批信息</h3>
            <p class="empty-desc">暂无审批记录</p>
          </div>
        </div>
      </TabPane>
    </Tabs>
  </div>
</template>

<style scoped>
.form-content {
  min-height: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

/* Tab样式优化 */
:deep(.ant-tabs-nav) {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.ant-tabs-tab) {
  border-radius: 6px;
  margin-right: 4px;
  transition: all 0.3s ease;
}

:deep(.ant-tabs-tab:hover) {
  background: rgba(59, 130, 246, 0.1);
}

:deep(.ant-tabs-tab-active) {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
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
    gap: 20px;
  }
}

/* 表单项样式调整 */
:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item-label) {
  font-weight: 600;
  text-align: left;
  color: #374151;
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-picker) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.ant-input:focus),
:deep(.ant-select-focused .ant-select-selector),
:deep(.ant-picker-focused) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-desc {
  color: #6b7280;
  font-size: 14px;
}
</style>
