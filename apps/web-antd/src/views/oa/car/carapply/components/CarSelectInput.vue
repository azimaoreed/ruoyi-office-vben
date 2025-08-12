<script lang="ts" setup>
defineOptions({ name: 'CarSelectInput' });
import type { CarApi } from '#/api/oa/car/carinfo';

import { computed, ref, watch } from 'vue';

import { Button, Input } from 'ant-design-vue';
import { Search } from '@vben/icons';

import { getCar } from '#/api/oa/car/carinfo';

import CarSelectModal from './CarSelectModal.vue';

interface Props {
  value?: number | string;
  placeholder?: string;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:value', value: number | undefined): void;
  (e: 'change', value: number | undefined, car: CarApi.Car | undefined): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择车辆',
  disabled: false,
});

const emit = defineEmits<Emits>();

const modalRef = ref<InstanceType<typeof CarSelectModal>>();
const selectedCar = ref<CarApi.Car>();

// 显示值（车牌号 + 车辆名称）
const displayValue = computed(() => {
  if (selectedCar.value) {
    return `${selectedCar.value.carNo} - ${selectedCar.value.carName}`;
  }
  return '';
});

// 点击输入框打开弹窗
const handleClick = () => {
  if (props.disabled) return;
  modalRef.value?.modalApi.open();
};

// 选择车辆
const handleCarSelect = (car: CarApi.Car) => {
  selectedCar.value = car;
  emit('update:value', car.id);
  emit('change', car.id, car);
};

// 清空选择
const handleClear = () => {
  selectedCar.value = undefined;
  emit('update:value', undefined);
  emit('change', undefined, undefined);
};

// 监听value变化，获取车辆信息
watch(
  () => props.value,
  async (newVal) => {
    if (newVal && newVal !== selectedCar.value?.id) {
      try {
        const car = await getCar(Number(newVal));
        selectedCar.value = car;
      } catch (error) {
        console.error('获取车辆信息失败:', error);
        selectedCar.value = undefined;
      }
    } else if (!newVal) {
      selectedCar.value = undefined;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="car-select-input">
    <Input
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      @click="handleClick"
    >
      <template #suffix>
        <div class="flex items-center gap-1">
          <Button
            v-if="displayValue && !disabled"
            type="text"
            size="small"
            @click.stop="handleClear"
          >
            ×
          </Button>
          <Button
            type="text"
            size="small"
            :disabled="disabled"
            @click.stop="handleClick"
          >
            <template #icon>
              <Search />
            </template>
          </Button>
        </div>
      </template>
    </Input>
    
    <!-- 车辆选择弹窗 -->
    <CarSelectModal
      ref="modalRef"
      @select="handleCarSelect"
    />
  </div>
</template>

<style scoped>
.car-select-input :deep(.ant-input) {
  cursor: pointer;
}

.car-select-input :deep(.ant-input[disabled]) {
  cursor: not-allowed;
}
</style> 