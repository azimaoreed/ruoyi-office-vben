<script lang="ts" setup>
import type { SystemHomeAppCenterApi } from '#/api/system/home/app-center';

import { computed, ref, watch } from 'vue';

import { Empty, Input, Modal } from 'ant-design-vue';

interface Props {
  visible: boolean;
  menuOptions: SystemHomeAppCenterApi.MenuOption[];
  selectedMenuIds: number[]; // 已选择的菜单ID列表
}

interface Emits {
  (e: 'select', menuId: number): void;
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchKeyword = ref('');

// 过滤菜单选项
const filteredMenus = computed(() => {
  if (!searchKeyword.value) {
    return props.menuOptions;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return props.menuOptions.filter((menu) =>
    menu.name.toLowerCase().includes(keyword),
  );
});

// 可用的菜单列表（扁平化，排除已选择的）
const availableMenus = computed(() => {
  return filteredMenus.value.filter(
    (menu) => !props.selectedMenuIds.includes(menu.id),
  );
});

// 选择菜单
function handleSelectMenu(menu: SystemHomeAppCenterApi.MenuOption) {
  emit('select', menu.id);
}

// 关闭模态框
function handleClose() {
  emit('update:visible', false);
  searchKeyword.value = '';
}

// 获取菜单图标
function getMenuIcon(menu: SystemHomeAppCenterApi.MenuOption) {
  return menu.icon || 'carbon:application';
}

// 监听visible变化，重置搜索关键词
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      searchKeyword.value = '';
    }
  },
);
</script>

<template>
  <Modal
    :open="visible"
    title="添加常用应用"
    width="700px"
    :footer="null"
    @cancel="handleClose"
  >
    <!-- 搜索框 -->
    <div class="mb-4">
      <Input
        v-model:value="searchKeyword"
        placeholder="搜索应用名称..."
        allow-clear
      >
        <template #prefix>
          <iconify-icon icon="carbon:search" />
        </template>
      </Input>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <div v-if="availableMenus.length > 0" class="grid grid-cols-3 gap-3">
        <div
          v-for="menu in availableMenus"
          :key="menu.id"
          class="menu-item group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary hover:shadow-md"
          @click="handleSelectMenu(menu)"
        >
          <!-- 图标 -->
          <div class="mb-2 flex justify-center">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100"
            >
              <iconify-icon
                :icon="getMenuIcon(menu)"
                class="text-xl text-blue-500"
              />
            </div>
          </div>

          <!-- 名称 -->
          <div class="text-center text-sm font-medium text-gray-900">
            {{ menu.name }}
          </div>

          <!-- 路径 -->
          <div
            v-if="menu.path"
            class="mt-1 truncate text-center text-xs text-gray-500"
          >
            {{ menu.path }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-8">
        <Empty
          description="没有可添加的应用"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <template #footer>
            <div class="text-sm text-gray-500">
              所有可用应用已添加，或没有符合搜索条件的应用
            </div>
          </template>
        </Empty>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.menu-list {
  max-height: 500px;
  overflow-y: auto;
}

/* 滚动条样式 */
.menu-list::-webkit-scrollbar {
  width: 6px;
}

.menu-list::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.menu-list::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}

.menu-list::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
