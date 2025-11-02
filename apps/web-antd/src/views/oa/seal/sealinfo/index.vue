<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SealApi } from '#/api/oa/seal/sealinfo';

import { ref, watch } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { useUserStore } from '@vben/stores';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { Card, Menu, message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSeal,
  deleteSealListByIds,
  exportSeal,
  getSealPage,
} from '#/api/oa/seal/sealinfo';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const userStore = useUserStore();
// 分类选择相关状态
const selectedSealCls = ref<null | number>(null);
const sealClsOptions = getDictOptions(DICT_TYPE.OA_SEAL_CLS, 'number');

// 监听分类选择变化，触发表格查询
watch(selectedSealCls, () => {
  onRefresh();
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 选择分类 */
function handleSelectSealCls(sealCls: null | number) {
  selectedSealCls.value = sealCls;
}

/** 创建印章信息 */
function handleCreate() {
  // 设置默认值
  const seal: SealApi.Seal = {
    sealCls: selectedSealCls.value || undefined,
    companyId: userStore.userInfo?.companyId || undefined,
    companyName: userStore.userInfo?.companyName || undefined,
    status: 0, // 在库
  };
  formModalApi.setData(seal).open();
}

/** 编辑印章信息 */
function handleEdit(row: SealApi.Seal) {
  formModalApi.setData(row).open();
}

/** 删除印章信息 */
async function handleDelete(row: SealApi.Seal) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    key: 'action_key_msg',
  });
  try {
    await deleteSeal(row.id as number);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.id]),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除印章信息 */
async function handleDeleteBatch() {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting'),
    key: 'action_key_msg',
  });
  try {
    await deleteSealListByIds(deleteIds.value);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess'),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

const deleteIds = ref<number[]>([]); // 待删除印章信息 ID
function setDeleteIds({ records }: { records: SealApi.Seal[] }) {
  deleteIds.value = records
    .map((item) => item.id)
    .filter((id): id is number => id !== undefined);
}

/** 导出表格 */
async function handleExport() {
  const formValues = await gridApi.formApi.getValues();
  // 合并分类筛选条件
  const exportParams = {
    ...formValues,
    ...(selectedSealCls.value === null ? {} : { sealCls: selectedSealCls.value }),
  };
  const data = await exportSeal(exportParams);
  downloadFileFromBlobPart({ fileName: '印章信息.xls', source: data });
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
            ...(selectedSealCls.value === null
              ? {}
              : { sealCls: selectedSealCls.value }),
          };
          return await getSealPage(queryParams);
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
  } as VxeTableGridOptions<SealApi.Seal>,
  gridEvents: {
    checkboxAll: setDeleteIds,
    checkboxChange: setDeleteIds,
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />

    <div class="flex h-full gap-4">
      <!-- 左侧分类选择 -->
      <div class="w-64 flex-shrink-0">
        <Card title="印章分类" size="small" class="h-full">
          <Menu
            :selected-keys="
              selectedSealCls === null ? ['all'] : [String(selectedSealCls)]
            "
            mode="inline"
            :inline-indent="16"
            class="seal-category-menu border-0"
          >
            <Menu.Item key="all" @click="handleSelectSealCls(null)">
              <span> 全部 </span>
            </Menu.Item>
            <Menu.Item
              v-for="option in sealClsOptions"
              :key="String(option.value)"
              @click="handleSelectSealCls(Number(option.value))"
            >
              <span>
                {{ option.label }}
              </span>
            </Menu.Item>
          </Menu>
        </Card>
      </div>

      <!-- 右侧表格 -->
      <div class="min-w-0 flex-1">
        <Grid table-title="印章信息列表">
          <template #toolbar-tools>
            <TableAction
              :actions="[
                {
                  label: $t('ui.actionTitle.create', ['印章信息']),
                  type: 'primary',
                  icon: ACTION_ICON.ADD,
                  auth: ['oa:seal:create'],
                  onClick: handleCreate,
                },
                {
                  label: $t('ui.actionTitle.export'),
                  type: 'primary',
                  icon: ACTION_ICON.DOWNLOAD,
                  auth: ['oa:seal:export'],
                  onClick: handleExport,
                },
                {
                  label: $t('ui.actionTitle.deleteBatch'),
                  type: 'primary',
                  danger: true,
                  icon: ACTION_ICON.DELETE,
                  disabled: isEmpty(deleteIds),
                  auth: ['oa:seal:delete'],
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
                  auth: ['oa:seal:update'],
                  onClick: handleEdit.bind(null, row),
                },
                {
                  label: $t('common.delete'),
                  type: 'link',
                  danger: true,
                  icon: ACTION_ICON.DELETE,
                  auth: ['oa:seal:delete'],
                  popConfirm: {
                    title: $t('ui.actionMessage.deleteConfirm', [row.sealNo]),
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
:deep(.seal-category-menu.ant-menu-inline) {
  border-right: none !important;
}
</style>

