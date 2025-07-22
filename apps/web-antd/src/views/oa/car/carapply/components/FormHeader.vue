<script lang="ts" setup>
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

interface Props {
  formData: Partial<CarApplyBillApi.CarApplyBill> & {
    applicantName?: string;
    applyDate?: string;
    billName?: string;
    billNo?: string;
    companyName?: string;
    createTime?: string;
    deptName?: string;
  };
}

const props = defineProps<Props>();

// 获取状态样式
function getStatusClass(status?: number | string) {
  const statusStr = String(status);
  switch (statusStr) {
    case '0':
    case 'DRAFT': {
      return 'bg-gray-100 text-gray-800';
    }
    case '1':
    case 'RUNNING': {
      return 'bg-blue-100 text-blue-800';
    }
    case '2':
    case 'APPROVED': {
      return 'bg-green-100 text-green-800';
    }
    case '3':
    case 'REJECTED': {
      return 'bg-red-100 text-red-800';
    }
    default: {
      return 'bg-gray-100 text-gray-800';
    }
  }
}

// 获取状态文本
function getStatusText(status?: number | string) {
  const statusStr = String(status);
  switch (statusStr) {
    case '0':
    case 'DRAFT': {
      return '草稿';
    }
    case '1':
    case 'RUNNING': {
      return '审批中';
    }
    case '2':
    case 'APPROVED': {
      return '已审批';
    }
    case '3':
    case 'REJECTED': {
      return '已拒绝';
    }
    default: {
      return '草稿';
    }
  }
}

// 格式化日期时间
function formatDateTime(dateTime?: Date | string) {
  if (!dateTime) return '--';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN');
}
</script>

<template>
  <div class="form-header border-b border-gray-200 bg-white">
    <div class="px-6 py-4">
      <!-- 单据标题行 -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold text-gray-900">
            {{ formData.billName || '预付款申请单' }}
          </h1>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">单据编号:</span>
            <span class="text-sm font-medium text-blue-600">{{
              formData.billNo || 'FY010202:2.00'
            }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div
            class="status-badge relative px-4 py-1 text-xs font-medium"
            :class="getStatusClass(formData.processStatus)"
          >
            <span class="relative z-10">{{
              getStatusText(formData.processStatus)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 基础信息行 -->
      <div class="grid grid-cols-6 gap-4 text-sm">
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">申请人:</span>
          <span class="font-medium">{{
            formData.applicantName || '用户名'
          }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">申请日期:</span>
          <span class="font-medium">{{
            formData.applyDate || '2025-07-17'
          }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">所属公司:</span>
          <span class="font-medium">{{
            formData.companyName || '石家庄耀包装制品有限公司'
          }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">所属部门:</span>
          <span class="font-medium">{{
            formData.deptName || '供应链中心'
          }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">流程编号:</span>
          <span class="font-medium">{{
            formData.processInstanceId || 'AN029625017100017'
          }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">创建时间:</span>
          <span class="font-medium">{{
            formatDateTime(formData.createTime)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-header {
  border-radius: 8px 8px 0 0;
}
</style>
