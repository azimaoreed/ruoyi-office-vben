<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CarApplyBillApi } from '#/api/oa/car/carapply';

import { Page, useVbenModal } from '@vben/common-ui';
import { message,Tabs } from 'ant-design-vue';
import Form from './modules/form.vue';


import { ref, computed } from 'vue';
import { $t } from '#/locales';
import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCarApplyBillPage, deleteCarApplyBill, deleteCarApplyBillListByIds, exportCarApplyBill } from '#/api/oa/car/carapply';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { useGridColumns, useGridFormSchema } from './data';


const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});


/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 创建用车申请单 */
function handleCreate() {
  formModalApi.setData({}).open();
}

/** 编辑用车申请单 */
function handleEdit(row: CarApplyBillApi.CarApplyBill) {
  formModalApi.setData(row).open();
}


/** 删除用车申请单 */
async function handleDelete(row: CarApplyBillApi.CarApplyBill) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    key: 'action_key_msg',
  });
  try {
    await deleteCarApplyBill(row.id as number);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.id]),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除用车申请单 */
async function handleDeleteBatch() {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting'),
    key: 'action_key_msg',
  });
  try {
    await deleteCarApplyBillListByIds(checkedIds.value);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess'),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange({
  records,
}: {
  records: CarApplyBillApi.CarApplyBill[];
}) {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出表格 */
async function handleExport() {
  const data = await exportCarApplyBill(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '用车申请单.xls', source: data });
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
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
          return await getCarApplyBillPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
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
  } as VxeTableGridOptions<CarApplyBillApi.CarApplyBill>,
  gridEvents:{
      checkboxAll: handleRowCheckboxChange,
      checkboxChange: handleRowCheckboxChange,
  }
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />

    <Grid table-title="用车申请单列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['用车申请单']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['oa:car-apply-bill:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['oa:car-apply-bill:export'],
              onClick: handleExport,
            },
            {
              label: $t('ui.actionTitle.deleteBatch'),
              type: 'primary',
              danger: true,
              icon: ACTION_ICON.DELETE,
              disabled: isEmpty(checkedIds),
              auth: ['oa:car-apply-bill:delete'],
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
              auth: ['oa:car-apply-bill:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['oa:car-apply-bill:delete'],
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.id]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>

  </Page>
</template>
