<script lang="ts" setup>
import type { CarApi } from '#/api/oa/car/carinfo';

import { computed, ref, watch } from 'vue';

import { Button, Input } from 'ant-design-vue';

import { getCar } from '#/api/oa/car/carinfo';

import CarSelectModal from './CarSelectModal.vue';

defineOptions({ name: 'CarSelectInput' });

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择车辆',
  disabled: false,
});

const emit = defineEmits<Emits>();

interface Props {
  value?: number | string;
  placeholder?: string;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:value', value: number | undefined): void;
  (e: 'change', value: number | undefined, car: CarApi.Car | undefined): void;
}

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
  { immediate: true },
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
          <svg
            class="search-icon"
            :class="{ disabled }"
            @click.stop="handleClick"
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
            fill="currentColor"
          >
            <path
              d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116 65.6-158.4C296 211.3 352.2 188 412 188s116 23.3 158.4 65.6S636 352.2 636 412s-23.3 116-65.6 158.4z"
            />
          </svg>
        </div>
      </template>
    </Input>

    <!-- 车辆选择弹窗 -->
    <CarSelectModal ref="modalRef" @select="handleCarSelect" />
  </div>
</template>

<style scoped>
.car-select-input :deep(.ant-input) {
  cursor: pointer;
}

.car-select-input :deep(.ant-input[disabled]) {
  cursor: not-allowed;
}

.search-icon {
  font-size: 14px;
  color: #00000040; /* placeholder 颜色 */
  cursor: pointer;
  transition: color 0.2s;
}

.search-icon:hover:not(.disabled) {
  color: #1890ff;
}

.search-icon.disabled {
  color: #00000025;
  cursor: not-allowed;
}
</style>
