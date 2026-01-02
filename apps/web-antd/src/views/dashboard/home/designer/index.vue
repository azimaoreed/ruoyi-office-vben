<script lang="ts" setup>
import type { GridLayoutItem, LayoutConfig } from '../types/layout';

import type { SystemHomeComponentApi } from '#/api/system/home/component';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import {
  getHomePage,
  getHomePageLayoutList,
  saveHomePageLayout,
} from '#/api/system/home';
import { getAvailableComponentList } from '#/api/system/home/component';

import ComponentPanel from './components/component-panel.vue';
import ConfigPanel from './components/config-panel.vue';
import DesignerCanvas from './components/designer-canvas.vue';

const route = useRoute();
const router = useRouter();

const pageId = ref<number>(Number(route.query.pageId) || 0);
const pageName = ref<string>('');
const layout = ref<GridLayoutItem[]>([]);
const selectedItemId = ref<null | string>(null);
const components = ref<SystemHomeComponentApi.Component[]>([]);
const saving = ref(false);

/** 当前选中的布局项 */
const selectedItem = computed(() => {
  if (!selectedItemId.value) return null;
  return layout.value.find((item) => item.i === selectedItemId.value) || null;
});

/** 加载首页信息 */
async function loadPageInfo() {
  if (!pageId.value) {
    message.error('首页ID不能为空');
    return;
  }

  try {
    const pageInfo = await getHomePage(pageId.value);
    pageName.value = pageInfo.name;
  } catch (error) {
    message.error('加载首页信息失败');
    console.error(error);
  }
}

/** 加载布局配置 */
async function loadLayout() {
  if (!pageId.value) return;

  try {
    const layoutItems = await getHomePageLayoutList(pageId.value);

    // 转换为 GridLayoutItem 格式
    layout.value = layoutItems.map((item) => ({
      i: `item-${item.id}`,
      x: item.positionX,
      y: item.positionY,
      w: item.width,
      h: item.height,
      componentCode: item.componentCode,
      config: item.config ? JSON.parse(item.config) : {},
      isDraggable: true,
      isResizable: true,
      minW: 2,
      minH: 2,
    }));
  } catch (error) {
    console.error('Failed to load layout:', error);
  }
}

/** 加载可用组件 */
async function loadComponents() {
  try {
    components.value = await getAvailableComponentList();
  } catch (error) {
    message.error('加载组件列表失败');
    console.error(error);
  }
}

/** 查找可用的放置位置 */
function findAvailablePosition(
  width: number,
  height: number,
): { x: number; y: number } {
  const colNum = 24;

  // 如果布局为空，放在左上角
  if (layout.value.length === 0) {
    return { x: 0, y: 0 };
  }

  // 计算每一行的占用情况
  const maxY = Math.max(...layout.value.map((item) => item.y + item.h), 0);

  // 从上到下，从左到右查找可用位置
  for (let y = 0; y <= maxY + 1; y++) {
    for (let x = 0; x <= colNum - width; x++) {
      // 检查这个位置是否与现有组件重叠
      const isOverlap = layout.value.some((item) => {
        return !(
          x + width <= item.x || // 在左边
          x >= item.x + item.w || // 在右边
          y + height <= item.y || // 在上边
          y >= item.y + item.h // 在下边
        );
      });

      if (!isOverlap) {
        return { x, y };
      }
    }
  }

  // 如果没找到合适位置，放在最底部
  return { x: 0, y: maxY + 1 };
}

/** 添加组件到画布 */
function handleAddComponent(component: SystemHomeComponentApi.Component) {
  const newId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const width = component.defaultWidth || 6;
  const height = component.defaultHeight || 4;

  // 智能查找可用位置
  const position = findAvailablePosition(width, height);

  const newItem: GridLayoutItem = {
    i: newId,
    x: position.x,
    y: position.y,
    w: width,
    h: height,
    componentCode: component.code,
    config: {},
    isDraggable: true,
    isResizable: true,
    minW: 2,
    minH: 2,
  };

  layout.value = [...layout.value, newItem];
  selectedItemId.value = newId;
}

/** 更新组件配置 */
function handleUpdateConfig(itemId: string, config: Record<string, any>) {
  const item = layout.value.find((l) => l.i === itemId);
  if (item) {
    item.config = config;
  }
}

/** 保存布局 */
async function handleSave() {
  if (!pageId.value) {
    message.error('首页ID不能为空');
    return;
  }

  saving.value = true;
  try {
    // 构建布局JSON
    const layoutConfig: LayoutConfig = {
      items: layout.value.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        componentCode: item.componentCode,
        config: item.config,
        isDraggable: item.isDraggable,
        isResizable: item.isResizable,
        minW: item.minW,
        minH: item.minH,
      })),
      colNum: 24,
      rowHeight: 60,
      isDraggable: true,
      isResizable: true,
      margin: [10, 10],
      containerPadding: [10, 10],
      verticalCompact: false,
      preventCollision: false,
      useCssTransforms: true,
    };

    await saveHomePageLayout({
      pageId: pageId.value,
      layoutJson: JSON.stringify(layoutConfig),
    });

    message.success('保存成功');
  } catch (error) {
    message.error('保存失败');
    console.error(error);
  } finally {
    saving.value = false;
  }
}

/** 预览 */
function handlePreview() {
  router.push({
    path: '/home',
    query: { preview: pageId.value },
  });
}

/** 返回 */
function handleBack() {
  router.push('/home/manage');
}

onMounted(() => {
  loadPageInfo();
  loadLayout();
  loadComponents();
});
</script>

<template>
  <Page
    :content-class="{
      'p-0!': true,
    }"
    :content-style="{ height: 'calc(100vh - 64px)' }"
  >
    <!-- 顶部工具栏 -->
    <div
      class="designer-toolbar flex items-center justify-between border-b bg-white px-4 py-3"
    >
      <div class="flex items-center space-x-4">
        <Button @click="handleBack"> 返回 </Button>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">{{ pageName }}</h2>
          <span class="text-xs text-gray-500">首页设计器</span>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <Button @click="handlePreview"> 预览 </Button>
        <Button type="primary" :loading="saving" @click="handleSave">
          保存
        </Button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="designer-content flex h-full">
      <!-- 左侧：组件面板 -->
      <div class="w-64 flex-shrink-0">
        <ComponentPanel @addComponent="handleAddComponent" />
      </div>

      <!-- 中间：画布 -->
      <div class="flex-1 overflow-hidden">
        <DesignerCanvas
          v-model:layout="layout"
          v-model:selected-item-id="selectedItemId"
          :col-num="24"
          :row-height="60"
        />
      </div>

      <!-- 右侧：配置面板 -->
      <div class="w-80 flex-shrink-0">
        <ConfigPanel
          :selected-item="selectedItem"
          :components="components"
          @updateConfig="handleUpdateConfig"
        />
      </div>
    </div>
  </Page>
</template>

<style scoped>
.designer-toolbar {
  height: 64px;
}

.designer-content {
  height: calc(100% - 64px);
}
</style>
