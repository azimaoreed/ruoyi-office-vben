<!--
 * @Author: zhanghui
 * @Date: 2025-08-04 23:13:26
 * @LastEditTime: 2025-08-10 21:42:50
 * @LastEditors: zhanghui
 * @Description: 表单详情页底部操作按钮
-->

<script lang="ts" setup>
import { BpmProcessInstanceStatus } from '#/utils';

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
  <a-space>
    <a-button @click="closeForm">关闭</a-button>
    <a-button type="primary" @click="revokeForm" v-if="processStatus === BpmProcessInstanceStatus.RUNNING">撤回</a-button>
    <a-button @click="saveForm" v-if="processStatus === BpmProcessInstanceStatus.NOT_START || processStatus === BpmProcessInstanceStatus.REJECT || processStatus === BpmProcessInstanceStatus.CANCEL">保存</a-button>
    <a-button type="primary" @click="submitForm" v-if="processStatus === BpmProcessInstanceStatus.NOT_START || processStatus === BpmProcessInstanceStatus.REJECT || processStatus === BpmProcessInstanceStatus.CANCEL">提交</a-button>
  </a-space>
</template>
<style scoped></style>
