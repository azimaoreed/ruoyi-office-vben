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
  applicantName?: string;

  /**
   * 申请日期
   */
  applyDate?: string;

  /**
   * 标题
   */
  billName?: string;

  /**
   * 申请单编号
   */
  billNo?: string;
  /**
   * 所属单位
   */
  companyId?: string;
  companyName?: string;
  /**
   * 所属部门
   */
  deptCode?: string;
  deptId?: string;
  deptName?: string;

  /**
   * 审批状态
   */
  processStatus?: string;
};
