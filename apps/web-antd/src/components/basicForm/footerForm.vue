<!--
 * @Author: zhanghui
 * @Date: 2025-08-04 23:13:26
 * @LastEditTime: 2025-08-10 21:42:50
 * @LastEditors: zhanghui
 * @Description: 表单详情页底部操作按钮
-->

<script lang="ts" setup>
import { Button, Space } from 'ant-design-vue';

import { BpmProcessInstanceStatus, BpmProcessInstanceStatusEditValue } from '@vben/constants';

// 传入组件参数
const props = defineProps({
  status: {
    type: String as any,
    default: '',
  },
  processStatus: {
    type: String as any,
    default: BpmProcessInstanceStatus.NOT_START,
  },
  submitText: {
    type: String,
    default: '提交',
  },
});
const emit = defineEmits(['close', 'save', 'submit', 'revoke']);
console.warn(props);
// 关闭
const closeForm = () => {
  emit('close');
};
// 保存
const saveForm = () => {
  emit('save');
};
// 提交
const submitForm = () => {
  emit('submit');
};
// 撤回
const revokeForm = () => {
  emit('revoke');
};
</script>
<template>
  <Space>
    <Button @click="closeForm">{{ $t('common.close') }}</Button>
    <Button type="primary" @click="revokeForm" v-if="processStatus === BpmProcessInstanceStatus.RUNNING">{{ $t('common.revoke') }}</Button>
    <Button @click="saveForm" v-if="processStatus && BpmProcessInstanceStatusEditValue.includes(processStatus)">{{ $t('common.save') }}</Button>
    <Button type="primary" @click="submitForm" v-if="processStatus && BpmProcessInstanceStatusEditValue.includes(processStatus)">{{ $t('common.submit') }}</Button>
  </Space>
</template>
<style scoped></style>
