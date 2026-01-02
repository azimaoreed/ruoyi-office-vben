<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemHomePageApi } from '#/api/system/home';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteHomePage,
  getHomePagePage,
  setDefaultHomePage,
} from '#/api/system/home';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建首页 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑首页 */
function handleEdit(row: SystemHomePageApi.HomePage) {
  formModalApi.setData(row).open();
}

/** 删除首页 */
async function handleDelete(row: SystemHomePageApi.HomePage) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    key: 'action_key_msg',
  });
  try {
    await deleteHomePage(row.id!);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.name]),
      key: 'action_key_msg',
    });
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 设置默认首页 */
async function handleSetDefault(row: SystemHomePageApi.HomePage) {
  const hideLoading = message.loading({
    content: '设置默认首页中...',
    duration: 0,
  });
  try {
    await setDefaultHomePage(row.id!);
    message.success('设置默认首页成功');
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 进入设计器 */
function handleDesign(row: SystemHomePageApi.HomePage) {
  router.push({
    path: '/home/designer',
    query: { pageId: row.id },
  });
}

const checkedIds = ref<number[]>([]);
function handleRowCheckboxChange({
  records,
}: {
  records: SystemHomePageApi.HomePage[];
}) {
  checkedIds.value = records.map((item) => item.id!);
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    checkboxConfig: {
      reserve: true,
    },
    pagerConfig: {
      enabled: true,
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: { code: 'query' },
      search: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getHomePagePage({
            ...formValues,
            pageNo: page.currentPage,
            pageSize: page.pageSize,
          });
        },
      },
    },
  } as VxeTableGridOptions,
  gridEvents: {
    checkboxAll: handleRowCheckboxChange,
    checkboxChange: handleRowCheckboxChange,
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="首页管理">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: '新增',
              type: 'primary',
              icon: ACTION_ICON.ADD,
              onClick: handleCreate,
            },
          ]"
        />
      </template>

      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: '编辑',
              type: 'link',
              icon: ACTION_ICON.EDIT,
              onClick: () => handleEdit(row),
            },
            {
              label: '设计',
              type: 'link',
              icon: ACTION_ICON.DESIGN,
              onClick: () => handleDesign(row),
            },
            {
              label: '设为默认',
              type: 'link',
              icon: ACTION_ICON.SETTING,
              ifShow: () => !row.isDefault,
              onClick: () => handleSetDefault(row),
            },
            {
              label: '删除',
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.name]),
                confirm: () => handleDelete(row),
              },
            },
          ]"
        />
      </template>
    </Grid>

    <FormModal @success="handleRefresh" />
  </Page>
</template>
