<script lang="ts" setup>
import type { GridLayoutItem, LayoutConfig } from '../types/layout';

import { onMounted, ref } from 'vue';

import { Empty, Spin } from 'ant-design-vue';
import { GridItem, GridLayout } from 'grid-layout-plus';

import { getHomePageLayoutList } from '#/api/system/home';

import ComponentWrapper from '../components/wrapper/component-wrapper.vue';

interface Props {
  pageId: number;
}

const props = defineProps<Props>();

const loading = ref(false);
const layout = ref<GridLayoutItem[]>([]);
const layoutConfig = ref<Partial<LayoutConfig>>({
  colNum: 24,
  rowHeight: 60,
  isDraggable: false, // 渲染模式不可拖拽
  isResizable: false, // 渲染模式不可调整大小
  margin: [10, 10],
  containerPadding: [10, 10],
  verticalCompact: false, // 禁用垂直压缩，保持设计时的布局
  preventCollision: false,
  useCssTransforms: true,
});

/** 加载布局 */
async function loadLayout() {
  loading.value = true;
  try {
    const layoutItems = await getHomePageLayoutList(props.pageId);

    // 转换为 GridLayoutItem 格式
    layout.value = layoutItems.map((item) => ({
      i: `item-${item.id}`,
      x: item.positionX,
      y: item.positionY,
      w: item.width,
      h: item.height,
      componentCode: item.componentCode,
      config: item.config ? JSON.parse(item.config) : {},
      isDraggable: false,
      isResizable: false,
      static: true, // 静态模式
    }));
  } catch (error) {
    console.error('Failed to load layout:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadLayout();
});
</script>

<template>
  <div class="layout-renderer h-full w-full">
    <Spin :spinning="loading" tip="加载中...">
      <div
        v-if="!loading && layout.length === 0"
        class="flex h-full items-center justify-center"
      >
        <Empty description="暂无布局配置" />
      </div>

      <GridLayout
        v-else
        v-model:layout="layout"
        :col-num="layoutConfig.colNum"
        :row-height="layoutConfig.rowHeight"
        :is-draggable="layoutConfig.isDraggable"
        :is-resizable="layoutConfig.isResizable"
        :vertical-compact="layoutConfig.verticalCompact"
        :prevent-collision="layoutConfig.preventCollision"
        :use-css-transforms="layoutConfig.useCssTransforms"
        :margin="layoutConfig.margin"
        class="layout-container"
      >
        <GridItem
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :static="item.static"
          class="layout-item"
        >
          <div
            class="layout-item-content h-full w-full overflow-hidden rounded bg-white shadow-sm"
          >
            <ComponentWrapper
              :component-code="item.componentCode"
              :config="item.config"
            />
          </div>
        </GridItem>
      </GridLayout>
    </Spin>
  </div>
</template>

<style scoped>
.layout-renderer {
  padding: 16px;
  overflow-y: auto;
  background: #f5f5f5;
}

.layout-container {
  min-height: 100%;
}

.layout-item {
  transition: none !important;
}

.layout-item-content {
  padding: 12px;
}

:deep(.vue-grid-item) {
  touch-action: none;
  cursor: default;
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  display: none;
}
</style>
