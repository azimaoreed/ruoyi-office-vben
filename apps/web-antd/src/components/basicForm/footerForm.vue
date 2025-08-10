<!--
 * @Author: zhanghui
 * @Date: 2025-08-04 23:13:26
 * @LastEditTime: 2025-08-10 21:42:50
 * @LastEditors: zhanghui
 * @Description: 表单详情页底部操作按钮
-->

<script lang="ts" setup>
// 传入组件参数
const props = defineProps({
  status: {
    type: String as any,
    default: '',
  },
  flowStatus: {
    type: String as any,
    default: '',
  },
  submitText: {
    type: String,
    default: '提交',
  },
});
const emit = defineEmits(['close', 'save', 'submit']);
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
</script>
<template>
  <a-space>
    <a-button @click="closeForm">关闭</a-button>
    <a-button @click="saveForm">保存</a-button>
    <a-button type="primary" @click="submitForm">提交</a-button>
  </a-space>
</template>
<style scoped></style>
