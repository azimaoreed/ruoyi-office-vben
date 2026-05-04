import type { PageParam, PageResult } from '@vben/request';

import type { BpmProcessInstanceApi } from '../processInstance';

import { requestClient } from '#/api/request';

export enum BpmTaskRejectModeEnum {
  CONTINUE_AFTER_MODIFY = 3,
  FINISH_PROCESS = 1,
  RETURN_AND_REPLAY = 2,
}

export enum BpmTaskRejectReasonTypeEnum {
  MODIFY = 2,
  OTHER = 4,
  RISK = 3,
  SUPPLEMENT = 1,
}

export enum BpmModifyChildProcessResumeStrategyEnum {
  CONTINUE_LAST_ACTIVE_NODE = 1,
  RETURN_TO_TARGET_NODE = 2,
}

export namespace BpmTaskApi {
  /** BPM 流程监听器 */
  export interface Task {
    processInstance: any;
    id: string; // 编号
    name: string; // 监听器名字
    type: string; // 监听器类型
    status: number; // 监听器状态
    event: string; // 监听事件
    valueType: string; // 监听器值类型
    taskDefinitionKey: string; // 任务定义key
  }

  // 流程任务
  export interface TaskManager {
    id: string; // 编号
    name: string; // 任务名称
    createTime: number; // 创建时间
    endTime: number; // 结束时间
    durationInMillis: number; // 持续时间
    status: number; // 状态
    reason: string; // 原因
    ownerUser: any; // 负责人
    assigneeUser: any; // 处理人
    taskDefinitionKey: string; // 任务定义key
    processInstanceId: string; // 流程实例id
    processInstance: BpmProcessInstanceApi.ProcessInstance; // 流程实例
    parentTaskId: any; // 父任务id
    children: any; // 子任务
    formId: any; // 表单id
    formName: any; // 表单名称
    formConf: any; // 表单配置
    formFields: any; // 表单字段
    formVariables: any; // 表单变量
    buttonsSetting: any; // 按钮设置
    signEnable: any; // 签名设置
    reasonRequire: any; // 原因设置
    nodeType: any; // 节点类型
  }

  export interface RejectTaskReq {
    id: string;
    reason?: string;
    rejectMode: BpmTaskRejectModeEnum;
    targetTaskDefinitionKey?: string;
    rejectReasonType: BpmTaskRejectReasonTypeEnum;
    rejectDetail: string;
    variables?: Record<string, any>;
    childProcessDefinitionKey?: string;
    modifyPayload?: Record<string, any>;
    resumeStrategy?: BpmModifyChildProcessResumeStrategyEnum;
  }

  export interface ReturnTaskNode {
    name: string;
    taskDefinitionKey: string;
  }

  export interface StartModifyChildProcessReq {
    id: string;
    childProcessDefinitionKey: string;
    reasonType?: BpmTaskRejectReasonTypeEnum;
    reasonDetail: string;
    modifyPayload?: Record<string, any>;
    resumeStrategy: BpmModifyChildProcessResumeStrategyEnum;
  }

  export interface ModifyRequest {
    id: number;
    processInstanceId: string;
    processDefinitionId: string;
    taskId: string;
    taskDefinitionKey: string;
    applicantUserId: number;
    acceptUserId?: number;
    childProcessDefinitionKey: string;
    childProcessInstanceId?: string;
    parentChildLinkId?: number;
    reasonType?: BpmTaskRejectReasonTypeEnum;
    reasonDetail: string;
    modifyPayloadJson?: string;
    status: number;
    acceptReason?: string;
    rejectReason?: string;
    createTime?: string;
  }

  export interface ModifyRequestCreateReq {
    processInstanceId: string;
    taskId?: string;
    reasonType?: BpmTaskRejectReasonTypeEnum;
    reasonDetail: string;
    modifyPayload?: Record<string, any>;
    childProcessDefinitionKey?: string;
    resumeStrategy?: BpmModifyChildProcessResumeStrategyEnum;
  }

  export interface ModifyRequestHandleReq {
    reason?: string;
  }

  export interface CopyTaskReq {
    id: string;
    copyUserIds?: number[];
    copyRoleIds?: number[];
    copyDeptIds?: number[];
    reason?: string;
  }
}

/** 查询待办任务分页 */
export async function getTaskTodoPage(params: PageParam) {
  return requestClient.get<PageResult<BpmTaskApi.Task>>('/bpm/task/todo-page', {
    params,
  });
}

/** 查询已办任务分页 */
export async function getTaskDonePage(params: PageParam) {
  return requestClient.get<PageResult<BpmTaskApi.Task>>('/bpm/task/done-page', {
    params,
  });
}

/** 查询任务管理分页 */
export async function getTaskManagerPage(params: PageParam) {
  return requestClient.get<PageResult<BpmTaskApi.Task>>(
    '/bpm/task/manager-page',
    { params },
  );
}

/** 审批任务 */
export const approveTask = async (data: any) => {
  return await requestClient.put('/bpm/task/approve', data);
};

/** 驳回任务 */
export const rejectTask = async (data: BpmTaskApi.RejectTaskReq) => {
  return await requestClient.put('/bpm/task/reject', data);
};

/** 发起修改申请子流程 */
export const startModifyChildProcess = async (
  data: BpmTaskApi.StartModifyChildProcessReq,
) => {
  return await requestClient.put('/bpm/task/start-modify-child-process', data);
};

/** 提交通用修改申请 */
export const createModifyRequest = async (
  data: BpmTaskApi.ModifyRequestCreateReq,
) => {
  return await requestClient.post('/bpm/modify-request/create', data);
};

/** 查询任务下待接受的修改申请 */
export const getPendingModifyRequestListByTaskId = async (taskId: string) => {
  return await requestClient.get<BpmTaskApi.ModifyRequest[]>(
    '/bpm/modify-request/pending-by-task',
    { params: { taskId } },
  );
};

/** 查询流程实例下的修改申请 */
export const getModifyRequestListByProcessInstanceId = async (
  processInstanceId: string,
) => {
  return await requestClient.get<BpmTaskApi.ModifyRequest[]>(
    '/bpm/modify-request/list-by-process-instance',
    { params: { processInstanceId } },
  );
};

/** 接受通用修改申请 */
export const acceptModifyRequest = async (
  id: number,
  data: BpmTaskApi.ModifyRequestHandleReq,
) => {
  return await requestClient.put(`/bpm/modify-request/${id}/accept`, data);
};

/** 拒绝通用修改申请 */
export const rejectModifyRequest = async (
  id: number,
  data: BpmTaskApi.ModifyRequestHandleReq,
) => {
  return await requestClient.put(`/bpm/modify-request/${id}/reject`, data);
};

/** 根据流程实例 ID 查询任务列表 */
export const getTaskListByProcessInstanceId = async (id: string) => {
  return await requestClient.get(
    `/bpm/task/list-by-process-instance-id?processInstanceId=${id}`,
  );
};

/** 获取所有可退回的节点 */
export const getTaskListByReturn = async (id: string) => {
  return await requestClient.get<BpmTaskApi.ReturnTaskNode[]>(
    `/bpm/task/list-by-return?id=${id}`,
  );
};

// 委派
export const delegateTask = async (data: any) => {
  return await requestClient.put('/bpm/task/delegate', data);
};

// 转派
export const transferTask = async (data: any) => {
  return await requestClient.put('/bpm/task/transfer', data);
};

// 加签
export const signCreateTask = async (data: any) => {
  return await requestClient.put('/bpm/task/create-sign', data);
};

// 减签
export const signDeleteTask = async (data: any) => {
  return await requestClient.delete('/bpm/task/delete-sign', data);
};

// 抄送
export const copyTask = async (data: BpmTaskApi.CopyTaskReq) => {
  return await requestClient.put('/bpm/task/copy', data);
};

// 获取我的待办任务
export const myTodoTask = async (processInstanceId: string) => {
  return await requestClient.get(
    `/bpm/task/my-todo?processInstanceId=${processInstanceId}`,
  );
};

// 获取加签任务列表
export const getChildrenTaskList = async (id: string) => {
  return await requestClient.get(
    `/bpm/task/list-by-parent-task-id?parentTaskId=${id}`,
  );
};

// 撤回任务
export const withdrawTask = async (taskId: string) => {
  return await requestClient.put('/bpm/task/withdraw', null, {
    params: { taskId },
  });
};

// 撤回流程到开始节点
export const withdrawProcessToStart = async (data: any) => {
  return await requestClient.put('/bpm/task/withdraw-to-start', data);
};
