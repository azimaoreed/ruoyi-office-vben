<script lang="ts" setup>
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';
import { Loading } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import {
  createCarApplyBill,
  getCarApplyBill,
  updateCarApplyBill,
} from '#/api/oa/car/carapply';
import { BasicForm, type headerDataProps } from '#/components/basicForm';
import { $t } from '#/locales';

import FormContent from './components/FormContent.vue';
import { useUserStore } from '@vben/stores';
import { BpmProcessInstanceStatus } from '#/utils';
import type { Dayjs, UnitType, ManipulateType, OpUnitType, ConfigType, QUnitType } from 'dayjs';
import { formatDate } from '@vben/utils';

const route = useRoute();
const userStore = useUserStore();

const { closeCurrentTab } = useTabs();

const formData = ref<
  Partial<CarApplyBillApi.CarApplyBill> 
>({});
const headerData = computed(() => {
  return {
    ...formData.value,
    billName: '用车申请单'
    };
});

const isView = computed(() => route.query.editType === 'view');
const isEdit = computed(() => route.query.editType === 'edit');
let id:number | undefined = undefined;
const loading = ref(false);

// FormContent组件引用
const formContentRef = ref();


// 关闭按钮处理
function handleClose() {
  closeCurrentTab();
}

// 保存表单
async function handleSave() {
  if (!formContentRef.value) return;

  loading.value = true;
  try {
    const formValues =
      (await formContentRef.value.getFormValues()) as CarApplyBillApi.CarApplyBill;
    const data = {
      ...formData.value,
      ...formValues,
    };
    if (route.query.id) {
      data.id = Number(route.query.id);
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
    loading.value = false;
  }
}

// 提交表单
async function handleSubmit() {
  if (!formContentRef.value) return;

  // 提交前校验
  const { valid } = await formContentRef.value.validateForm();
  if (!valid) {
    return;
  }

  loading.value = true;

  try {
    const data =
      (await formContentRef.value.getFormValues()) as CarApplyBillApi.CarApplyBill;
    if (isEdit.value) {
        data.id = Number(route.query.id);
        await updateCarApplyBill(data);
      } else {
        await createCarApplyBill(data);
    }

    message.success({
      content: '提交成功',
      key: 'action_key_msg',
    });
  } catch {
    message.error({
      content: '提交失败',
      key: 'action_key_msg',
    });
  } finally {

  }
}

// 加载数据
async function loadData() {
  
  id = route.query.id ? Number(route.query.id) : undefined;
  if (id==undefined) {
    // 新建时设置默认值
    formData.value = {
      creator: userStore.userInfo?.id,
      creatorName: userStore.userInfo?.nickname,
      companyId: userStore.userInfo?.companyId,
      companyName: userStore.userInfo?.companyName,
      deptId: userStore.userInfo?.deptId,
      deptName: userStore.userInfo?.deptName,
      processStatus: BpmProcessInstanceStatus.NOT_START, // 草稿状态
    };
    return;
  }

  loading.value = true;
  try {
    const data = await getCarApplyBill(id);
    // 扩展数据，添加显示需要的字段
    formData.value = {
      ...data,
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
  <Loading :spinning="loading">
    <BasicForm
      :header-data="{
        ...formData,
        billName: '用车申请单',
      }"
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
  </Loading>
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
