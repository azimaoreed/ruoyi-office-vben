<script lang="ts" setup>
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';
import { Loading } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import {
  getCarApplyBill,
  saveCarApplyBill,
  submitCarApplyBill,
} from '#/api/oa/car/carapply';
import { BasicForm } from '#/components/basicForm';
import { $t } from '#/locales';
import dayjs from 'dayjs';

import FormContent from './components/FormContent.vue';
import { useUserStore } from '@vben/stores';
import { BpmProcessInstanceStatus } from '#/utils';

const route = useRoute();
const userStore = useUserStore();

const { closeCurrentTab } = useTabs();

const formData = ref<
  Partial<CarApplyBillApi.CarApplyBill> 
>({});

const isEdit = ref(true);
let id:number | undefined = route.query.id ? Number(route.query.id) : undefined;
const loading = ref(false);

// FormContent组件引用
const formContentRef = ref();


// 关闭按钮处理
function handleClose() {
  closeCurrentTab();
}

// 保存及提交
async function handleSaveAndSubmit(isSubmit: boolean) {
  debugger
  loading.value = true;

  if (!formContentRef.value) return;

  // 提交前校验
  if (isSubmit) {
    const { valid } = await formContentRef.value.validateForm();
    // 如果校验不通过，则不允许提交
    if (!valid) {
      loading.value = false;
      return; 
    }
  }
  
  try {
    // 获取表单值
    const formValues =
      (await formContentRef.value.getFormValues()) as CarApplyBillApi.CarApplyBill;
    // 合并表单值和其他数据
    const data = {
      ...formData.value,
      ...formValues,
    };
    
    if (isSubmit) {
      id = await submitCarApplyBill(data);
    } else {
      id = await saveCarApplyBill(data);
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


// 加载数据
async function loadData() {
  debugger
  // 新建默认数据
  if (id==undefined || id==null) {
    // 新建时设置默认值
    formData.value = {
      creator: userStore.userInfo?.id,
      creatorName: userStore.userInfo?.nickname,
      companyId: userStore.userInfo?.companyId,
      companyName: userStore.userInfo?.companyName,
      deptId: userStore.userInfo?.deptId,
      deptName: userStore.userInfo?.deptName,
      processStatus: BpmProcessInstanceStatus.NOT_START, // 草稿状态
      createTime: new Date()
    };
    return;
  }

  // 加载数据
  loading.value = true;
  try {
    const data = await getCarApplyBill(id);
    // 扩展数据，添加显示需要的字段
    formData.value = {
      ...data,
    };
    // 如果流程状态为未开始和审批不通过，则可以编辑
    if (formData.value.processStatus === BpmProcessInstanceStatus.NOT_START || formData.value.processStatus === BpmProcessInstanceStatus.REJECT) {
      isEdit.value = true;
    }else{
      isEdit.value = false;
    }

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
      @save="handleSaveAndSubmit(false)"
      @submit="handleSaveAndSubmit(true)"
    >
      <template #base-form>
        <FormContent
          ref="formContentRef"
          :form-data="formData"
          :disabled="!isEdit"
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
