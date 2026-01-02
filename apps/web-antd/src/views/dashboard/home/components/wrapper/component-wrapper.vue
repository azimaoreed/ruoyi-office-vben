<script setup lang="ts">
import { computed } from 'vue';

import { Icon } from '@iconify/vue';
import { Alert } from 'ant-design-vue';

import { getComponent } from '../registry';

interface Props {
  componentCode: string; // 组件编码
  config?: Record<string, any>; // 组件配置
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
});

const component = computed(() => {
  return getComponent(props.componentCode);
});

const hasError = computed(() => {
  return !component.value;
});

// 标题配置
const showTitle = computed(() => props.config?.showTitle !== false); // 默认显示
const title = computed(() => props.config?.title || '');
const titleIcon = computed(() => props.config?.titleIcon || '');
const titleIconColor = computed(
  () => props.config?.titleIconColor || '#1890ff',
);
</script>

<template>
  <div class="component-wrapper flex h-full w-full flex-col">
    <!-- 组件标题 -->
    <div
      v-if="showTitle && title"
      class="component-title flex items-center border-b bg-white px-3 py-2"
    >
      <Icon
        v-if="titleIcon"
        :icon="titleIcon"
        :style="{ color: titleIconColor }"
        class="mr-2 text-lg"
      />
      <span class="text-sm font-medium">{{ title }}</span>
    </div>

    <!-- 组件内容 -->
    <div class="component-content flex-1 overflow-hidden">
      <component
        :is="component"
        v-if="component && !hasError"
        v-bind="config"
        class="h-full w-full"
      />
      <Alert
        v-else
        :message="`组件未找到: ${componentCode}`"
        description="该组件可能未注册或已被删除，请检查组件配置"
        type="error"
        show-icon
      />
    </div>
  </div>
</template>

<style scoped>
.component-wrapper {
  position: relative;
}

.component-title {
  flex-shrink: 0;
  min-height: 40px;
}

.component-content {
  min-height: 0;
}
</style>
