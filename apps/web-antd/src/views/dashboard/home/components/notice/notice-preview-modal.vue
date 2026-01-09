<script lang="ts" setup>
import type { SystemNoticeApi } from '#/api/system/notice';

import { computed } from 'vue';

import { Modal, Tag } from 'ant-design-vue';

interface Props {
  visible: boolean;
  notice: null | SystemNoticeApi.Notice;
}

interface Emits {
  (e: 'close'): void;
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 通知类型样式映射
const noticeTypeMap: Record<number, { color: string; text: string }> = {
  1: { text: '通知', color: 'blue' },
  2: { text: '公告', color: 'green' },
};

// 通知状态样式映射
const noticeStatusMap: Record<number, { color: string; text: string }> = {
  0: { text: '正常', color: 'success' },
  1: { text: '关闭', color: 'default' },
};

// 获取通知类型样式
function getNoticeTypeStyle(type: number) {
  return noticeTypeMap[type] || noticeTypeMap[1];
}

// 获取通知状态样式
function getNoticeStatusStyle(status: number) {
  return noticeStatusMap[status] || noticeStatusMap[0];
}

// 格式化日期时间
function formatDateTime(date: Date | string | undefined) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 处理关闭
function handleClose() {
  emit('update:visible', false);
  emit('close');
}

// 弹窗标题
const modalTitle = computed(() => {
  if (!props.notice) return '通知详情';
  const typeStyle = getNoticeTypeStyle(props.notice.type);
  return `${typeStyle.text}详情`;
});
</script>

<template>
  <Modal
    :open="visible"
    :title="modalTitle"
    width="600px"
    :footer="null"
    @cancel="handleClose"
  >
    <div v-if="notice" class="notice-preview">
      <!-- 标题 -->
      <div class="mb-4">
        <h2 class="mb-2 text-xl font-semibold">{{ notice.title }}</h2>
        <div class="flex items-center gap-2">
          <Tag :color="getNoticeTypeStyle(notice.type).color">
            {{ getNoticeTypeStyle(notice.type).text }}
          </Tag>
          <Tag :color="getNoticeStatusStyle(notice.status).color">
            {{ getNoticeStatusStyle(notice.status).text }}
          </Tag>
        </div>
      </div>

      <!-- 元信息 -->
      <div class="mb-4 rounded-lg bg-gray-50 p-3">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center gap-2 text-gray-600">
            <iconify-icon icon="carbon:user" class="text-base" />
            <span>发布人:</span>
            <span class="text-gray-900">{{ notice.creator || '-' }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <iconify-icon icon="carbon:time" class="text-base" />
            <span>发布时间:</span>
            <span class="text-gray-900">{{
              formatDateTime(notice.createTime)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 内容 -->
      <div class="notice-content mb-4">
        <h3 class="mb-2 text-sm font-medium text-gray-700">通知内容</h3>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          class="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900"
          v-html="notice.content || '暂无内容'"
        ></div>
      </div>

      <!-- 备注 -->
      <div v-if="notice.remark" class="notice-remark">
        <h3 class="mb-2 text-sm font-medium text-gray-700">备注</h3>
        <div class="text-sm text-gray-600">{{ notice.remark }}</div>
      </div>
    </div>

    <div v-else class="py-8 text-center text-gray-400">暂无数据</div>
  </Modal>
</template>

<style scoped>
.notice-content :deep(p) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.notice-content :deep(p:last-child) {
  margin-bottom: 0;
}

.notice-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.notice-content :deep(a) {
  color: #1890ff;
  text-decoration: underline;
}

.notice-content :deep(ul),
.notice-content :deep(ol) {
  margin-bottom: 0.5rem;
  margin-left: 1.5rem;
}

.notice-content :deep(li) {
  margin-bottom: 0.25rem;
}
</style>
