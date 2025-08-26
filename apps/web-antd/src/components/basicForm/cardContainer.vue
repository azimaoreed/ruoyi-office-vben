<!--
 * @Author: zhanghui
 * @Date: 2025-01-22
 * @Description: 卡片容器组件
-->

<script lang="ts" setup>
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<template>
  <div>
    <div class="card-head">
      <span class="card-head-text">{{ title }}</span>
    </div>
    <div class="h-full">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-head {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 20px;
  font-weight: 700;
  color: hsl(var(--primary));

  .card-head-text::before {
    display: inline-block;
    width: 4px;
    height: 12px;
    margin-right: 8px;
    content: ' ';
    background: hsl(var(--primary));
    border-radius: 2px;
  }
}
</style> 