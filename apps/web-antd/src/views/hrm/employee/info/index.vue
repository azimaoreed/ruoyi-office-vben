<script lang="ts" setup>
import type { EmployeeArchiveApi } from '#/api/hrm/employee';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Button, message, Space, Table } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createEmployeeArchive,
  getEmployeeArchive,
  updateEmployeeArchive,
} from '#/api/hrm/employee';
import { CardContainer } from '#/components/basic-form';

import { useAvatarFormSchema, useBasicFormSchema, useWorkFormSchema } from './data';

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
  { 
    title: '开始时间', 
    dataIndex: 'startTime', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              type: 'date',
              value: text,
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (workExperienceList.value[index]) {
                  workExperienceList.value[index].startTime = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '截止时间', 
    dataIndex: 'endTime', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              type: 'date',
              value: text,
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (workExperienceList.value[index]) {
                  workExperienceList.value[index].endTime = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '职务', 
    dataIndex: 'jobPosition', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入职务',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (workExperienceList.value[index]) {
                  workExperienceList.value[index].jobPosition = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '单位名称', 
    dataIndex: 'companyName',
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入单位名称',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (workExperienceList.value[index]) {
                  workExperienceList.value[index].companyName = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ index }: any) => ({
      children: [
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
  { 
    title: '开始时间', 
    dataIndex: 'startTime', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              type: 'date',
              value: text,
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (educationList.value[index]) {
                  educationList.value[index].startTime = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '截止时间', 
    dataIndex: 'endTime', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              type: 'date',
              value: text,
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (educationList.value[index]) {
                  educationList.value[index].endTime = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '专业', 
    dataIndex: 'major', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入专业',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (educationList.value[index]) {
                  educationList.value[index].major = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '学校名称', 
    dataIndex: 'schoolName',
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入学校名称',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (educationList.value[index]) {
                  educationList.value[index].schoolName = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ index }: any) => ({
      children: [
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
  { 
    title: '姓名', 
    dataIndex: 'name', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入姓名',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (familyList.value[index]) {
                  familyList.value[index].name = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '关系', 
    dataIndex: 'relationship', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入关系',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (familyList.value[index]) {
                  familyList.value[index].relationship = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '联系电话', 
    dataIndex: 'mobile', 
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入联系电话',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (familyList.value[index]) {
                  familyList.value[index].mobile = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  { 
    title: '工作单位', 
    dataIndex: 'workUnit',
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text;
      return {
        children: [
          {
            is: 'input',
            props: {
              value: text,
              placeholder: '请输入工作单位',
              class: 'w-full rounded border border-gray-300 px-2 py-1',
              onInput: (e: any) => {
                if (familyList.value[index]) {
                  familyList.value[index].workUnit = e.target.value;
                }
              },
            },
          },
        ],
      };
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ index }: any) => ({
      children: [
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

// 初始化基本信息表单
const [BasicForm, basicFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 120,
  },
  wrapperClass: 'grid grid-cols-2 gap-4',
  layout: 'horizontal',
  schema: useBasicFormSchema(),
  showDefaultActions: false,
});

// 初始化照片表单
const [AvatarForm, avatarFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 80,
  },
  layout: 'vertical',
  schema: useAvatarFormSchema(),
  showDefaultActions: false,
});

// 初始化工作信息表单
const [WorkForm, workFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 120,
  },
  wrapperClass: 'grid grid-cols-2 gap-4',
  layout: 'horizontal',
  schema: useWorkFormSchema(),
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
    
    // 设置表单数据
    await basicFormApi.setValues(data);
    await avatarFormApi.setValues(data);
    await workFormApi.setValues(data);

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
  // 验证所有表单
  const basicValid = await basicFormApi.validate();
  const avatarValid = await avatarFormApi.validate();
  const workValid = await workFormApi.validate();
  
  if (!basicValid.valid || !avatarValid.valid || !workValid.valid) {
    return;
  }

  loading.value = true;
  try {
    // 合并所有表单数据
    const basicValues = await basicFormApi.getValues();
    const avatarValues = await avatarFormApi.getValues();
    const workValues = await workFormApi.getValues();
    
    const values = {
      ...basicValues,
      ...avatarValues,
      ...workValues,
    } as EmployeeArchiveApi.EmployeeArchive;
    
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

function handleDeleteFamily(index: number) {
  familyList.value.splice(index, 1);
}

onMounted(async () => {
  // 判断是否只读
  readonly.value = route.query.readonly === 'true';

  // 如果设置了 readonly，禁用表单
  if (readonly.value) {
    basicFormApi.setFieldValue('disabled', true);
    avatarFormApi.setFieldValue('disabled', true);
    workFormApi.setFieldValue('disabled', true);
  }

  // 加载数据
  await loadData();
});
</script>

<template>
  <Page :loading="loading" :title="pageTitle">
    <template #extra>
      <Space>
        <Button @click="handleClose">关闭</Button>
        <Button v-if="!readonly" type="primary" @click="handleSave">保存</Button>
      </Space>
    </template>

    <!-- 基本信息 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <CardContainer title="基本信息">
        <div class="flex gap-6">
          <!-- 左侧表单区域 -->
          <div class="flex-1">
            <BasicForm />
          </div>
          <!-- 右侧照片区域 -->
          <div class="w-[280px]">
            <AvatarForm />
          </div>
        </div>
      </CardContainer>
    </div>

    <!-- 工作信息 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <CardContainer title="工作信息">
        <WorkForm />
      </CardContainer>
    </div>

    <!-- 工作经历 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <CardContainer title="工作经历">
        <template #extra>
          <Button v-if="!readonly" type="primary"  @click="handleAddWorkExperience">
            {{ $t('common.add') }}
          </Button>
        </template>
        <Table
          :columns="workExperienceColumns"
          :data-source="workExperienceList"
          :pagination="false"
          row-key="id"
          size="small"
        />
      </CardContainer>
    </div>

    <!-- 教育经历 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <CardContainer title="教育经历">
        <template #extra>
          <Button v-if="!readonly" type="primary"  @click="handleAddEducation">
            {{ $t('common.add') }}
          </Button>
        </template>
        <Table
          :columns="educationColumns"
          :data-source="educationList"
          :pagination="false"
          row-key="id"
          size="small"
        />
      </CardContainer>
    </div>

    <!-- 家属信息 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <CardContainer title="家属信息">
        <template #extra>
          <Button v-if="!readonly" type="primary" @click="handleAddFamily">
            {{ $t('common.add') }}
          </Button>
        </template>
        <Table
          :columns="familyColumns"
          :data-source="familyList"
          :pagination="false"
          row-key="id"
          size="small"
        />
      </CardContainer>
    </div>
  </Page>
</template>

