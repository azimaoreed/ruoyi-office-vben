<script lang="ts" setup>
import type { SystemHomeAppCenterApi } from '#/api/system/home/app-center';

import { computed, nextTick, onMounted, ref } from 'vue';

import { Empty, message, Modal, Popconfirm, Spin } from 'ant-design-vue';
import Draggable from 'vuedraggable';

import {
  createUserApp,
  deleteUserApp,
  getUserAppList,
  getUserMenuOptions,
  initUserApp,
  resetUserApp,
  updateUserAppSort,
} from '#/api/system/home/app-center';
import { router } from '#/router';

import AppSelectModal from './app-select-modal.vue';

interface Props {
  maxAppCount?: number; // 最大显示应用数
  gridCols?: number; // 网格列数
  enableDrag?: boolean; // 是否启用拖拽
}

const props = withDefaults(defineProps<Props>(), {
  maxAppCount: 12,
  gridCols: 4,
  enableDrag: true,
});

const loading = ref(false);
const appList = ref<SystemHomeAppCenterApi.AppUserVO[]>([]);
const menuOptions = ref<SystemHomeAppCenterApi.MenuOption[]>([]);
const isDragging = ref(false);

// 添加应用模态框
const selectModalVisible = ref(false);

// 显示的应用列表（限制数量）
const displayApps = computed(() => {
  return appList.value.slice(0, props.maxAppCount);
});

// 网格样式
const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${props.gridCols}, 1fr)`,
  };
});

// 加载应用列表
async function loadAppList() {
  loading.value = true;
  try {
    appList.value = await getUserAppList();
    // 如果没有数据，自动初始化
    if (appList.value.length === 0) {
      await handleInitApps();
    }
  } catch (error) {
    console.error('加载应用列表失败:', error);
    appList.value = [];
  } finally {
    loading.value = false;
  }
}

// 加载菜单选项
async function loadMenuOptions() {
  try {
    menuOptions.value = await getUserMenuOptions();
  } catch (error) {
    console.error('加载菜单选项失败:', error);
    menuOptions.value = [];
  }
}

// 初始化应用（从系统配置复制）
async function handleInitApps() {
  try {
    await initUserApp();
    message.success('初始化成功');
    await loadAppList();
  } catch (error) {
    console.error('初始化应用失败:', error);
  }
}

// 重置应用（恢复系统默认）
async function handleResetApps() {
  Modal.confirm({
    title: '确认重置',
    content:
      '重置后将恢复为系统默认应用配置，您的个性化配置将被清除，是否继续？',
    async onOk() {
      try {
        await resetUserApp();
        message.success('重置成功');
        await loadAppList();
      } catch (error) {
        console.error('重置应用失败:', error);
      }
    },
  });
}

// 打开添加应用模态框
function handleAddApp() {
  selectModalVisible.value = true;
}

// 选择应用
async function handleSelectApp(menuId: number) {
  try {
    await createUserApp({ menuId });
    message.success('添加成功');
    selectModalVisible.value = false;
    await loadAppList();
  } catch (error) {
    console.error('添加应用失败:', error);
  }
}

// 删除应用
async function handleDeleteApp(app: SystemHomeAppCenterApi.AppUserVO) {
  if (!app.id) return;
  try {
    await deleteUserApp(app.id);
    message.success('删除成功');
    await loadAppList();
  } catch (error) {
    console.error('删除应用失败:', error);
  }
}

// 拖拽开始
function handleDragStart() {
  isDragging.value = true;
}

// 拖拽结束
async function handleDragEnd() {
  isDragging.value = false;
  await nextTick();

  // 更新排序
  const sortData = appList.value.map((app, index) => ({
    id: app.id!,
    sort: index,
  }));

  try {
    await updateUserAppSort(sortData);
    message.success('排序已保存');
  } catch (error) {
    console.error('更新排序失败:', error);
    // 失败时重新加载列表
    await loadAppList();
  }
}

// 点击应用
function handleClickApp(app: SystemHomeAppCenterApi.AppUserVO) {
  if (!app.menuPath) {
    message.warning('该应用暂无访问路径');
    return;
  }

  // 跳转到对应菜单页面
  router.push({ path: app.menuPath });
}

// 获取应用图标
function getAppIcon(app: SystemHomeAppCenterApi.AppUserVO) {
  return app.icon || app.menuIcon || 'carbon:application';
}

// 获取应用名称
function getAppName(app: SystemHomeAppCenterApi.AppUserVO) {
  return app.name || app.menuName || '未命名应用';
}

// 获取应用颜色
function getAppColor(app: SystemHomeAppCenterApi.AppUserVO) {
  return app.color || '#1890FF';
}

// 组件挂载时加载数据
onMounted(() => {
  loadAppList();
  loadMenuOptions();
});
</script>

<template>
  <div class="workbench-app-center rounded-lg bg-background">
    <!-- 头部 -->
    <div class="app-header flex items-center justify-between px-4 py-3">
      <h3 class="text-base font-semibold">应用中心</h3>
      <div class="flex items-center gap-2">
        <a
          class="cursor-pointer text-sm text-gray-600 hover:text-primary"
          @click="handleResetApps"
        >
          重置
        </a>
        <a
          class="cursor-pointer text-sm text-primary hover:underline"
          @click="handleAddApp"
        >
          <iconify-icon icon="carbon:add" class="mr-1" />
          添加应用
        </a>
      </div>
    </div>

    <!-- 应用网格 -->
    <div class="app-grid-wrapper px-4 pb-4">
      <Spin :spinning="loading">
        <Draggable
          v-if="displayApps.length > 0"
          v-model="appList"
          :disabled="!enableDrag"
          class="app-grid"
          :style="gridStyle"
          item-key="id"
          animation="200"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element: app }">
            <div
              class="app-item group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
              :class="{
                'is-dragging': isDragging,
                'opacity-50': app.status === 1,
              }"
              @click="handleClickApp(app)"
            >
              <!-- 删除按钮 -->
              <Popconfirm
                title="确定要删除此应用吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm.stop="handleDeleteApp(app)"
              >
                <div
                  class="app-delete absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  @click.stop
                >
                  <iconify-icon icon="carbon:close" class="text-sm" />
                </div>
              </Popconfirm>

              <!-- 图标 -->
              <div class="mb-2 flex justify-center">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg"
                  :style="{ backgroundColor: `${getAppColor(app)}15` }"
                >
                  <iconify-icon
                    :icon="getAppIcon(app)"
                    class="text-2xl"
                    :style="{ color: getAppColor(app) }"
                  />
                </div>
              </div>

              <!-- 名称 -->
              <div class="text-center text-sm font-medium text-gray-900">
                {{ getAppName(app) }}
              </div>

              <!-- 拖拽指示 -->
              <div
                v-if="enableDrag"
                class="drag-handle absolute bottom-1 right-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <iconify-icon icon="carbon:draggable" class="text-base" />
              </div>
            </div>
          </template>
        </Draggable>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="py-8">
          <Empty description="暂无应用" :image="Empty.PRESENTED_IMAGE_SIMPLE">
            <template #footer>
              <a class="text-primary" @click="handleAddApp">
                <iconify-icon icon="carbon:add" class="mr-1" />
                添加常用应用
              </a>
            </template>
          </Empty>
        </div>
      </Spin>
    </div>

    <!-- 添加应用模态框 -->
    <AppSelectModal
      v-model:visible="selectModalVisible"
      :menu-options="menuOptions"
      :selected-menu-ids="appList.map((app) => app.menuId)"
      @select="handleSelectApp"
    />
  </div>
</template>

<style scoped>
.workbench-app-center {
  box-shadow:
    0 1px 2px 0 rgb(0 0 0 / 3%),
    0 1px 6px -1px rgb(0 0 0 / 2%),
    0 2px 4px 0 rgb(0 0 0 / 2%);
}

.app-header {
  border-bottom: 1px solid #f0f0f0;
}

.app-grid {
  display: grid;
  gap: 16px;
  min-height: 200px;
}

.app-item {
  min-height: 120px;
}

.app-item.is-dragging {
  cursor: move;
}

/* 拖拽时的样式 */
.sortable-ghost {
  background: #f0f0f0;
  opacity: 0.5;
}

.sortable-chosen {
  cursor: move;
}
</style>
