<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Upload, Button, Table, Space, Popconfirm, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { UploadProps } from 'ant-design-vue';
import type { AttachmentApi } from '#/api/oa/attachment';

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

// 内部附件列表
const attachmentList = ref<AttachmentApi.AttachmentSaveReq[]>([]);

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newValue) => {
    attachmentList.value = [...(newValue || [])];
  },
  { immediate: true, deep: true }
);

// 监听内部值变化，同步到外部
watch(
  attachmentList,
  (newValue) => {
    emit('update:modelValue', [...newValue]);
  },
  { deep: true }
);

// 表格列定义
const columns = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    key: 'fileName',
    ellipsis: true,
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    key: 'fileSize',
    width: 100,
    customRender: ({ text }: { text: number }) => {
      if (text < 1024) return `${text}B`;
      if (text < 1024 * 1024) return `${(text / 1024).toFixed(1)}KB`;
      return `${(text / (1024 * 1024)).toFixed(1)}MB`;
    },
  },
  {
    title: '文件类型',
    dataIndex: 'fileExtension',
    key: 'fileExtension',
    width: 80,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right' as const,
  },
];

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
    if (attachmentList.value.length >= props.maxCount) {
      message.error(`最多只能上传 ${props.maxCount} 个文件`);
      return false;
    }

    // 模拟上传成功，实际项目中需要调用上传接口
    const attachment: AttachmentApi.AttachmentSaveReq = {
      businessType: '',
      businessId: 0,
      fileName: file.name,
      filePath: `/uploads/${file.name}`, // 实际应该是上传后返回的路径
      fileUrl: URL.createObjectURL(file), // 实际应该是上传后返回的URL
      fileSize: file.size,
      fileType: file.type,
      fileExtension: file.name.split('.').pop() || '',
      uploadTime: new Date(),
      sortOrder: attachmentList.value.length + 1,
    };

    attachmentList.value.push(attachment);
    message.success('文件上传成功');
    
    return false; // 阻止默认上传行为
  },
};

// 删除附件
const handleDelete = (index: number) => {
  attachmentList.value.splice(index, 1);
  // 重新排序
  attachmentList.value.forEach((item, idx) => {
    item.sortOrder = idx + 1;
  });
  message.success('删除成功');
};

// 下载附件
const handleDownload = (attachment: AttachmentApi.AttachmentSaveReq) => {
  const link = document.createElement('a');
  link.href = attachment.fileUrl;
  link.download = attachment.fileName;
  link.click();
};

// 预览附件
const handlePreview = (attachment: AttachmentApi.AttachmentSaveReq) => {
  window.open(attachment.fileUrl, '_blank');
};

// 计算是否可以上传
const canUpload = computed(() => {
  return !props.readonly && attachmentList.value.length < props.maxCount;
});
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
    <Table
      :columns="columns"
      :data-source="attachmentList"
      :pagination="false"
      size="small"
      :scroll="{ x: 600 }"
      row-key="fileName"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'action'">
          <Space>
            <Button
              type="link"
              size="small"
              @click="handlePreview(record as AttachmentApi.AttachmentSaveReq)"
              title="预览"
            >
              <IconifyIcon icon="lucide:eye" />
            </Button>
            <Button
              type="link"
              size="small"
              @click="handleDownload(record as AttachmentApi.AttachmentSaveReq)"
              title="下载"
            >
              <IconifyIcon icon="lucide:download" />
            </Button>
            <Popconfirm
              v-if="!readonly"
              title="确定要删除这个附件吗？"
              @confirm="handleDelete(index)"
            >
              <Button
                type="link"
                size="small"
                danger
                title="删除"
              >
                <IconifyIcon icon="lucide:trash-2" />
              </Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 空状态 -->
    <div v-if="attachmentList.length === 0" class="text-center py-8 text-gray-500">
      暂无附件
    </div>
  </div>
</template>

<style scoped>
.attachment-list {
  width: 100%;
}
</style>
