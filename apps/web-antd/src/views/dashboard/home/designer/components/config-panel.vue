<script lang="ts" setup>
import type { GridLayoutItem } from '../../types/layout';

import type { SystemHomeComponentApi } from '#/api/system/home/component';

import { computed, ref, watch } from 'vue';

import {
  Collapse,
  CollapsePanel,
  Empty,
  Form,
  FormItem,
  Input,
  InputNumber,
  Switch,
} from 'ant-design-vue';

interface Props {
  selectedItem: GridLayoutItem | null;
  components: SystemHomeComponentApi.Component[];
}

interface Emits {
  (e: 'updateConfig', itemId: string, config: Record<string, any>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = ref<Record<string, any>>({});
const configSchema = ref<null | SystemHomeComponentApi.ConfigSchema>(null);
const activeKeys = ref<string[]>(['basic']); // 默认展开基础配置

/** 当前选中的组件定义 */
const currentComponent = computed(() => {
  if (!props.selectedItem) return null;
  return props.components.find(
    (c) => c.code === props.selectedItem?.componentCode,
  );
});

/** 解析 configSchema */
watch(
  currentComponent,
  (component) => {
    if (!component || !component.configSchema) {
      configSchema.value = null;
      formData.value = {};
      return;
    }

    try {
      configSchema.value = JSON.parse(component.configSchema);

      // 初始化表单数据（使用默认值或当前值）
      const newFormData: Record<string, any> = {};
      configSchema.value?.properties.forEach((prop) => {
        if (
          props.selectedItem?.config &&
          props.selectedItem.config[prop.key] !== undefined
        ) {
          newFormData[prop.key] = props.selectedItem.config[prop.key];
        } else if (prop.default !== undefined) {
          newFormData[prop.key] = prop.default;
        }
      });

      formData.value = newFormData;
    } catch (error) {
      console.error('Failed to parse config schema:', error);
      configSchema.value = null;
      formData.value = {};
    }
  },
  { immediate: true },
);

/** 更新配置 */
function handleUpdateConfig() {
  if (!props.selectedItem) return;
  emit('updateConfig', props.selectedItem.i, formData.value);
}

/** 根据类型获取表单组件 */
function getFormComponent(type: string) {
  switch (type) {
    case 'boolean': {
      return Switch;
    }
    case 'number': {
      return InputNumber;
    }
    default: {
      return Input;
    }
  }
}
</script>

<template>
  <div class="config-panel flex h-full flex-col bg-white">
    <div class="border-b px-4 py-3">
      <h3 class="text-base font-semibold">属性配置</h3>
      <p class="mt-1 text-xs text-gray-500">
        {{ selectedItem ? '配置选中组件的属性' : '请先选择一个组件' }}
      </p>
    </div>

    <div class="flex-1 overflow-y-auto">
      <Empty
        v-if="!selectedItem"
        description="请选择一个组件"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        class="mt-10"
      />

      <div v-else-if="!configSchema || configSchema.properties.length === 0">
        <Empty
          description="该组件暂无可配置属性"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          class="mt-10"
        />
      </div>

      <Collapse v-else v-model:active-key="activeKeys" class="config-collapse">
        <!-- 基础配置 -->
        <CollapsePanel key="basic" header="基础配置">
          <Form layout="vertical" class="px-2">
            <FormItem
              v-for="prop in configSchema.properties"
              :key="prop.key"
              :label="prop.label"
              :required="prop.required"
            >
              <!-- 颜色选择器 -->
              <div v-if="prop.type === 'color'" class="flex items-center gap-2">
                <input
                  v-model="formData[prop.key]"
                  type="color"
                  class="h-8 w-16 cursor-pointer rounded border"
                  @change="handleUpdateConfig"
                />
                <Input
                  v-model:value="formData[prop.key]"
                  :placeholder="`请输入${prop.label}`"
                  class="flex-1"
                  @change="handleUpdateConfig"
                />
              </div>

              <!-- 其他类型 -->
              <component
                :is="getFormComponent(prop.type)"
                v-else
                v-model:value="formData[prop.key]"
                :placeholder="`请输入${prop.label}`"
                class="w-full"
                @change="handleUpdateConfig"
              />
            </FormItem>
          </Form>
        </CollapsePanel>

        <!-- 组件信息 -->
        <CollapsePanel
          v-if="selectedItem && currentComponent"
          key="info"
          header="组件信息"
        >
          <div class="space-y-3 px-2 text-xs text-gray-600">
            <div class="flex justify-between">
              <span>组件名称:</span>
              <span class="font-medium">{{ currentComponent.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>组件编码:</span>
              <span class="font-mono text-gray-800">{{
                currentComponent.code
              }}</span>
            </div>
            <div class="flex justify-between">
              <span>尺寸:</span>
              <span>{{ selectedItem.w }}x{{ selectedItem.h }}</span>
            </div>
            <div class="flex justify-between">
              <span>位置:</span>
              <span>({{ selectedItem.x }}, {{ selectedItem.y }})</span>
            </div>
          </div>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>

<style scoped>
.config-panel {
  border-left: 1px solid #e8e8e8;
}

.config-collapse {
  border: none;
}

.config-collapse :deep(.ant-collapse-item) {
  border-bottom: 1px solid #f0f0f0;
}

.config-collapse :deep(.ant-collapse-header) {
  padding: 12px 16px;
  font-weight: 500;
}

.config-collapse :deep(.ant-collapse-content-box) {
  padding: 16px 12px;
}
</style>
