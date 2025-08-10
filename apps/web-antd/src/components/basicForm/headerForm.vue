<!--
 * @Author: zhanghui
 * @Date: 2025-08-03 19:49:31
 * @LastEditTime: 2025-08-10 21:41:03
 * @LastEditors: zhanghui
 * @Description: 表单详情页面表头
-->

<script lang="ts" setup>
import type { headerDataProps } from './typing';

import { BILL_FLOW_STATUS, getStatusColor } from '#/utils';

interface Props {
  headerData?: headerDataProps;
}
const props = withDefaults(defineProps<Props>(), {
  headerData: () => ({
    billName: '',
    applicant: '',
    billNo: '',
    applyDate: '',
    companyName: '',
    deptName: '',
    processStatus: 0,
  }),
});
// 获取审批状态名称
const getStatusName = (val: any) => {
  const name: any = BILL_FLOW_STATUS.find((item: any) => item.value === val);
  return name?.label || '草稿';
};
</script>
<template>
  <div class="header-form">
    <a-row>
      <a-flex justify="space-between" class="flex-box">
        <div>
          <span class="title-name">{{ props.headerData.billName }}</span>
          <span class="document-num">
            单据编号: {{ props.headerData.billNo }}
          </span>
        </div>
        <div>
          <a-tag
            :color="getStatusColor(props.headerData.processStatus)?.status"
          >
            {{ getStatusName(props.headerData.processStatus) }}
          </a-tag>
        </div>
      </a-flex>
    </a-row>
    <a-row class="mt-4">
      <a-flex wrap="wrap" gap="50">
        <span> 申请人 : {{ props.headerData.applicantName }} </span>
        <span> 申请日期 : {{ props.headerData.applyDate }} </span>
        <span> 所属单位 : {{ props.headerData.companyName }} </span>
        <span> 所属部门 : {{ props.headerData.deptName }} </span>
      </a-flex>
    </a-row>
  </div>
</template>
<style scoped>
.flex-box {
  flex: 1;
}

.title-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 18px;
  color: #333;
}

.document-num {
  padding-left: 20px;
  font-size: 14px;
  line-height: 18px;
  color: #333;
}
</style>
