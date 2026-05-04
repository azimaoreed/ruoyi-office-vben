<script setup lang="ts">
import type { Ref } from 'vue';

import type { ModifyRequestSetting, SimpleFlowNode } from '../consts';

import type { BpmProcessDefinitionApi } from '#/api/bpm/definition';
import type { BpmUserGroupApi } from '#/api/bpm/userGroup';
import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemPostApi } from '#/api/system/post';
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemUserApi } from '#/api/system/user';

import { computed, inject, onMounted, provide, ref } from 'vue';

import { BpmNodeTypeEnum } from '@vben/constants';
import { IconifyIcon } from '@vben/icons';
import { downloadFileFromBlob, isString } from '@vben/utils';

import {
  Button,
  ButtonGroup,
  Form,
  FormItem,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  SelectOption,
  Switch,
  TreeSelect,
} from 'ant-design-vue';

import {
  getProcessDefinition,
  getProcessDefinitionList,
} from '#/api/bpm/definition';

import {
  CANDIDATE_STRATEGY,
  CandidateStrategy,
  MODIFY_PROCESS_RESUME_STRATEGIES,
  ModifyProcessResumeStrategy,
  NODE_DEFAULT_NAME,
  NODE_DEFAULT_TEXT,
  REJECT_REASON_TYPES,
  RejectReasonType,
} from '../consts';
import { parseFormCreateFields, useWatchNode } from '../helpers';
import ProcessNodeTree from './process-node-tree.vue';

defineOptions({
  name: 'SimpleProcessModel',
});

const props = defineProps({
  flowNode: {
    type: Object as () => SimpleFlowNode,
    required: true,
  },
  readonly: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emits = defineEmits<{
  save: [node: SimpleFlowNode | undefined];
}>();

const processNodeTree = useWatchNode(props);

provide('readonly', props.readonly);

// TODO 可优化：拖拽有点卡顿
/** 拖拽、放大缩小等操作 */
const scaleValue = ref(100);
const MAX_SCALE_VALUE = 200;
const MIN_SCALE_VALUE = 50;
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);
const initialX = ref(0);
const initialY = ref(0);

function setGrabCursor() {
  document.body.style.cursor = 'grab';
}

function resetCursor() {
  document.body.style.cursor = 'default';
}

function startDrag(e: MouseEvent) {
  isDragging.value = true;
  startX.value = e.clientX - currentX.value;
  startY.value = e.clientY - currentY.value;
  setGrabCursor(); // 设置小手光标
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return;
  e.preventDefault(); // 禁用文本选择

  // 使用 requestAnimationFrame 优化性能
  requestAnimationFrame(() => {
    currentX.value = e.clientX - startX.value;
    currentY.value = e.clientY - startY.value;
  });
}

function stopDrag() {
  isDragging.value = false;
  resetCursor(); // 重置光标
}

function zoomIn() {
  if (scaleValue.value === MAX_SCALE_VALUE) {
    return;
  }
  scaleValue.value += 10;
}

function zoomOut() {
  if (scaleValue.value === MIN_SCALE_VALUE) {
    return;
  }
  scaleValue.value -= 10;
}

function processReZoom() {
  scaleValue.value = 100;
}

function resetPosition() {
  currentX.value = initialX.value;
  currentY.value = initialY.value;
}

/** 校验节点设置 */
const errorDialogVisible = ref(false);
let errorNodes: SimpleFlowNode[] = [];

function validateNode(
  node: SimpleFlowNode | undefined,
  errorNodes: SimpleFlowNode[],
) {
  if (node) {
    const { type, showText, conditionNodes } = node;
    if (type === BpmNodeTypeEnum.END_EVENT_NODE) {
      return;
    }
    if (type === BpmNodeTypeEnum.START_USER_NODE) {
      // 发起人节点暂时不用校验，直接校验孩子节点
      validateNode(node.childNode, errorNodes);
    }

    if (
      type === BpmNodeTypeEnum.USER_TASK_NODE ||
      type === BpmNodeTypeEnum.COPY_TASK_NODE ||
      type === BpmNodeTypeEnum.CONDITION_NODE
    ) {
      if (!showText) {
        errorNodes.push(node);
      }
      validateNode(node.childNode, errorNodes);
    }

    if (
      type === BpmNodeTypeEnum.CONDITION_BRANCH_NODE ||
      type === BpmNodeTypeEnum.PARALLEL_BRANCH_NODE ||
      type === BpmNodeTypeEnum.INCLUSIVE_BRANCH_NODE
    ) {
      // 分支节点
      // 1. 先校验各个分支
      conditionNodes?.forEach((item) => {
        validateNode(item, errorNodes);
      });
      // 2. 校验孩子节点
      validateNode(node.childNode, errorNodes);
    }
  }
}

/** 获取当前流程数据 */
async function getCurrentFlowData() {
  try {
    errorNodes = [];
    validateNode(processNodeTree.value, errorNodes);
    if (errorNodes.length > 0) {
      errorDialogVisible.value = true;
      return undefined;
    }
    return processNodeTree.value;
  } catch (error) {
    console.error('获取流程数据失败:', error);
    return undefined;
  }
}

defineExpose({
  getCurrentFlowData,
});

/** 导出 JSON */
function exportJson() {
  downloadFileFromBlob({
    fileName: 'model.json',
    source: new Blob([JSON.stringify(processNodeTree.value)]),
  });
}

/** 导入 JSON */
const refFile = ref();
function importJson() {
  refFile.value.click();
}
function importLocalFile() {
  const file = refFile.value.files[0];
  file.text().then((result: any) => {
    if (isString(result)) {
      processNodeTree.value = JSON.parse(result);
      emits('save', processNodeTree.value);
    }
  });
}

const MODIFY_REQUEST_NODE_SCOPE_TYPES = [
  { label: '全部节点', value: 1 },
  { label: '指定节点', value: 2 },
  { label: '排除节点', value: 3 },
];
const MODIFY_REQUEST_APPLICANT_STRATEGIES = new Set([
  CandidateStrategy.DEPT_MEMBER,
  CandidateStrategy.POST,
  CandidateStrategy.ROLE,
  CandidateStrategy.USER,
  CandidateStrategy.USER_GROUP,
]);
const MODIFY_REQUEST_EFFECTIVE_NODE_TYPES = new Set([
  BpmNodeTypeEnum.TRANSACTOR_NODE,
  BpmNodeTypeEnum.USER_TASK_NODE,
]);
const modifyRequestApplicantStrategyOptions = computed(() =>
  CANDIDATE_STRATEGY.filter((item) =>
    MODIFY_REQUEST_APPLICANT_STRATEGIES.has(item.value as CandidateStrategy),
  ),
);
const modifyRequestDialogVisible = ref(false);
const modifyRequestNodeIds = ref<string[]>([]);
const modifyRequestApplicantIds = ref<number[]>([]);
const modifyRequestChildProcessOptions = ref<
  BpmProcessDefinitionApi.ProcessDefinition[]
>([]);
const modifyRequestChildFieldOptions = ref<
  Array<{ label: string; value: string }>
>([]);
const roleOptions = inject<Ref<SystemRoleApi.Role[]>>('roleList', ref([]));
const postOptions = inject<Ref<SystemPostApi.Post[]>>('postList', ref([]));
const userOptions = inject<Ref<SystemUserApi.User[]>>('userList', ref([]));
const userGroupOptions = inject<Ref<BpmUserGroupApi.UserGroup[]>>(
  'userGroupList',
  ref([]),
);
const deptTreeOptions = inject<Ref<SystemDeptApi.Dept[]>>('deptTree', ref([]));
const formFields = inject<Ref<string[]>>('formFields', ref([]));
const modifyRequestChildProcessSelectOptions = computed(() =>
  modifyRequestChildProcessOptions.value.map((item) => ({
    label: `${item.name}（${item.key} / v${item.version}）`,
    value: item.key,
  })),
);
const modifyRequestParentFieldOptions = computed(() =>
  buildModifyVariableFieldOptions(parseFormCreateFields(formFields.value)),
);
const modifyRequestNodeOptions = computed(() => {
  const options: Array<{ label: string; value: string }> = [];
  const nodeIds = new Set<string>();

  function collectNode(node?: SimpleFlowNode) {
    if (!node) {
      return;
    }
    if (
      MODIFY_REQUEST_EFFECTIVE_NODE_TYPES.has(node.type) &&
      node.id &&
      !nodeIds.has(node.id)
    ) {
      nodeIds.add(node.id);
      options.push({
        label: buildModifyRequestNodeLabel(node),
        value: node.id,
      });
    }
    node.conditionNodes?.forEach((item) => collectNode(item));
    collectNode(node.childNode);
  }

  collectNode(processNodeTree.value);
  return options;
});

function buildDefaultModifyRequestSetting(): ModifyRequestSetting {
  return {
    enable: false,
    buttonName: '提交修改申请',
    applicantParam: '',
    childProcessDefinitionKey: '',
    nodeIds: [],
    nodeScopeType: 1,
    reasonTypes: [
      RejectReasonType.SUPPLEMENT,
      RejectReasonType.MODIFY,
      RejectReasonType.RISK,
      RejectReasonType.OTHER,
    ],
    resumeStrategy: ModifyProcessResumeStrategy.CONTINUE_LAST_ACTIVE_NODE,
    variableMappings: [],
  };
}

function buildModifyVariableFieldOptions(fields: Array<Record<string, any>>) {
  return fields
    .filter((item) => item?.field)
    .map((item) => {
      const field = String(item.field);
      return {
        label: `${item.title || field}（${field}）`,
        value: field,
      };
    });
}

function ensureModifyRequestSetting() {
  if (!processNodeTree.value) {
    return;
  }
  processNodeTree.value.modifyRequestSetting = {
    ...buildDefaultModifyRequestSetting(),
    ...processNodeTree.value.modifyRequestSetting,
  };
}

function parseModifyRequestApplicantParam(param?: string) {
  if (!param) {
    return [];
  }
  return param
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

function syncModifyRequestApplicantParam() {
  const setting = processNodeTree.value?.modifyRequestSetting;
  if (!setting) {
    return;
  }
  setting.applicantParam = modifyRequestApplicantIds.value.join(',');
}

function buildModifyRequestNodeLabel(node: SimpleFlowNode) {
  const nodeName = node.name || NODE_DEFAULT_NAME.get(node.type) || node.id;
  return `${nodeName}（${node.id}）`;
}

async function loadModifyRequestChildProcessOptions() {
  if (modifyRequestChildProcessOptions.value.length > 0) {
    return;
  }
  modifyRequestChildProcessOptions.value = await getProcessDefinitionList({
    suspensionState: 1,
  });
}

async function loadModifyRequestChildFieldOptions(
  childProcessDefinitionKey?: string,
) {
  modifyRequestChildFieldOptions.value = [];
  if (!childProcessDefinitionKey) {
    return;
  }
  const childDefinition =
    modifyRequestChildProcessOptions.value.find(
      (item) => item.key === childProcessDefinitionKey,
    ) || (await getProcessDefinition(undefined, childProcessDefinitionKey));
  modifyRequestChildFieldOptions.value = buildModifyVariableFieldOptions(
    parseFormCreateFields(childDefinition?.formFields),
  );
}

async function changeModifyRequestChildProcess(value: unknown) {
  const setting = processNodeTree.value?.modifyRequestSetting;
  if (!setting) {
    return;
  }
  setting.childProcessDefinitionKey =
    value === null || value === undefined ? '' : String(value);
  setting.variableMappings = [];
  await loadModifyRequestChildFieldOptions(setting.childProcessDefinitionKey);
}

async function openModifyRequestSetting() {
  ensureModifyRequestSetting();
  modifyRequestNodeIds.value = [
    ...(processNodeTree.value?.modifyRequestSetting?.nodeIds || []),
  ];
  modifyRequestApplicantIds.value = parseModifyRequestApplicantParam(
    processNodeTree.value?.modifyRequestSetting?.applicantParam,
  );
  await loadModifyRequestChildProcessOptions();
  await loadModifyRequestChildFieldOptions(
    processNodeTree.value?.modifyRequestSetting?.childProcessDefinitionKey,
  );
  modifyRequestDialogVisible.value = true;
}

function changeModifyRequestApplicantStrategy() {
  if (processNodeTree.value?.modifyRequestSetting) {
    processNodeTree.value.modifyRequestSetting.applicantParam = '';
    modifyRequestApplicantIds.value = [];
  }
}

function addModifyRequestVariableMapping() {
  ensureModifyRequestSetting();
  const setting = processNodeTree.value?.modifyRequestSetting;
  if (!setting) {
    return;
  }
  setting.variableMappings ||= [];
  setting.variableMappings.push({
    childVariable: '',
    parentVariable: '',
  });
}

function removeModifyRequestVariableMapping(index: number) {
  processNodeTree.value?.modifyRequestSetting?.variableMappings?.splice(
    index,
    1,
  );
}

function normalizeModifyRequestVariableMappings() {
  const setting = processNodeTree.value?.modifyRequestSetting;
  if (!setting) {
    return;
  }
  setting.variableMappings = (setting.variableMappings || [])
    .map((item) => ({
      childVariable: item.childVariable?.trim(),
      parentVariable: item.parentVariable?.trim(),
    }))
    .filter((item) => item.childVariable && item.parentVariable);
}

function saveModifyRequestSetting() {
  ensureModifyRequestSetting();
  const setting = processNodeTree.value?.modifyRequestSetting;
  if (!setting) {
    modifyRequestDialogVisible.value = false;
    return;
  }
  syncModifyRequestApplicantParam();
  normalizeModifyRequestVariableMappings();
  setting.nodeIds =
    setting.nodeScopeType === 1 ? [] : modifyRequestNodeIds.value;
  emits('save', processNodeTree.value);
  modifyRequestDialogVisible.value = false;
}

// 在组件初始化时记录初始位置
onMounted(() => {
  initialX.value = currentX.value;
  initialY.value = currentY.value;
});
</script>
<template>
  <div class="simple-process-model-container">
    <div class="absolute right-0 top-0 bg-card">
      <Row type="flex" justify="end">
        <ButtonGroup key="scale-control">
          <Button v-if="!readonly" @click="exportJson">
            <IconifyIcon icon="lucide:download" /> 导出
          </Button>
          <Button v-if="!readonly" @click="importJson">
            <IconifyIcon icon="lucide:upload" />导入
          </Button>
          <Button v-if="!readonly" @click="openModifyRequestSetting">
            修改申请规则
          </Button>
          <!-- 用于打开本地文件-->
          <input
            v-if="!readonly"
            type="file"
            id="files"
            ref="refFile"
            class="hidden"
            accept=".json"
            @change="importLocalFile"
          />
          <Button @click="processReZoom()">
            <IconifyIcon icon="lucide:table-columns-split" />
          </Button>
          <Button :plain="true" @click="zoomOut()">
            <IconifyIcon icon="lucide:zoom-out" />
          </Button>
          <Button class="w-20"> {{ scaleValue }}% </Button>
          <Button :plain="true" @click="zoomIn()">
            <IconifyIcon icon="lucide:zoom-in" />
          </Button>
          <Button @click="resetPosition">重置</Button>
        </ButtonGroup>
      </Row>
    </div>
    <div
      class="simple-process-model"
      :style="`transform: translate(${currentX}px, ${currentY}px) scale(${scaleValue / 100});`"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @mouseenter="setGrabCursor"
    >
      <ProcessNodeTree
        v-if="processNodeTree"
        v-model:flow-node="processNodeTree"
      />
    </div>
  </div>

  <Modal
    v-model:open="errorDialogVisible"
    title="保存失败"
    width="400"
    :fullscreen="false"
  >
    <div class="mb-2">以下节点内容不完善，请修改后保存</div>
    <div
      class="line-height-normal mb-3 rounded p-2"
      v-for="(item, index) in errorNodes"
      :key="index"
    >
      {{ item.name }} : {{ NODE_DEFAULT_TEXT.get(item.type) }}
    </div>
    <template #footer>
      <Button type="primary" @click="errorDialogVisible = false">知道了</Button>
    </template>
  </Modal>

  <Modal
    v-model:open="modifyRequestDialogVisible"
    title="修改申请规则"
    width="640px"
    :fullscreen="false"
    @ok="saveModifyRequestSetting"
  >
    <Form
      v-if="processNodeTree?.modifyRequestSetting"
      layout="vertical"
      :model="processNodeTree.modifyRequestSetting"
    >
      <FormItem label="启用通用修改申请">
        <Switch v-model:checked="processNodeTree.modifyRequestSetting.enable" />
      </FormItem>
      <FormItem label="按钮名称">
        <Input
          v-model:value="processNodeTree.modifyRequestSetting.buttonName"
          placeholder="提交修改申请"
        />
      </FormItem>
      <FormItem label="修改申请子流程">
        <Select
          v-model:value="
            processNodeTree.modifyRequestSetting.childProcessDefinitionKey
          "
          allow-clear
          show-search
          option-filter-prop="label"
          :options="modifyRequestChildProcessSelectOptions"
          placeholder="请选择已发布的修改申请子流程"
          @change="changeModifyRequestChildProcess"
        />
      </FormItem>
      <FormItem label="变量回写映射">
        <div
          v-for="(item, index) in processNodeTree.modifyRequestSetting
            .variableMappings"
          :key="index"
          class="mb-2 flex items-center gap-2"
        >
          <Select
            v-model:value="item.childVariable"
            show-search
            option-filter-prop="label"
            :options="modifyRequestChildFieldOptions"
            class="flex-1"
            placeholder="选择子流程表单字段"
          />
          <span class="text-xs text-gray-500">写回</span>
          <Select
            v-model:value="item.parentVariable"
            show-search
            option-filter-prop="label"
            :options="modifyRequestParentFieldOptions"
            class="flex-1"
            placeholder="选择主流程表单字段"
          />
          <Button @click="removeModifyRequestVariableMapping(index)">
            删除
          </Button>
        </div>
        <Button
          :disabled="
            !processNodeTree.modifyRequestSetting.childProcessDefinitionKey
          "
          @click="addModifyRequestVariableMapping"
        >
          添加映射
        </Button>
        <div class="mt-1 text-xs text-gray-500">
          子流程通过后，系统按映射把子流程表单字段写回主流程表单字段；未配置时不回写。
        </div>
      </FormItem>
      <FormItem label="允许申请人">
        <Select
          v-model:value="processNodeTree.modifyRequestSetting.applicantStrategy"
          allow-clear
          placeholder="不限制申请人"
          :options="modifyRequestApplicantStrategyOptions"
          @change="changeModifyRequestApplicantStrategy"
        />
      </FormItem>
      <FormItem
        v-if="
          processNodeTree.modifyRequestSetting.applicantStrategy ===
          CandidateStrategy.USER
        "
        label="指定用户"
      >
        <Select
          v-model:value="modifyRequestApplicantIds"
          allow-clear
          mode="multiple"
          placeholder="请选择允许提交修改申请的用户"
        >
          <SelectOption
            v-for="item in userOptions"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          >
            {{ item.nickname }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem
        v-if="
          processNodeTree.modifyRequestSetting.applicantStrategy ===
          CandidateStrategy.ROLE
        "
        label="指定角色"
      >
        <Select
          v-model:value="modifyRequestApplicantIds"
          allow-clear
          mode="multiple"
          placeholder="请选择允许提交修改申请的角色"
        >
          <SelectOption
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem
        v-if="
          processNodeTree.modifyRequestSetting.applicantStrategy ===
          CandidateStrategy.DEPT_MEMBER
        "
        label="指定部门"
      >
        <TreeSelect
          v-model:value="modifyRequestApplicantIds"
          :tree-data="deptTreeOptions"
          :field-names="{
            label: 'name',
            value: 'id',
            children: 'children',
          }"
          empty-text="加载中，请稍后"
          multiple
          :check-strictly="true"
          allow-clear
          tree-checkable
          placeholder="请选择允许提交修改申请的部门"
        />
      </FormItem>
      <FormItem
        v-if="
          processNodeTree.modifyRequestSetting.applicantStrategy ===
          CandidateStrategy.POST
        "
        label="指定岗位"
      >
        <Select
          v-model:value="modifyRequestApplicantIds"
          allow-clear
          mode="multiple"
          placeholder="请选择允许提交修改申请的岗位"
        >
          <SelectOption
            v-for="item in postOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem
        v-if="
          processNodeTree.modifyRequestSetting.applicantStrategy ===
          CandidateStrategy.USER_GROUP
        "
        label="指定用户组"
      >
        <Select
          v-model:value="modifyRequestApplicantIds"
          allow-clear
          mode="multiple"
          placeholder="请选择允许提交修改申请的用户组"
        >
          <SelectOption
            v-for="item in userGroupOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem
        v-if="!processNodeTree.modifyRequestSetting.applicantStrategy"
        label="申请人参数"
      >
        <div class="text-xs text-gray-500">
          未选择允许申请人时，不限制可提交修改申请的人员。
        </div>
      </FormItem>
      <FormItem label="生效节点范围">
        <RadioGroup
          v-model:value="processNodeTree.modifyRequestSetting.nodeScopeType"
        >
          <Radio
            v-for="item in MODIFY_REQUEST_NODE_SCOPE_TYPES"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        v-if="processNodeTree.modifyRequestSetting.nodeScopeType !== 1"
        label="生效节点"
      >
        <Select
          v-model:value="modifyRequestNodeIds"
          allow-clear
          mode="multiple"
          :options="modifyRequestNodeOptions"
          :placeholder="
            processNodeTree.modifyRequestSetting.nodeScopeType === 2
              ? '请选择允许发起修改申请的节点'
              : '请选择不允许发起修改申请的节点'
          "
        />
        <div class="mt-1 text-xs text-gray-500">
          这里根据当前流程图自动列出审批人、办理人节点，保存后使用节点 ID
          做运行时匹配。
        </div>
      </FormItem>
      <FormItem label="原因分类">
        <Select
          v-model:value="processNodeTree.modifyRequestSetting.reasonTypes"
          mode="multiple"
          :options="REJECT_REASON_TYPES"
        />
      </FormItem>
      <FormItem label="子流程完成后的恢复策略">
        <RadioGroup
          v-model:value="processNodeTree.modifyRequestSetting.resumeStrategy"
        >
          <Radio
            v-for="item in MODIFY_PROCESS_RESUME_STRATEGIES"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </Radio>
        </RadioGroup>
      </FormItem>
    </Form>
  </Modal>
</template>
