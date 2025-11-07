<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AttachmentApi } from '#/api/oa/attachment';

import { computed, nextTick, ref, watch } from 'vue';
import { Upload, Button, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { UploadProps } from 'ant-design-vue';
import { TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';

import { 
  createAttachment, 
  useAttachmentActions, 
  useAttachmentColumns 
} from './data';

interface Props {
  /** 附件列表 */
  modelValue?: AttachmentApi.AttachmentSaveReq[];
  /** 是否只读 */
  readonly?: boolean;
  /** 最大文件数量 */
  maxCount?: number;
  /** 允许的文件类型 */
  accept?: string;
  /** 最大文件大小（MB） */
  maxSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  readonly: false,
  maxCount: 10,
  accept: '*',
  maxSize: 10,
});

const emit = defineEmits<{
  'update:modelValue': [value: AttachmentApi.AttachmentSaveReq[]];
}>();

/** 表格内部数据 */
const tableData = ref<AttachmentApi.AttachmentSaveReq[]>([]);

/** 添加附件 */
function handleAdd(file: File) {
  const attachment = createAttachment(file, tableData.value.length + 1);
  tableData.value.push(attachment);
  handleUpdateValue();
  message.success('文件上传成功');
}

/** 删除附件 */
function handleDelete(row: AttachmentApi.AttachmentSaveReq) {
  const index = tableData.value.findIndex(
    (item) => (item.id && item.id === row.id) || 
              (item.fileName === row.fileName && item.uploadTime === row.uploadTime)
  );
  if (index > -1) {
    tableData.value.splice(index, 1);
    // 重新排序
    tableData.value.forEach((item, idx) => {
      item.sortOrder = idx + 1;
    });
    handleUpdateValue();
    message.success('删除成功');
  }
}

/** 预览附件 */
function handlePreview(row: AttachmentApi.AttachmentSaveReq) {
  window.open(row.fileUrl, '_blank');
}

/** 下载附件 */
function handleDownload(row: AttachmentApi.AttachmentSaveReq) {
  const link = document.createElement('a');
  link.href = row.fileUrl;
  link.download = row.fileName;
  link.click();
}

/** 将最新数据写回并通知父组件 */
function handleUpdateValue() {
  emit('update:modelValue', [...tableData.value]);
}

/** 备注编辑完成后更新数据 */
function handleRemarkEdit() {
  handleUpdateValue();
}

// 上传配置
const uploadProps: UploadProps = {
  name: 'file',
  multiple: true,
  showUploadList: false,
  beforeUpload: (file) => {
    // 检查文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${props.maxSize}MB`);
      return false;
    }

    // 检查文件数量
    if (tableData.value.length >= props.maxCount) {
      message.error(`最多只能上传 ${props.maxCount} 个文件`);
      return false;
    }

    // 添加文件到列表
    handleAdd(file);
    
    return false; // 阻止默认上传行为
  },
};

// 计算是否可以上传
const canUpload = computed(() => {
  return !props.readonly && tableData.value.length < props.maxCount;
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    columns: useAttachmentColumns(),
    data: tableData.value,
    height: 'auto',
    border: true,
    showOverflow: true,
    autoResize: true,
    keepSource: true,
    rowConfig: {
      keyField: 'rowKey',
      isHover: true,
    },
    pagerConfig: {
      enabled: false,
    },
    toolbarConfig: {
      enabled: false,
    },
  } as VxeTableGridOptions<AttachmentApi.AttachmentSaveReq>,
  gridEvents: {
    editClosed: handleRemarkEdit,
  },
});

/** 监听外部传入的数据变化 */
watch(
  () => props.modelValue,
  async (attachments) => {
    if (!attachments) {
      return;
      }
      await nextTick();
      tableData.value = [...attachments];
      await gridApi.grid.reloadData(tableData.value);
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<template>
  <div class="attachment-list">
    <!-- 上传区域 -->
    <div v-if="canUpload" class="mb-4">
      <Upload v-bind="uploadProps">
        <Button type="dashed" block>
          <IconifyIcon icon="lucide:upload" class="mr-2" />
          点击上传附件
          <span class="text-gray-500 ml-2">
            (最多{{ maxCount }}个文件，单个文件不超过{{ maxSize }}MB)
          </span>
        </Button>
      </Upload>
    </div>

    <!-- 附件列表 -->
    <div>
      <Grid class="w-full">
        <template #actions="{ row }">
          <TableAction
            :actions="useAttachmentActions(
              props.readonly,
              () => handlePreview(row),
              () => handleDownload(row),
              () => handleDelete(row),
            )"
          />
        </template>
      </Grid>
    </div>
  </div>
</template>

<style scoped>
.attachment-list {
  width: 100%;
}
</style>
