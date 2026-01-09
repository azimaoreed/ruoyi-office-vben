<script lang="ts" setup>
import type { SystemNoticeApi } from '#/api/system/notice';

import { computed, onMounted, ref } from 'vue';

import { Badge, Empty, Spin } from 'ant-design-vue';

import { getNoticePage } from '#/api/system/notice';
import { router } from '#/router';

import NoticePreviewModal from './notice-preview-modal.vue';

interface Props {
  maxRecordNum?: number; // 最大显示条数
  showBadge?: boolean; // 是否显示徽章
}

const props = withDefaults(defineProps<Props>(), {
  maxRecordNum: 10,
  showBadge: true,
});

const loading = ref(false);
const noticeList = ref<SystemNoticeApi.Notice[]>([]);
const total = ref(0);
const unreadCount = ref(0); // 未读数量（模拟，实际需要后端支持）

// 预览弹窗
const previewVisible = ref(false);
const selectedNotice = ref<null | SystemNoticeApi.Notice>(null);

// 通知类型样式映射
const noticeTypeMap: Record<
  number,
  { color: string; icon: string; text: string }
> = {
  1: { text: '通知', color: '#1890FF', icon: 'carbon:notification' },
  2: { text: '公告', color: '#52C41A', icon: 'carbon:announcement' },
};

// 通知状态样式映射
const noticeStatusMap: Record<number, { color: string; text: string }> = {
  0: { text: '正常', color: '#52C41A' },
  1: { text: '关闭', color: '#D9D9D9' },
};

// 获取通知类型样式
function getNoticeTypeStyle(type: number) {
  return noticeTypeMap[type] || noticeTypeMap[1];
}

// 获取通知状态样式
function getNoticeStatusStyle(status: number) {
  return noticeStatusMap[status] || noticeStatusMap[0];
}

// 格式化日期
function formatDate(date: Date | string | undefined) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }

  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }

  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }

  // 格式化为 MM-DD
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

// 加载通知公告列表
async function loadNoticeList() {
  loading.value = true;
  try {
    const response = await getNoticePage({
      pageNo: 1,
      pageSize: props.maxRecordNum,
    });
    noticeList.value = response.list || [];
    total.value = response.total || 0;
    // 模拟未读数量（实际应该从后端获取）
    unreadCount.value = Math.min(response.total || 0, 5);
  } catch (error) {
    console.error('加载通知公告失败:', error);
    noticeList.value = [];
  } finally {
    loading.value = false;
  }
}

// 查看通知详情
function handleViewNotice(notice: SystemNoticeApi.Notice) {
  selectedNotice.value = notice;
  previewVisible.value = true;
}

// 跳转到完整列表
function handleViewMore() {
  router.push({ name: 'SystemNotice' });
}

// 关闭预览弹窗
function handleClosePreview() {
  previewVisible.value = false;
  selectedNotice.value = null;
}

// 显示徽章数量
const badgeCount = computed(() => {
  if (!props.showBadge) return 0;
  return unreadCount.value;
});

// 组件挂载时加载数据
onMounted(() => {
  loadNoticeList();
});
</script>

<template>
  <div class="workbench-notice rounded-lg bg-background">
    <!-- 头部 -->
    <div class="notice-header flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-semibold">通知公告</h3>
        <Badge v-if="showBadge" :count="badgeCount" :overflow-count="99" />
      </div>
      <a
        class="cursor-pointer text-sm text-primary hover:underline"
        @click="handleViewMore"
      >
        查看更多
      </a>
    </div>

    <!-- 列表内容 -->
    <div class="notice-list">
      <Spin :spinning="loading">
        <div v-if="noticeList.length > 0" class="divide-y">
          <div
            v-for="notice in noticeList"
            :key="notice.id"
            class="notice-item cursor-pointer px-4 py-3 transition-colors hover:bg-gray-50"
            @click="handleViewNotice(notice)"
          >
            <div class="flex items-start gap-3">
              <!-- 图标 -->
              <div
                class="notice-icon flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                :style="{
                  backgroundColor: `${getNoticeTypeStyle(notice.type).color}15`,
                }"
              >
                <iconify-icon
                  :icon="getNoticeTypeStyle(notice.type).icon"
                  class="text-xl"
                  :style="{ color: getNoticeTypeStyle(notice.type).color }"
                />
              </div>

              <!-- 内容 -->
              <div class="flex-1 overflow-hidden">
                <div class="mb-1 flex items-center gap-2">
                  <h4 class="flex-1 truncate text-sm font-medium text-gray-900">
                    {{ notice.title }}
                  </h4>
                  <span
                    class="text-xs"
                    :style="{
                      color: getNoticeStatusStyle(notice.status).color,
                    }"
                  >
                    {{ getNoticeStatusStyle(notice.status).text }}
                  </span>
                </div>
                <div class="mb-1 line-clamp-2 text-xs text-gray-500">
                  {{ notice.content || '暂无内容' }}
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <span>{{ formatDate(notice.createTime) }}</span>
                  <span v-if="notice.creator">{{ notice.creator }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="py-8">
          <Empty
            description="暂无通知公告"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
          />
        </div>
      </Spin>
    </div>

    <!-- 预览弹窗 -->
    <NoticePreviewModal
      v-model:visible="previewVisible"
      :notice="selectedNotice"
      @close="handleClosePreview"
    />
  </div>
</template>

<style scoped>
.workbench-notice {
  box-shadow:
    0 1px 2px 0 rgb(0 0 0 / 3%),
    0 1px 6px -1px rgb(0 0 0 / 2%),
    0 2px 4px 0 rgb(0 0 0 / 2%);
}

.notice-header {
  border-bottom: 1px solid #f0f0f0;
}

.notice-list {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.notice-item:last-child {
  border-bottom: none;
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 滚动条样式 */
.notice-list::-webkit-scrollbar {
  width: 6px;
}

.notice-list::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.notice-list::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}

.notice-list::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
