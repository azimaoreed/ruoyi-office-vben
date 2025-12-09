<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { EmployeeEntryBillApi } from '#/api/hrm/employee-entry';

import { h, nextTick, onMounted, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

import { Loading } from '@vben/common-ui';
import {
  BpmProcessInstanceStatus,
  BpmProcessInstanceStatusEditValue,
} from '@vben/constants';
import { useTabs } from '@vben/hooks';
import { useUserStore } from '@vben/stores';

import { Button, DatePicker, Input, message, Table } from 'ant-design-vue';
import dayjs from 'dayjs';

import { withdrawProcessToStart } from '#/api/bpm/task';
import {
  getEmployeeEntryBill,
  saveEmployeeEntryBill,
  submitEmployeeEntryBill,
} from '#/api/hrm/employee-entry';
import { AttachmentList } from '#/components/attachment-list';
import { BasicForm, CardContainer } from '#/components/basic-form';
import { $t } from '#/locales';
import { DeptSelectModal } from '#/views/system/dept/components';

import { useFormSchema } from './data';

defineOptions({ name: 'HrmEmployeeEntryBillInfo' });

// 定义组件 props
const props = defineProps<{
  activityNodes?: any[];
  id?: number | string; // 从 BusinessFormComponent 传递的 id
  isApproval?: boolean; // 是否审批态
  nodeKey?: string; // 节点key
  nodeKeyName?: string; // 节点名称
  processDefinition?: any; // 流程定义信息
  processInstance?: any; // 流程实例信息
}>();

const route = useRoute();
const userStore = useUserStore();
const { closeCurrentTab } = useTabs();

const formData = ref<Partial<EmployeeEntryBillApi.EmployeeEntryBill>>({});

const readonly = ref(false);
const loading = ref(false);

// BasicForm组件引用
const basicFormRef = ref();

// 部门选择弹窗引用
const deptSelectModalRef = ref<InstanceType<typeof DeptSelectModal>>();

// 工作经历列表
const workExperienceList = ref<EmployeeEntryBillApi.EmployeeWorkExperience[]>(
  [],
);
// 教育经历列表
const educationList = ref<EmployeeEntryBillApi.EmployeeEducation[]>([]);
// 家属信息列表
const familyList = ref<EmployeeEntryBillApi.EmployeeFamily[]>([]);

// 表单schema - 使用shallowRef避免深度响应式
const formSchema = shallowRef<VbenFormSchema[]>([]);

// 初始化表单schema
function initFormSchema() {
  const nodeKeyName = ref(props.nodeKeyName || '');
  formSchema.value = useFormSchema(deptSelectModalRef, readonly, nodeKeyName);
}

// 优先使用 props 传递的 id，如果没有则使用路由参数
let id: number | undefined = (() => {
  if (props.id) {
    return typeof props.id === 'string' ? Number(props.id) : props.id;
  }
  return route.query.id ? Number(route.query.id) : undefined;
})();

// 关闭按钮处理
function handleClose() {
  closeCurrentTab();
}

// 保存及提交
async function handleSaveAndSubmit(isSubmit: boolean) {
  loading.value = true;

  if (!basicFormRef.value) return;

  // 提交前校验 - 只有提交时才进行校验，保存时不校验
  if (isSubmit) {
    const { valid } = await basicFormRef.value.validateForm();
    // 如果校验不通过，则不允许提交
    if (!valid) {
      loading.value = false;
      return;
    }
  }

  try {
    // 获取表单值 - 保存时不进行校验
    const formValues = isSubmit
      ? ((await basicFormRef.value.getFormValues()) as EmployeeEntryBillApi.EmployeeEntryBill)
      : ((await basicFormRef.value.getFormValues(
          false,
        )) as EmployeeEntryBillApi.EmployeeEntryBill);

    // 合并表单值和其他数据
    const data = {
      ...formData.value,
      ...formValues,
      workExperienceList: workExperienceList.value,
      educationList: educationList.value,
      familyList: familyList.value,
    };

    id = await (isSubmit
      ? submitEmployeeEntryBill(data)
      : saveEmployeeEntryBill(data));

    message.success({
      content: $t('ui.actionMessage.operationSuccess'),
      key: 'action_key_msg',
    });

    // 保存后重新加载数据
    await loadData();
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    loading.value = false;
  }
}

// 撤回
async function handleRevoke(reason: string) {
  if (
    formData.value.processInstanceId !== undefined &&
    formData.value.processInstanceId !== null
  ) {
    loading.value = true;
    try {
      await withdrawProcessToStart({
        processInstanceId: formData.value.processInstanceId,
        reason: reason || '制单人撤回',
      });
      message.success('撤回成功');
      await loadData();
    } catch (error) {
      console.error('撤回失败:', error);
    } finally {
      loading.value = false;
    }
  }
}

// 加载数据
async function loadData() {
  // 新建默认数据
  if (id === undefined || id === null) {
    // 新建时设置默认值
    formData.value = {
      creator: userStore.userInfo?.id,
      creatorName: userStore.userInfo?.nickname,
      companyId: userStore.userInfo?.companyId || 0,
      companyName: userStore.userInfo?.companyName || '',
      deptId: userStore.userInfo?.deptId || 0,
      deptName: userStore.userInfo?.deptName || '',
      processStatus: BpmProcessInstanceStatus.NOT_START, // 草稿状态
      createTime: new Date(),
      employeeStatus: 2, // 默认试用期
      probationPeriod: 3, // 默认3个月试用期
      attachments: [],
      workExperienceList: [],
      educationList: [],
      familyList: [],
    };
    return;
  }

  // 加载数据
  loading.value = true;
  try {
    const data = await getEmployeeEntryBill(id);
    // 扩展数据，添加显示需要的字段
    formData.value = {
      ...data,
    };

    // 加载明细列表
    if (data.workExperienceList) {
      workExperienceList.value = data.workExperienceList;
    }
    if (data.educationList) {
      educationList.value = data.educationList;
    }
    if (data.familyList) {
      familyList.value = data.familyList;
    }

    readonly.value =
      props.isApproval === true
        ? props.isApproval
        : !BpmProcessInstanceStatusEditValue.includes(
            formData.value.processStatus as number,
          );

    // 设置表单值
    if (basicFormRef.value) {
      await basicFormRef.value.setFormValues(data);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '获取员工入职申请单详情失败';
    message.error(errorMessage);
    console.error('获取员工入职申请单详情失败:', error);
  } finally {
    loading.value = false;

    // 数据加载完成后，刷新BasicForm组件数据
    nextTick(() => {
      basicFormRef.value?.refreshAllData();
    });
  }
}

// 处理部门选择
function handleDeptSelect(dept: any) {
  if (basicFormRef.value && dept) {
    const deptData = {
      deptId: dept.id,
      deptName: dept.name,
    };
    basicFormRef.value.setFormValues(deptData);

    // 同时更新formData
    Object.assign(formData.value, deptData);
  }
}


// 暴露方法给父组件调用
defineExpose({
  loadData,
  handleSaveAndSubmit,
});

// 工作经历表格列定义
const workExperienceColumns = [
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(DatePicker, {
        value: text ? dayjs(text) : null,
        format: 'YYYY-MM-DD',
        placeholder: '请选择开始时间',
        style: { width: '100%' },
        onChange: (date: any) => {
          if (workExperienceList.value[index]) {
            workExperienceList.value[index].startTime = date
              ? dayjs(date).format('YYYY-MM-DD')
              : undefined;
          }
        },
      } as any);
    },
  },
  {
    title: '截止时间',
    dataIndex: 'endTime',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(DatePicker, {
        value: text ? dayjs(text) : null,
        format: 'YYYY-MM-DD',
        placeholder: '请选择截止时间',
        style: { width: '100%' },
        onChange: (date: any) => {
          if (workExperienceList.value[index]) {
            workExperienceList.value[index].endTime = date
              ? dayjs(date).format('YYYY-MM-DD')
              : undefined;
          }
        },
      } as any);
    },
  },
  {
    title: '职务',
    dataIndex: 'jobPosition',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入职务',
        onChange: (e: any) => {
          if (workExperienceList.value[index]) {
            workExperienceList.value[index].jobPosition = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '单位名称',
    dataIndex: 'companyName',
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入单位名称',
        onChange: (e: any) => {
          if (workExperienceList.value[index]) {
            workExperienceList.value[index].companyName = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ index }: any) => {
      if (readonly.value) return '-';
      return h(
        Button,
        {
          type: 'link',
          size: 'small',
          danger: true,
          onClick: () => handleDeleteWorkExperience(index),
        },
        () => '删除',
      );
    },
  },
];

// 教育经历表格列定义
const educationColumns = [
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(DatePicker, {
        value: text ? dayjs(text) : null,
        format: 'YYYY-MM-DD',
        placeholder: '请选择开始时间',
        style: { width: '100%' },
        onChange: (date: any) => {
          if (educationList.value[index]) {
            educationList.value[index].startTime = date
              ? dayjs(date).format('YYYY-MM-DD')
              : undefined;
          }
        },
      } as any);
    },
  },
  {
    title: '截止时间',
    dataIndex: 'endTime',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(DatePicker, {
        value: text ? dayjs(text) : null,
        format: 'YYYY-MM-DD',
        placeholder: '请选择截止时间',
        style: { width: '100%' },
        onChange: (date: any) => {
          if (educationList.value[index]) {
            educationList.value[index].endTime = date
              ? dayjs(date).format('YYYY-MM-DD')
              : undefined;
          }
        },
      } as any);
    },
  },
  {
    title: '专业',
    dataIndex: 'major',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入专业',
        onChange: (e: any) => {
          if (educationList.value[index]) {
            educationList.value[index].major = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '学校名称',
    dataIndex: 'schoolName',
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入学校名称',
        onChange: (e: any) => {
          if (educationList.value[index]) {
            educationList.value[index].schoolName = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ index }: any) => {
      if (readonly.value) return '-';
      return h(
        Button,
        {
          type: 'link',
          size: 'small',
          danger: true,
          onClick: () => handleDeleteEducation(index),
        },
        () => '删除',
      );
    },
  },
];

// 家属信息表格列定义
const familyColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入姓名',
        onChange: (e: any) => {
          if (familyList.value[index]) {
            familyList.value[index].name = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '关系',
    dataIndex: 'relationship',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入关系',
        onChange: (e: any) => {
          if (familyList.value[index]) {
            familyList.value[index].relationship = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '联系电话',
    dataIndex: 'mobile',
    width: 150,
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入联系电话',
        onChange: (e: any) => {
          if (familyList.value[index]) {
            familyList.value[index].mobile = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '工作单位',
    dataIndex: 'workUnit',
    customRender: ({ text, index }: any) => {
      if (readonly.value) return text || '-';
      return h(Input, {
        value: text,
        placeholder: '请输入工作单位',
        onChange: (e: any) => {
          if (familyList.value[index]) {
            familyList.value[index].workUnit = e.target.value;
          }
        },
      } as any);
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ index }: any) => {
      if (readonly.value) return '-';
      return h(
        Button,
        {
          type: 'link',
          size: 'small',
          danger: true,
          onClick: () => handleDeleteFamily(index),
        },
        () => '删除',
      );
    },
  },
];

// ========== 工作经历相关操作 ==========
function handleAddWorkExperience() {
  const newItem: EmployeeEntryBillApi.EmployeeWorkExperience = {
    startTime: undefined,
    endTime: undefined,
    jobPosition: '',
    companyName: '',
  };
  workExperienceList.value.push(newItem);
}

function handleDeleteWorkExperience(index: number) {
  workExperienceList.value.splice(index, 1);
}

// ========== 教育经历相关操作 ==========
function handleAddEducation() {
  const newItem: EmployeeEntryBillApi.EmployeeEducation = {
    startTime: undefined,
    endTime: undefined,
    major: '',
    schoolName: '',
  };
  educationList.value.push(newItem);
}

function handleDeleteEducation(index: number) {
  educationList.value.splice(index, 1);
}

// ========== 家属信息相关操作 ==========
function handleAddFamily() {
  const newItem: EmployeeEntryBillApi.EmployeeFamily = {
    name: '',
    relationship: '',
    mobile: '',
    workUnit: '',
  };
  familyList.value.push(newItem);
}

function handleDeleteFamily(index: number) {
  familyList.value.splice(index, 1);
}

onMounted(() => {
  initFormSchema();
  loadData();
});
</script>

<template>
  <Loading :spinning="loading">
    <BasicForm
      ref="basicFormRef"
      :header-data="{
        ...formData,
        billName: '员工入职申请单',
      }"
      :form-data="formData"
      :form-schema="formSchema"
      :disabled="readonly"
      @close="handleClose"
      @save="handleSaveAndSubmit(false)"
      @submit="handleSaveAndSubmit(true)"
      @revoke="handleRevoke"
      :hide-footer="props.isApproval"
      :activity-nodes="props.activityNodes"
    >
      <!-- 扩展插槽，用于明细表格等 -->
      <template #form-extension>
        <!-- 工作经历 -->
        <CardContainer title="工作经历">
          <div class="mb-4">
            <Button
              v-if="!readonly"
              type="primary"
              size="small"
              @click="handleAddWorkExperience"
            >
              添加工作经历
            </Button>
          </div>
          <Table
            :columns="workExperienceColumns"
            :data-source="workExperienceList"
            :pagination="false"
            size="small"
            bordered
          />
        </CardContainer>

        <!-- 教育经历 -->
        <CardContainer title="教育经历">
          <div class="mb-4">
            <Button
              v-if="!readonly"
              type="primary"
              size="small"
              @click="handleAddEducation"
            >
              添加教育经历
            </Button>
          </div>
          <Table
            :columns="educationColumns"
            :data-source="educationList"
            :pagination="false"
            size="small"
            bordered
          />
        </CardContainer>

        <!-- 家属信息 -->
        <CardContainer title="家属信息">
          <div class="mb-4">
            <Button
              v-if="!readonly"
              type="primary"
              size="small"
              @click="handleAddFamily"
            >
              添加家属信息
            </Button>
          </div>
          <Table
            :columns="familyColumns"
            :data-source="familyList"
            :pagination="false"
            size="small"
            bordered
          />
        </CardContainer>

        <!-- 附件列表 -->
        <CardContainer :title="$t('common.attachmentInfo')">
          <AttachmentList
            v-model="formData.attachments"
            :readonly="readonly"
            :max-count="10"
            :max-size="20"
          />
        </CardContainer>
      </template>
    </BasicForm>

    <!-- 部门选择弹窗 -->
    <DeptSelectModal ref="deptSelectModalRef" @select="handleDeptSelect" />
  </Loading>
</template>

<style scoped>
/* 业务页面样式已封装到BasicForm组件中，无需重复定义 */
</style>
