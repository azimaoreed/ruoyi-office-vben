# 车辆选择组件 - Vben标准实现

## 🏗️ 架构设计

本组件严格按照Vben框架的设计模式实现，遵循框架的最佳实践。

### 文件结构
```
components/
├── CarSelectModal.vue        # 车辆选择弹窗（核心组件）
├── CarSelectInput.vue        # 车辆选择输入框（表单组件）
└── README.md                # 使用说明

data/
└── car-select.ts            # 表格列配置和搜索表单配置
```

## 🎯 设计亮点

### ✅ **完全遵循Vben模式**
- 使用 `useVbenModal` 创建模态框
- 使用 `useVbenVxeGrid` 创建数据表格
- 使用标准的配置式开发
- 组件自动注册到全局适配器

### ✅ **功能特性**
- **搜索筛选**：公司名称、车辆分类、车辆名称
- **分页展示**：自动分页，支持页面大小调整
- **单选模式**：使用radio选择，清晰明了
- **双击快选**：双击行直接选择并关闭弹窗
- **状态展示**：车辆状态、分类用彩色标签显示
- **数据回填**：支持根据ID自动获取车辆信息

## 🚀 使用方法

### 1. 在表单Schema中使用

```typescript
{
  fieldName: 'carId',
  label: '车辆',
  component: 'CarSelectInput',
  componentProps: {
    placeholder: '请选择车辆',
  },
}
```

### 2. 直接在组件中使用

```vue
<template>
  <CarSelectInput
    v-model:value="carId"
    placeholder="请选择车辆"
    :disabled="false"
    @change="handleCarChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const carId = ref();

const handleCarChange = (value, car) => {
  console.log('选择的车辆ID:', value);
  console.log('选择的车辆信息:', car);
};
</script>
```

## 📋 API文档

### CarSelectInput Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number \| string` | - | 选中的车辆ID |
| `placeholder` | `string` | `'请选择车辆'` | 占位符文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### CarSelectInput Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `update:value` | `(value: number \| undefined) => void` | 值更新事件 |
| `change` | `(value: number \| undefined, car: CarApi.Car \| undefined) => void` | 值变化事件 |

### CarSelectModal Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `select` | `(car: CarApi.Car) => void` | 选择车辆事件 |

## 🔧 配置说明

### 搜索表单配置 (`useCarSelectFormSchema`)

```typescript
{
  fieldName: 'companyName',  // 公司名称筛选
  fieldName: 'carCls',       // 车辆分类筛选（1:轿车 2:SUV 3:商务车 4:货车）
  fieldName: 'carName',      // 车辆名称筛选
}
```

### 表格列配置 (`useCarSelectColumns`)

- **单选列**：radio选择模式
- **车牌号**：蓝色标签显示
- **车辆分类**：不同颜色标签（轿车/SUV/商务车/货车）
- **状态**：绿色（可用）/ 红色（不可用）
- **其他信息**：车辆名称、品牌型号、座位数、所属公司、备注

## 🌟 技术实现

### 1. **标准Vben模态框**
```typescript
const [Modal, modalApi] = useVbenModal({
  title: '选择车辆',
  class: 'w-4/5 max-w-6xl',
  async onConfirm() {
    return handleConfirm();
  },
});
```

### 2. **标准Vben表格**
```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useCarSelectFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useCarSelectColumns(),
    height: 500,
    radioConfig: { highlight: true },
    // ... 更多配置
  },
});
```

### 3. **组件全局注册**
```typescript
// adapter/component/index.ts
CarSelectInput: () => import('#/views/oa/car/carapply/components/CarSelectInput.vue'),
```

## 🎨 样式特性

- **响应式设计**：适配不同屏幕尺寸
- **主题兼容**：自动适配Vben主题色
- **交互反馈**：hover、focus、disabled状态
- **清空功能**：选中后显示清空按钮

## 📝 注意事项

1. **依赖API**：需要 `getCarPage` 和 `getCar` API正常工作
2. **全局注册**：组件已在适配器中注册，无需手动引入
3. **异步加载**：采用动态导入，按需加载
4. **类型安全**：完整的TypeScript类型定义

## 🔄 数据流程

```
用户点击输入框 → 打开弹窗 → 搜索/筛选车辆 → 选择车辆 → 关闭弹窗 → 更新输入框显示 → 触发change事件
```

这个实现完全符合Vben框架的设计理念，具有良好的可维护性和扩展性！ 