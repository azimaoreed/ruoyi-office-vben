import type { Dayjs } from "dayjs";

/*
 * @Author: zhanghui
 * @Date: 2025-07-26 17:16:44
 * @LastEditTime: 2025-08-08 16:23:31
 * @LastEditors: zhanghui
 * @Description:
 */
export type headerDataProps = {
  /**
   * 申请人
   */
  creatorName?: string;

  /**
   * 申请日期
   */
  createTime?: string | Date;

  /**
   * 标题
   */
  billName?: string;

  /**
   * 申请单编号
   */
  billCode?: string;
  /**
   * 所属单位
   */
  companyId?: number;
  companyName?: string;
  /**
   * 所属部门
   */
  deptId?: number;
  deptName?: string;

  /**
   * 审批状态
   */
  processStatus?: number;

  /**
   * 流程实例ID
   */
  processInstanceId?: string;
};
