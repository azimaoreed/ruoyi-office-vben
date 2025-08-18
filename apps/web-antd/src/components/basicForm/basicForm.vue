<!--
 * @Author: zhanghui
 * @Date: 2025-07-26 16:10:54
 * @LastEditTime: 2025-08-10 21:34:05
 * @LastEditors: zhanghui
 * @Description:
-->

<script lang="ts" setup>
import type { CSSProperties } from 'vue';

import type { headerDataProps } from './typing';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { getProcessInstanceBpmnModelView } from '#/api/bpm/processInstance';
import ProcessInstanceSimpleViewer from '#/views/bpm/processInstance/detail/modules/simple-bpm-viewer.vue';

import flowSteps from './flowSteps.vue';
import footerForm from './footerForm.vue';
import headerForm from './headerForm.vue';
import { BpmProcessInstanceStatus } from '#/utils';

interface Props {
  headerData?: headerDataProps;
  isFlowHidden?: boolean; // 是否隐藏流程信息
}
const props = withDefaults(defineProps<Props>(), {
  headerData: () => ({
    billName: '',
    creatorName: '',
    billCode: '',
    createDate: new Date().toISOString().split('T')[0],
    companyName: '',
    deptName: '',
    processStatus: BpmProcessInstanceStatus.NOT_START,
  }),
  isFlowHidden: false,
});

const emit = defineEmits(['close', 'save', 'submit']);

const processInstanceLoading = ref(false); // 流程实例的加载中
const processModelView = ref<any>({}); // 流程模型视图

// 表头样式
const headerStyle: CSSProperties = {
  textAlign: 'center',
  height: 'auto',
  lineHeight: '20px',
  backgroundColor: '#fff',
  padding: '20px',
};

const contentStyle: CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  padding: '20px',
};

const footerStyle: CSSProperties = {
  textAlign: 'center',
  background: '#fff',
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  margin: '10px 0 0',
  padding: '10px 0',
};
// 当前tab标签
const activeKey = ref('1');
// 当前步骤
const currentStep = ref(1);
const steps = [
  {
    title: '填写申请单',
    content: '填写',
  },
  {
    title: '资金计划虚拟节点',
    content: '填写基本信息完成账户创建',
    tags: '或签',
  },
  {
    title: '主管',
    content: '8451256615',
  },
  {
    title: '分管领导',
    content: '8451256615',
  },
];
const approvalData = [
  {
    approName: '主管',
    approContent: [
      {
        userName: '张三',
        time: '2023-08-10 10:10:10',
        option: '同',
        status: 4,
        statusName: '撤回',
      },
      {
        userName: '李四',
        time: '2023-08-10 12:10:10',
        option: '同意',
        status: 1,
        statusName: '同意',
      },
    ],
  },
  {
    approName: '领导领导',
    approContent: [
      {
        userName: '张三',
        time: '2023-08-10 10:10:10',
        option: '同意',
        status: 2,
        statusName: '同意',
      },
    ],
  },
];
/** 获取流程模型视图*/
async function getProcessModelView() {
  // if (BpmModelType.BPMN === processDefinition.value?.modelType) {
  //   // 重置，解决 BPMN 流程图刷新不会重新渲染问题
  processModelView.value = {
    bpmnXml: '',
  };
  // }
  const data = await getProcessInstanceBpmnModelView(
    '7d58300b-74fb-11f0-a00c-366f242a7421',
  );
  if (data) {
    processModelView.value = data;
  }
}
// 关闭
const closeForm = () => {
  emit('close');
};
// 保存
const saveForm = () => {
  emit('save');
};
// 提交
const submitForm = () => {
  emit('submit');
};
/** 初始化 */
onMounted(async () => {
  // 获得流程模型视图
  getProcessModelView();
});
</script>
<template>
  <Page  auto-content-height class="mx-6 border-b bg-white">
    <a-layout  style="min-height: 100%; background: #fff">
      <a-layout-header :style="headerStyle">
        <!-- 表头部分 -->
        <headerForm :header-data="props.headerData" />
      </a-layout-header>
      <a-divider style="width: auto; margin: -5px -15px -10px" />
      <a-layout-content :style="contentStyle">
        <!-- 主体部分 -->
        <a-tabs v-model:active-key="activeKey">
          <a-tab-pane key="1" tab="单据信息">
            <slot name="base-form"></slot>
          </a-tab-pane>
          <a-tab-pane
            key="2"
            tab="审批信息"
            v-if="props.headerData.processStatus && !props.isFlowHidden"
          >
            <flowSteps
              :steps="steps"
              :current-step="currentStep"
              :approval-data="approvalData"
            />
          </a-tab-pane>
          <a-tab-pane
            key="3"
            tab="流程图"
            :force-render="true"
            v-if="props.headerData.processStatus && !props.isFlowHidden"
          >
            <div class="h-full">
              <ProcessInstanceSimpleViewer
                :loading="processInstanceLoading"
                :model-view="processModelView"
              />
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-layout-content>
      <a-divider style="width: auto; margin: -5px -15px -10px" />
      <a-layout-footer :style="footerStyle">
        <!-- 底部按钮 -->
        <footerForm @submit="submitForm" @close="closeForm" @save="saveForm" />
      </a-layout-footer>
    </a-layout>
  </Page>
</template>
<style lang="scss" scoped>
:deep(.ant-tabs-content) {
  height: calc(100vh - 360px);
  overflow-y: auto;
}
</style>
