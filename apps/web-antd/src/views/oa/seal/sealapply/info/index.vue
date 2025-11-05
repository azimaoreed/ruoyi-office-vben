<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SealApplyBillApi } from '#/api/oa/seal/sealapply';

import { nextTick, onMounted, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

import { Loading } from '@vben/common-ui';
import {
  BpmProcessInstanceStatus,
  BpmProcessInstanceStatusEditValue,
} from '@vben/constants';
import { useTabs } from '@vben/hooks';
import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { withdrawProcessToStart } from '#/api/bpm/task';
import {
  getSealApplyBill,
  saveSealApplyBill,
  submitSealApplyBill,
} from '#/api/oa/seal/sealapply';
import { BasicForm } from '#/components/basic-form';
import { $t } from '#/locales';

import { SealSelectModal } from '../../components';
import { useFormSchema } from './data';

defineOptions({ name: 'OaSealApplyBillInfo' });

// 定义组件 props
const props = defineProps<{
  activityNodes?: any[];
  id?: number | string; // 从 BusinessFormComponent 传递的 id
  isApproval?: boolean; // 是否审批态
  processDefinition?: any; // 流程定义信息
  processInstance?: any; // 流程实例信息
}>();

const route = useRoute();
const userStore = useUserStore();

const { closeCurrentTab } = useTabs();

const formData = ref<Partial<SealApplyBillApi.SealApplyBill>>({});

const readonly = ref(false);
const loading = ref(false);

// BasicForm组件引用
const basicFormRef = ref();

// 印章选择弹窗引用
const modalRef = ref<InstanceType<typeof SealSelectModal>>();

// 表单schema - 使用shallowRef避免深度响应式
const formSchema = shallowRef<VbenFormSchema[]>([]);

// 初始化表单schema
function initFormSchema() {
  formSchema.value = useFormSchema(modalRef, readonly);
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
      ? ((await basicFormRef.value.getFormValues()) as SealApplyBillApi.SealApplyBill)
      : ((await basicFormRef.value.getFormValues(
          false,
        )) as SealApplyBillApi.SealApplyBill);

    // 合并表单值和其他数据
    const data = {
      ...formData.value,
      ...formValues,
    };

    id = await (isSubmit ? submitSealApplyBill(data) : saveSealApplyBill(data));

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
      documentCount: 1,
      isUrgent: 0,
      useMode: 1, // 默认现场用章
      sealId: 0,
      sealNo: '',
      cause: '',
      useType: 1,
      billCode: '',
    };
    return;
  }

  // 加载数据
  loading.value = true;
  try {
    const data = await getSealApplyBill(id);
    // 扩展数据，添加显示需要的字段
    formData.value = {
      ...data,
    };
    // 如果有 isApproval prop，则以 prop 为准；否则根据流程状态判断
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
      error instanceof Error ? error.message : '获取用印申请单详情失败';
    message.error(errorMessage);
    console.error('获取用印申请单详情失败:', error);
  } finally {
    loading.value = false;

    // 数据加载完成后，刷新BasicForm组件数据
    nextTick(() => {
      basicFormRef.value?.refreshAllData();
    });
  }
}

// 处理印章选择
function handleSealSelect(val: any) {
  if (basicFormRef.value && val) {
    const sealData = {
      sealId: val.id,
      sealNo: val.sealNo,
      sealName: val.sealName,
      sealType: val.sealType,
      keeperId: val.keeperId,
      keeperName: val.keeperName,
      keeperDeptId: val.keeperDeptId,
      keeperDeptName: val.keeperDeptName,
    };
    basicFormRef.value.setFormValues(sealData);

    // 同时更新formData
    Object.assign(formData.value, sealData);
  }
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
        billName: '用印申请单',
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
        <!-- 这里可以添加明细表格或其他扩展内容 -->
      </template>
    </BasicForm>

    <!-- 印章选择弹窗 -->
    <SealSelectModal ref="modalRef" @select="handleSealSelect" />
  </Loading>
</template>

<style scoped>
/* 业务页面样式已封装到BasicForm组件中，无需重复定义 */
</style>
