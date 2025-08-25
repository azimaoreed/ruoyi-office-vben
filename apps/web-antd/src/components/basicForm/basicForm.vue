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

import { onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { getProcessInstanceBpmnModelView, getApprovalDetail } from '#/api/bpm/processInstance';
import ProcessInstanceSimpleViewer from '#/views/bpm/processInstance/detail/modules/simple-bpm-viewer.vue';

import FooterForm from './footerForm.vue';
import HeaderForm from './headerForm.vue';
import BpmProcessInstanceTimeline from '#/views/bpm/processInstance/detail/modules/time-line.vue';
import BpmProcessInstanceTaskList from '#/views/bpm/processInstance/detail/modules/task-list.vue';
import { BpmProcessInstanceStatus } from '#/utils';

interface Props {
  headerData?: headerDataProps;
  isFlowHidden?: boolean; // 是否隐藏流程信息
  timelineDirection?: 'vertical' | 'horizontal'; // 时间轴方向
  activityNodes?: any[]; // 审批节点信息
}
const props = withDefaults(defineProps<Props>(), {
  headerData: () => ({
    billName: '',
    creatorName: '',
    billCode: '',
    createDate: '',
    companyName: '',
    deptName: '',
    processStatus: BpmProcessInstanceStatus.NOT_START,
  }),
  isFlowHidden: false,
  timelineDirection: 'horizontal',
  activityNodes: () => [],
});

const emit = defineEmits(['close', 'save', 'submit', 'revoke']);

const processInstanceLoading = ref(false); // 流程实例的加载中
const processModelView = ref<any>({}); // 流程模型视图
const approvalDetailLoading = ref(false); // 审批详情的加载中
const activityNodes = ref<any[]>([]); // 审批节点数据
const taskListRef = ref<any>(null); // 任务列表引用
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
/** 获取流程模型视图*/
async function getProcessModelView() {
  // 如果没有流程实例ID，则不获取流程模型视图
  if (!props.headerData.processInstanceId) {
    return;
  }
  
  try {
    processInstanceLoading.value = true;
    // 重置，解决 BPMN 流程图刷新不会重新渲染问题
    processModelView.value = {
      bpmnXml: '',
    };
    
    const data = await getProcessInstanceBpmnModelView(
      props.headerData.processInstanceId
    );
    if (data) {
      processModelView.value = data;
    }
  } catch (error) {
    console.error('获取流程模型视图失败:', error);
  } finally {
    processInstanceLoading.value = false;
  }
}

/** 获取审批详情 */
async function getApprovalDetailData() {
  // 如果没有流程实例ID，则不获取审批详情
  if (!props.headerData.processInstanceId) {
    return;
  }
  
  try {
    approvalDetailLoading.value = true;
    // 重置审批节点数据
    activityNodes.value = [];
    
    const data = await getApprovalDetail({
      processInstanceId: props.headerData.processInstanceId
    });
    
    if (data && data.activityNodes) {
      activityNodes.value = data.activityNodes;
    }
  } catch (error) {
    console.error('获取审批详情失败:', error);
  } finally {
    approvalDetailLoading.value = false;
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
// 撤回
const revokeForm = () => {
  emit('revoke');
};
// 监听 processInstanceId 变化，有值时加载流程图和审批详情
watch(
  () => props.headerData.processInstanceId,
  (newProcessInstanceId) => {
    if (newProcessInstanceId) {
      getProcessModelView();
      getApprovalDetailData();
      taskListRef.value?.refresh();
    }
  },
  { immediate: true }
);



/** 手动刷新所有数据 */
function refreshAllData() {
  if (props.headerData.processInstanceId) {
    getProcessModelView();
    getApprovalDetailData();
    taskListRef.value?.refresh();
  }
}

/** 初始化 */
onMounted(async () => {
  // 如果已经有 processInstanceId，立即加载流程模型视图和审批详情
  if (props.headerData.processInstanceId) {
    getProcessModelView();
    getApprovalDetailData();
  }
});

// 暴露方法给父组件使用
defineExpose({
  refreshAllData
});
</script>
<template>
  <Page  auto-content-height class="mx-6 border-b bg-white">
    <a-layout  style="min-height: 100%; background: #fff">
      <a-layout-header :style="headerStyle">
        <!-- 表头部分 -->
        <HeaderForm :header-data="props.headerData" />
      </a-layout-header>
      <a-divider style="width: auto; margin: -5px -15px -10px" />
      <a-layout-content :style="contentStyle">
        <!-- 主体部分 -->
        <a-tabs v-model:active-key="activeKey">
          <a-tab-pane key="1" :tab="$t('common.billInfo')">
            <slot name="base-form"></slot>
          </a-tab-pane>
          <a-tab-pane
            key="2"
            :tab="$t('common.approvalInfo')"
            v-if="props.headerData.processStatus && !props.isFlowHidden"
          >
            <div v-if="approvalDetailLoading" class="flex justify-center items-center py-20">
              <a-spin size="large" />
            </div>
            <div v-else>
              <div class="card-head">
                <span class="card-head-text">{{ $t('common.approvalProgress') }}</span>
              </div>
              <BpmProcessInstanceTimeline
                :activity-nodes="activityNodes.length > 0 ? activityNodes : props.activityNodes"
                :direction="props.timelineDirection"
                :show-status-icon="true"
                :enable-approve-user-select="false"
              />
            </div>

            <div class="card-head">
                <span class="card-head-text">{{ $t('common.approvalRecord') }}</span>
              </div>
            <div class="h-full">
                <BpmProcessInstanceTaskList
                  v-if="props.headerData.processInstanceId"
                  ref="taskListRef"
                  :loading="processInstanceLoading"
                  :id="props.headerData.processInstanceId"
                />
              </div>
          </a-tab-pane>
          <a-tab-pane
            key="3"
            :tab="$t('common.processFlow')"
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
        <FooterForm @submit="submitForm" @close="closeForm" @save="saveForm" @revoke="revokeForm" :process-status="props.headerData.processStatus" />
      </a-layout-footer>
    </a-layout>
  </Page>
</template>
<style lang="scss" scoped>
:deep(.ant-tabs-content) {
  height: calc(100vh - 360px);
  overflow-y: auto;
}
.card-head {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 20px;
  font-weight: 700;
  color: hsl(var(--primary));

  .card-head-text::before {
    display: inline-block;
    width: 4px;
    height: 12px;
    margin-right: 8px;
    content: ' ';
    background: hsl(var(--primary));
    border-radius: 2px;
  }
}

</style>
