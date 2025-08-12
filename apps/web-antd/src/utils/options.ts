/*
 * @Author: zhanghui
 * @Date: 2025-08-08 15:58:07
 * @LastEditTime: 2025-08-08 16:21:57
 * @LastEditors: zhanghui
 * @Description:
 */
/**
 * 审批状态枚举
 */

import { BpmProcessInstanceStatus } from "./constants";

export const BILL_FLOW_STATUS = [
  {
    value: BpmProcessInstanceStatus.NOT_START,
    label: '未开始',
  },
  {
    value: BpmProcessInstanceStatus.RUNNING,
    label: '审批中',
  },
  {
    value: BpmProcessInstanceStatus.APPROVE,
    label: '审批通过',
  },
  {
    value: BpmProcessInstanceStatus.REJECT,
    label: '审批拒绝',
  },
  {
    value: BpmProcessInstanceStatus.CANCEL,
    label: '已撤销',
  },
];
