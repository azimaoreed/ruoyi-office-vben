<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MeetingRoomApi } from '#/api/oa/meetingroom/roominfo';

import { reactive } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMeetingRoomPage } from '#/api/oa/meetingroom/roominfo';

import {
  useMeetingRoomSelectColumns,
  useMeetingRoomSelectFormSchema,
} from './meeting-room-select-data';

/** 定义组件事件 */
const emit = defineEmits<{
  (e: 'select', room: MeetingRoomApi.MeetingRoom): void;
}>();

const formData = reactive({
  selectedRoom: null as MeetingRoomApi.MeetingRoom | null,
});

/** 表格实例 */
const [Grid] = useVbenVxeGrid({
  separator: false,
  formOptions: {
    schema: useMeetingRoomSelectFormSchema(),
    submitOnChange: true,
    collapsed: true,
  },
  gridOptions: {
    columns: useMeetingRoomSelectColumns(),
    height: 440,
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 只查询允许预定的会议室
          const queryParams = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            allowBooking: true,
            ...formValues,
          };
          return await getMeetingRoomPage(queryParams);
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
  } as VxeTableGridOptions<MeetingRoomApi.MeetingRoom>,
  gridEvents: {
    radioChange: ({ row }: { row: MeetingRoomApi.MeetingRoom }) => {
      formData.selectedRoom = row;
    },
    cellDblclick: ({ row }: { row: MeetingRoomApi.MeetingRoom }) => {
      // 双击直接选择
      formData.selectedRoom = row;
      handleConfirm();
    },
  },
});

/** 模态框实例 */
const [Modal, modalApi] = useVbenModal({
  title: '选择会议室',
  class: 'w-3/5 max-w-4xl',
  async onConfirm() {
    return handleConfirm();
  },
});

/** 确认选择 */
async function handleConfirm() {
  if (!formData.selectedRoom) {
    message.error('请选择会议室');
    return false;
  }

  emit('select', formData.selectedRoom);
  formData.selectedRoom = null;
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
