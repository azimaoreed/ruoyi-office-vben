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
      return 'status-draft';
    }
    case '1':
    case 'RUNNING': {
      return 'status-running';
    }
    case '2':
    case 'APPROVED': {
      return 'status-approved';
    }
    case '3':
    case 'REJECTED': {
      return 'status-rejected';
    }
    default: {
      return 'status-draft';
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
            <div class="status-badge-bg"></div>
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
  border-radius: 12px 12px 0 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* 斜梯形状态徽章 */
.status-badge {
  min-width: 90px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-left: 10px;
  overflow: hidden;
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status-badge-bg {
  position: absolute;
  top: 0;
  left: -8px;
  right: -8px;
  bottom: 0;
  transform: skewX(-15deg);
  z-index: 1;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 草稿状态 */
.status-badge.status-draft .status-badge-bg {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}
.status-badge.status-draft {
  color: white;
}

/* 审批中状态 */
.status-badge.status-running .status-badge-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}
.status-badge.status-running {
  color: white;
}

/* 已审批状态 */
.status-badge.status-approved .status-badge-bg {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.status-badge.status-approved {
  color: white;
}

/* 已拒绝状态 */
.status-badge.status-rejected .status-badge-bg {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
.status-badge.status-rejected {
  color: white;
}

/* 标题样式优化 */
.form-header h1 {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 信息网格优化 */
.form-header .grid {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
  backdrop-filter: blur(10px);
}
</style>
