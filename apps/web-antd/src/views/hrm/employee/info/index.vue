<script lang="ts" setup>
import type { EmployeeArchiveApi } from '#/api/hrm/employee';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Button, Card, Divider, message, Space, Table } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createEmployeeArchive,
  getEmployeeArchive,
  updateEmployeeArchive,
} from '#/api/hrm/employee';

import { useFormSchema } from './data';

defineOptions({ name: 'HrmEmployeeArchiveInfo' });

const route = useRoute();
const router = useRouter();
const { closeCurrentTab } = useTabs();

const formData = ref<Partial<EmployeeArchiveApi.EmployeeArchive>>({});
const readonly = ref(false);
const loading = ref(false);

// 工作经历列表
const workExperienceList = ref<EmployeeArchiveApi.EmployeeWorkExperience[]>([]);
// 教育经历列表
const educationList = ref<EmployeeArchiveApi.EmployeeEducation[]>([]);
// 家属信息列表
const familyList = ref<EmployeeArchiveApi.EmployeeFamily[]>([]);

// 工作经历表格列定义
const workExperienceColumns = [
  { title: '开始时间', dataIndex: 'startTime', width: 150 },
  { title: '截止时间', dataIndex: 'endTime', width: 150 },
  { title: '职务', dataIndex: 'jobPosition', width: 150 },
  { title: '单位名称', dataIndex: 'companyName' },
  {
    title: '操作',
    key: 'action',
    width: 150,
    customRender: ({ index }: any) => ({
      children: [
        {
          is: Button,
          props: {
            type: 'link',
            size: 'small',
            disabled: readonly.value,
            onClick: () => handleEditWorkExperience(index),
          },
          children: '编辑',
        },
        {
          is: Button,
          props: {
            type: 'link',
            size: 'small',
            danger: true,
            disabled: readonly.value,
            onClick: () => handleDeleteWorkExperience(index),
          },
          children: '删除',
        },
      ],
    }),
  },
];

// 教育经历表格列定义
const educationColumns = [
  { title: '开始时间', dataIndex: 'startTime', width: 150 },
  { title: '截止时间', dataIndex: 'endTime', width: 150 },
  { title: '专业', dataIndex: 'major', width: 150 },
  { title: '学校名称', dataIndex: 'schoolName' },
  {
    title: '操作',
    key: 'action',
    width: 150,
    customRender: ({ index }: any) => ({
      children: [
        {
          is: Button,
          props: {
            type: 'link',
            size: 'small',
            disabled: readonly.value,
            onClick: () => handleEditEducation(index),
          },
          children: '编辑',
        },
        {
          is: Button,
          props: {
            type: 'link',
            size: 'small',
            danger: true,
            disabled: readonly.value,
            onClick: () => handleDeleteEducation(index),
          },
          children: '删除',
        },
      ],
    }),
  },
];

// 家属信息表格列定义
const familyColumns = [
  { title: '姓名', dataIndex: 'name', width: 150 },
  { title: '关系', dataIndex: 'relationship', width: 150 },
  { title: '联系电话', dataIndex: 'mobile', width: 150 },
  { title: '工作单位', dataIndex: 'workUnit' },
  {
    title: '操作',
    key: 'action',
    width: 150,
    customRender: ({ index }: any) => ({
      children: [
        {
          is: Button,
          props: {
            type: 'link',
            size: 'small',
            disabled: readonly.value,
            onClick: () => handleEditFamily(index),
          },
          children: '编辑',
        },
        {
          is: Button,
          props: {
            type: 'link',
            size: 'small',
            danger: true,
            disabled: readonly.value,
            onClick: () => handleDeleteFamily(index),
          },
          children: '删除',
        },
      ],
    }),
  },
];

// 初始化表单
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 120,
  },
  wrapperClass: 'grid grid-cols-2 gap-4 p-4',
  layout: 'horizontal',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const pageTitle = computed(() => {
  if (readonly.value) {
    return '查看员工档案';
  }
  return formData.value.id ? '编辑员工档案' : '新增员工档案';
});

/** 加载数据 */
async function loadData() {
  const id = route.query.id as string;
  if (!id) {
    return;
  }

  loading.value = true;
  try {
    const data = await getEmployeeArchive(Number(id));
    formData.value = data;
    await formApi.setValues(data);

    // 加载工作经历
    if (data.workExperienceList) {
      workExperienceList.value = data.workExperienceList.map((item) => ({
        ...item,
        startTime: item.startTime
          ? dayjs(item.startTime).format('YYYY-MM-DD')
          : '',
        endTime: item.endTime ? dayjs(item.endTime).format('YYYY-MM-DD') : '',
      }));
    }

    // 加载教育经历
    if (data.educationList) {
      educationList.value = data.educationList.map((item) => ({
        ...item,
        startTime: item.startTime
          ? dayjs(item.startTime).format('YYYY-MM-DD')
          : '',
        endTime: item.endTime ? dayjs(item.endTime).format('YYYY-MM-DD') : '',
      }));
    }

    // 加载家属信息
    if (data.familyList) {
      familyList.value = data.familyList;
    }
  } catch (error) {
    console.error('加载员工档案失败', error);
    message.error('加载员工档案失败');
  } finally {
    loading.value = false;
  }
}

/** 保存 */
async function handleSave() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    const values = (await formApi.getValues()) as EmployeeArchiveApi.EmployeeArchive;
    values.workExperienceList = workExperienceList.value.map((item) => ({
      ...item,
      startTime: item.startTime
        ? dayjs(item.startTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      endTime: item.endTime
        ? dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
    }));
    values.educationList = educationList.value.map((item) => ({
      ...item,
      startTime: item.startTime
        ? dayjs(item.startTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      endTime: item.endTime
        ? dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
    }));
    values.familyList = familyList.value;

    if (formData.value.id) {
      values.id = formData.value.id;
      await updateEmployeeArchive(values);
      message.success('保存成功');
    } else {
      await createEmployeeArchive(values);
      message.success('新增成功');
    }

    handleClose();
  } catch (error) {
    console.error('保存失败', error);
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

/** 关闭 */
function handleClose() {
  closeCurrentTab();
  router.go(-1);
}

// ========== 工作经历相关操作 ==========
function handleAddWorkExperience() {
  workExperienceList.value.push({
    startTime: undefined,
    endTime: undefined,
    jobPosition: '',
    companyName: '',
  });
}

function handleEditWorkExperience(_index: number) {
  // 这里可以实现编辑弹窗，暂时只打印
  message.info('编辑功能待实现');
}

function handleDeleteWorkExperience(index: number) {
  workExperienceList.value.splice(index, 1);
}

// ========== 教育经历相关操作 ==========
function handleAddEducation() {
  educationList.value.push({
    startTime: undefined,
    endTime: undefined,
    major: '',
    schoolName: '',
  });
}

function handleEditEducation(_index: number) {
  message.info('编辑功能待实现');
}

function handleDeleteEducation(index: number) {
  educationList.value.splice(index, 1);
}

// ========== 家属信息相关操作 ==========
function handleAddFamily() {
  familyList.value.push({
    name: '',
    relationship: '',
    mobile: '',
    workUnit: '',
  });
}

function handleEditFamily(_index: number) {
  message.info('编辑功能待实现');
}

function handleDeleteFamily(index: number) {
  familyList.value.splice(index, 1);
}

onMounted(async () => {
  // 判断是否只读
  readonly.value = route.query.readonly === 'true';

  // 如果设置了 readonly，禁用表单
  if (readonly.value) {
    formApi.setFieldValue('disabled', true);
  }

  // 加载数据
  await loadData();
});
</script>

<template>
  <Page
    :description="`员工编号: ${formData.employeeNo || '-'}`"
    :loading="loading"
    :title="pageTitle"
  >
    <template #extra>
      <Space>
        <Button @click="handleClose">关闭</Button>
        <Button v-if="!readonly" type="primary" @click="handleSave">保存</Button>
      </Space>
    </template>

    <Card class="mb-4" title="基本信息">
      <Form />
    </Card>

    <Card class="mb-4" title="工作经历">
      <div class="mb-2">
        <Button v-if="!readonly" type="primary" @click="handleAddWorkExperience">
          新增工作经历
        </Button>
      </div>
      <Table
        :columns="workExperienceColumns"
        :data-source="workExperienceList"
        :pagination="false"
        row-key="id"
        size="small"
      />
    </Card>

    <Card class="mb-4" title="教育经历">
      <div class="mb-2">
        <Button v-if="!readonly" type="primary" @click="handleAddEducation">
          新增教育经历
        </Button>
      </div>
      <Table
        :columns="educationColumns"
        :data-source="educationList"
        :pagination="false"
        row-key="id"
        size="small"
      />
    </Card>

    <Card class="mb-4" title="家属信息">
      <div class="mb-2">
        <Button v-if="!readonly" type="primary" @click="handleAddFamily">
          新增家属信息
        </Button>
      </div>
      <Table
        :columns="familyColumns"
        :data-source="familyList"
        :pagination="false"
        row-key="id"
        size="small"
      />
    </Card>
  </Page>
</template>

