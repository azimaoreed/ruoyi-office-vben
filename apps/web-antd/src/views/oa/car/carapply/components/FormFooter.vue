<script lang="ts" setup>
import { Button } from 'ant-design-vue';

interface Props {
  isView?: boolean;
  saving?: boolean;
  submitting?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save'): void;
  (e: 'submit'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isView: false,
  saving: false,
  submitting: false,
});

const emit = defineEmits<Emits>();

// 关闭按钮处理
function handleClose() {
  emit('close');
}

// 保存按钮处理
function handleSave() {
  emit('save');
}

// 提交按钮处理
function handleSubmit() {
  emit('submit');
}
</script>

<template>
  <div class="form-footer border-t border-gray-200 bg-white">
    <div class="px-6 py-4">
      <div class="flex items-center justify-center space-x-3">
        <Button @click="handleClose" class="min-w-20"> 关闭 </Button>
        <Button
          v-if="!isView"
          type="default"
          :loading="saving"
          @click="handleSave"
          class="min-w-20"
        >
          保存
        </Button>
        <Button
          v-if="!isView"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          class="min-w-20"
        >
          提交
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  border-radius: 0 0 8px 8px;
}

.min-w-20 {
  min-width: 80px;
}
</style>
