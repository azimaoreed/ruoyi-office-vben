<script lang="ts" setup>
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';

import { message } from 'ant-design-vue';

import {
  createCarApplyBill,
  getCarApplyBill,
  updateCarApplyBill,
} from '#/api/oa/car/carapply';
import { BasicForm } from '#/components/basicForm';
import { $t } from '#/locales';

import FormContent from './components/FormContent.vue';
import { useUserStore } from '@vben/stores';
import { BpmProcessInstanceStatus } from '#/utils';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const { closeCurrentTab } = useTabs();

const formData = ref<
  Partial<CarApplyBillApi.CarApplyBill> & {
    applicantName?: string;
    applyDate?: string;
    billName?: string;
    billNo?: string;
    companyName?: string;
    createTime?: string;
    deptName?: string;
  }
>({});

const isEdit = computed(
  () => !!route.params.id && route.name !== 'OACarApplyCreate',
);
const isView = computed(() => route.name === 'OACarApplyDetail');
const saving = ref(false);
const submitting = ref(false);
const loading = ref(false);

// FormContent组件引用
const formContentRef = ref();

// 返回列表页
function goBack() {
  router.push('/oa/car/carapply');
}

// 关闭按钮处理
function handleClose() {
  // router.back();
  closeCurrentTab();
}

// 保存表单
async function handleSave() {
  if (!formContentRef.value) return;

  const { valid } = await formContentRef.value.validateForm();
  if (!valid) {
    return;
  }

  saving.value = true;
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.saving'),
    key: 'action_key_msg',
  });

  try {
    const data =
      (await formContentRef.value.getFormValues()) as CarApplyBillApi.CarApplyBill;
    if (isEdit.value) {
      data.id = Number(route.params.id);
      await updateCarApplyBill(data);
    } else {
      await createCarApplyBill(data);
    }

    message.success({
      content: $t('ui.actionMessage.operationSuccess'),
      key: 'action_key_msg',
    });

    // 保存后重新加载数据
    await loadData();
  } catch {
    message.error({
      content: '保存失败',
      key: 'action_key_msg',
    });
  } finally {
    saving.value = false;
    hideLoading();
  }
}

// 提交表单
async function handleSubmit() {
  if (!formContentRef.value) return;

  const { valid } = await formContentRef.value.validateForm();
  if (!valid) {
    return;
  }

  submitting.value = true;
  const hideLoading = message.loading({
    content: '提交中...',
    key: 'action_key_msg',
  });

  try {
    const data =
      (await formContentRef.value.getFormValues()) as CarApplyBillApi.CarApplyBill;
    if (isEdit.value) {
      data.id = Number(route.params.id);
      await updateCarApplyBill(data);
    } else {
      await createCarApplyBill(data);
    }

    message.success({
      content: '提交成功',
      key: 'action_key_msg',
    });
    goBack();
  } catch {
    message.error({
      content: '提交失败',
      key: 'action_key_msg',
    });
  } finally {
    submitting.value = false;
    hideLoading();
  }
}

// 加载数据
async function loadData() {
  const id = route.query.id;

  if (!id) {
    // 新建时设置默认值
    formData.value = {
      billName: '用车申请单',
      billNo: '待生成',
      applicantName: userStore.userInfo?.name,
      applyDate: new Date().toISOString().split('T')[0],
      companyName: '',
      deptName: '',
      processStatus: BpmProcessInstanceStatus.NOT_START, // 草稿状态
    };
    return;
  }

  loading.value = true;
  try {
    const data = await getCarApplyBill(Number(id));
    // 扩展数据，添加显示需要的字段
    formData.value = {
      ...data,
      billName: '用车申请单',
      billNo: (data as any).billNo || `CA${data.id}`,
      applicantName: (data as any).applicantName || '申请人',
      applyDate:
        (data as any).applyDate || new Date().toISOString().split('T')[0],
      companyName: (data as any).companyName || '公司名称',
      deptName: (data as any).deptName || '部门名称',
    };

    // 设置表单值
    if (formContentRef.value) {
      await formContentRef.value.setFormValues(data);
    }
  } catch {
    message.error('获取用车申请单详情失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <BasicForm
    :header-data="formData"
    @close="handleClose"
    @save="handleSave"
    @submit="handleSubmit"
  >
    <template #base-form>
      <FormContent
        ref="formContentRef"
        :form-data="formData"
        :disabled="isView"
      />
    </template>
  </BasicForm>
</template>

<style scoped>
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.h-full {
  height: 100%;
}
</style>
