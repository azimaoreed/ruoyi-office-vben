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
  <div class="form-footer">
    <div class="footer-content">
      <div class="button-group">
        <Button @click="handleClose" class="action-btn close-btn">
          <span class="btn-icon">✕</span>
          关闭
        </Button>
        <Button
          v-if="!isView"
          type="default"
          :loading="saving"
          @click="handleSave"
          class="action-btn save-btn"
        >
          <span class="btn-icon">💾</span>
          保存
        </Button>
        <Button
          v-if="!isView"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          class="action-btn submit-btn"
        >
          <span class="btn-icon">📤</span>
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
  border-radius: 0 0 12px 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.footer-content {
  padding: 20px 24px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.action-btn {
  min-width: 100px;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.close-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.close-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.save-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  color: white;
}

.save-btn:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  color: white;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
}

.btn-icon {
  font-size: 14px;
  opacity: 0.9;
}

/* Loading状态优化 */
:deep(.ant-btn-loading-icon) {
  margin-right: 8px;
}
</style>
