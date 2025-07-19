<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CarApi } from '#/api/oa/car/carinfo';

import { Page, useVbenModal } from '@vben/common-ui';
import { message, Card, Menu } from 'ant-design-vue';
import Form from './modules/form.vue';


import { ref, computed, watch } from 'vue';
import { $t } from '#/locales';
import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCarPage, deleteCar, deleteCarListByIds, exportCar } from '#/api/oa/car/carinfo';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';
import { DICT_TYPE, getDictOptions } from '#/utils';
import {  useUserStore } from '@vben/stores';

import { useGridColumns, useGridFormSchema } from './data';


const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const userStore = useUserStore();
// 分类选择相关状态
const selectedCarCls = ref<number | null>(null);
const carClsOptions = getDictOptions(DICT_TYPE.OA_CAR_CLS, 'number');

// 监听分类选择变化，触发表格查询
watch(selectedCarCls, () => {
  onRefresh();
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 选择分类 */
function handleSelectCarCls(carCls: number | null) {
  selectedCarCls.value = carCls;
}

/** 创建车辆信息 */
function handleCreate() {
  // 设置默认值
  const car: CarApi.Car = {
    carCls: selectedCarCls.value || undefined,
    companyId: userStore.userInfo?.companyId || undefined,
    companyName: userStore.userInfo?.companyName || undefined,
    status: 0, //  空闲
  }
  formModalApi.setData(car).open();
}

/** 编辑车辆信息 */
function handleEdit(row: CarApi.Car) {
  formModalApi.setData(row).open();
}


/** 删除车辆信息 */
async function handleDelete(row: CarApi.Car) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    key: 'action_key_msg',
  });
  try {
    await deleteCar(row.id as number);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.id]),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除车辆信息 */
async function handleDeleteBatch() {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting'),
    key: 'action_key_msg',
  });
  try {
    await deleteCarListByIds(deleteIds.value);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess'),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

const deleteIds = ref<number[]>([]) // 待删除车辆信息 ID
function setDeleteIds({
  records,
}: {
  records: CarApi.Car[];
}) {
  deleteIds.value = records.map((item) => item.id);
}

/** 导出表格 */
async function handleExport() {
  const formValues = await gridApi.formApi.getValues();
  // 合并分类筛选条件
  const exportParams = {
    ...formValues,
    ...(selectedCarCls.value !== null ? { carCls: selectedCarCls.value } : {}),
  };
  const data = await exportCar(exportParams);
  downloadFileFromBlobPart({ fileName: '车辆信息.xls', source: data });
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    wrapperClass: 'grid-cols-4',
    collapsed: true,
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 合并分类筛选条件
          const queryParams = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            ...(selectedCarCls.value !== null ? { carCls: selectedCarCls.value } : {}),
          };
          return await getCarPage(queryParams);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: { code: 'query' },
      search: true,
    },
  } as VxeTableGridOptions<CarApi.Car>,
  gridEvents:{
      checkboxAll: setDeleteIds,
      checkboxChange: setDeleteIds,
  }
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />

    <div class="flex gap-4 h-full">
      <!-- 左侧分类选择 -->
      <div class="w-64 flex-shrink-0">
        <Card title="车辆分类" size="small" class="h-full">
          <Menu
            :selectedKeys="selectedCarCls === null ? ['all'] : [String(selectedCarCls)]"
            mode="inline"
            :inline-indent="16"
            class="border-0 car-category-menu"
          >
            <Menu.Item key="all" @click="handleSelectCarCls(null)">
              <span >
                全部
              </span>
            </Menu.Item>
            <Menu.Item
              v-for="option in carClsOptions"
              :key="String(option.value)"
              @click="handleSelectCarCls(option.value)"
            >
              <span>
                {{ option.label }}
              </span>
            </Menu.Item>
          </Menu>
        </Card>
      </div>

      <!-- 右侧表格 -->
      <div class="flex-1 min-w-0">
        <Grid table-title="车辆信息列表">
          <template #toolbar-tools>
            <TableAction
              :actions="[
                {
                  label: $t('ui.actionTitle.create', ['车辆信息']),
                  type: 'primary',
                  icon: ACTION_ICON.ADD,
                  auth: ['oa:car:create'],
                  onClick: handleCreate,
                },
                {
                  label: $t('ui.actionTitle.export'),
                  type: 'primary',
                  icon: ACTION_ICON.DOWNLOAD,
                  auth: ['oa:car:export'],
                  onClick: handleExport,
                },
                {
                  label: $t('ui.actionTitle.deleteBatch'),
                  type: 'primary',
                  danger: true,
                  icon: ACTION_ICON.DELETE,
                  disabled: isEmpty(deleteIds),
                  auth: ['oa:car:delete'],
                  onClick: handleDeleteBatch,
                },
              ]"
            />
          </template>
          <template #actions="{ row }">
            <TableAction
              :actions="[
                {
                  label: $t('common.edit'),
                  type: 'link',
                  icon: ACTION_ICON.EDIT,
                  auth: ['oa:car:update'],
                  onClick: handleEdit.bind(null, row),
                },
                {
                  label: $t('common.delete'),
                  type: 'link',
                  danger: true,
                  icon: ACTION_ICON.DELETE,
                  auth: ['oa:car:delete'],
                  popConfirm: {
                    title: $t('ui.actionMessage.deleteConfirm', [row.id]),
                    confirm: handleDelete.bind(null, row),
                  },
                },
              ]"
            />
          </template>
        </Grid>
      </div>
    </div>

  </Page>
</template>

<style scoped>




/* 移除菜单整体的右边框 */
:deep(.car-category-menu.ant-menu-inline) {
  border-right: none !important;
}
</style>
