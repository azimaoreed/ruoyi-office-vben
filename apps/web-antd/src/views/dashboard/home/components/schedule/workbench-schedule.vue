<script lang="ts" setup>
import type { Dayjs } from 'dayjs';
import type { SystemScheduleApi } from '#/api/system/schedule';

import { computed, onMounted, ref } from 'vue';

import { Calendar, Empty, Spin } from 'ant-design-vue';
import dayjs from 'dayjs';

import { DICT_TYPE } from '@vben/constants';
import { getDictLabel } from '@vben/hooks';

import { getScheduleDates, getScheduleListByDate } from '#/api/system/schedule';
import { router } from '#/router';

interface Props {
  title?: string; // 标题
  maxRecordNum?: number; // 最大显示条数
}

const props = withDefaults(defineProps<Props>(), {
  title: '日程待办',
  maxRecordNum: 10,
});

const loading = ref(false);
const selectedDate = ref<Dayjs>(dayjs());
const scheduleDates = ref<string[]>([]); // 有日程的日期列表
const selectedDateSchedules = ref<SystemScheduleApi.Schedule[]>([]); // 选中日期的日程列表

// 当前月份的开始和结束日期
const currentMonth = ref<Dayjs>(dayjs());
const monthStart = computed(() => currentMonth.value.startOf('month'));
const monthEnd = computed(() => currentMonth.value.endOf('month'));

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Dayjs | string): string {
  if (typeof date === 'string') return date;
  return date.format('YYYY-MM-DD');
}

// 检查日期是否有日程
function hasSchedule(date: Dayjs): boolean {
  const dateStr = formatDate(date);
  return scheduleDates.value.includes(dateStr);
}

// 日期选择处理
async function handleDateSelect(date: Dayjs) {
  selectedDate.value = date;
  await loadScheduleListByDate(date);
}

// 月份变化处理
async function handlePanelChange(date: Dayjs) {
  currentMonth.value = date;
  await loadScheduleDates();
}

// 加载有日程的日期列表
async function loadScheduleDates() {
  try {
    const startDate = formatDate(monthStart.value);
    const endDate = formatDate(monthEnd.value);
    const response = await getScheduleDates(startDate, endDate);
    scheduleDates.value = response || [];
  } catch (error) {
    console.error('加载日程日期失败:', error);
    scheduleDates.value = [];
  }
}

// 根据日期加载日程列表
async function loadScheduleListByDate(date: Dayjs) {
  loading.value = true;
  try {
    const dateStr = formatDate(date);
    const response = await getScheduleListByDate({ scheduleDate: dateStr });
    selectedDateSchedules.value = (response || []).slice(0, props.maxRecordNum);
  } catch (error) {
    console.error('加载日程列表失败:', error);
    selectedDateSchedules.value = [];
  } finally {
    loading.value = false;
  }
}

// 格式化时间
function formatTime(time?: string): string {
  if (!time) return '';
  return time.substring(0, 5); // HH:mm
}

// 获取日程类型文本
function getScheduleTypeText(type?: string): string {
  if (!type) return '';
  return getDictLabel(DICT_TYPE.SCHEDULE_TYPE, type) || type;
}

// 获取日程分类文本
function getScheduleCategoryText(category?: string): string {
  if (!category) return '';
  return getDictLabel(DICT_TYPE.SCHEDULE_CATEGORY, category) || category;
}

// 跳转到全部日程
function handleViewAll() {
  router.push({ name: 'ScheduleList' });
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadScheduleDates();
  await loadScheduleListByDate(selectedDate.value);
});
</script>

<template>
  <div class="workbench-schedule rounded-lg bg-background">
    <!-- 头部 -->
    <div class="schedule-header flex items-center justify-between px-4 py-3">
      <h3 class="text-base font-semibold">{{ props.title }}</h3>
      <a
        class="cursor-pointer text-sm text-primary hover:underline"
        @click="handleViewAll"
      >
        全部日程 >
      </a>
    </div>

    <!-- 日历 -->
    <div class="schedule-calendar px-4 pb-4">
      <Calendar
        v-model:value="selectedDate"
        @select="handleDateSelect"
        @panel-change="handlePanelChange"
      >
        <template #dateCellRender="{ current: date }">
          <div v-if="hasSchedule(date)" class="schedule-date-cell">
            <div class="schedule-dot"></div>
          </div>
        </template>
      </Calendar>
    </div>

    <!-- 选中日期的日程列表 -->
    <div v-if="selectedDateSchedules.length > 0" class="schedule-list border-t px-4 py-3">
      <Spin :spinning="loading">
        <div class="space-y-2">
          <div
            v-for="schedule in selectedDateSchedules"
            :key="schedule.id"
            class="schedule-item flex items-start gap-2 rounded p-2 transition-colors hover:bg-gray-50"
          >
            <!-- 时间 -->
            <div class="schedule-time flex-shrink-0 text-xs text-gray-500">
              <div v-if="schedule.startTime">
                {{ formatTime(schedule.startTime) }}
                <span v-if="schedule.endTime">
                  - {{ formatTime(schedule.endTime) }}
                </span>
              </div>
            </div>

            <!-- 内容 -->
            <div class="schedule-content flex-1">
              <div class="schedule-title text-sm font-medium text-gray-900">
                {{ schedule.title }}
              </div>
              <div v-if="schedule.content" class="schedule-desc mt-1 text-xs text-gray-500">
                {{ schedule.content }}
              </div>
              <div class="schedule-meta mt-1 flex items-center gap-2 text-xs text-gray-400">
                <span v-if="schedule.scheduleType">
                  {{ getScheduleTypeText(schedule.scheduleType) }}
                </span>
                <span v-if="schedule.scheduleCategory">
                  {{ getScheduleCategoryText(schedule.scheduleCategory) }}
                </span>
                <span v-if="schedule.creatorName">
                  {{ schedule.creatorName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="!loading"
      class="schedule-empty border-t px-4 py-8"
    >
      <Empty
        description="该日期暂无日程"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
      />
    </div>
  </div>
</template>

<style scoped>
.workbench-schedule {
  box-shadow:
    0 1px 2px 0 rgb(0 0 0 / 3%),
    0 1px 6px -1px rgb(0 0 0 / 2%),
    0 2px 4px 0 rgb(0 0 0 / 2%);
}

.schedule-header {
  border-bottom: 1px solid #f0f0f0;
}

.schedule-calendar :deep(.ant-picker-calendar) {
  background: transparent;
}

.schedule-calendar :deep(.ant-picker-calendar-header) {
  padding: 8px 0;
}

.schedule-date-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.schedule-dot {
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 6px;
  height: 6px;
  background-color: #ff4d4f;
  border-radius: 50%;
  transform: translateX(-50%);
}

.schedule-list {
  max-height: 300px;
  overflow-y: auto;
}

.schedule-item {
  cursor: pointer;
}

/* 滚动条样式 */
.schedule-list::-webkit-scrollbar {
  width: 6px;
}

.schedule-list::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.schedule-list::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}

.schedule-list::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>

