import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace CarApplyBillApi {
  /** 用车申请单信息 */
  export interface CarApplyBill {
    id: number; // ID
    billCode?: string; // 单据编号
    processInstanceId: string; // 流程实例编号
    processStatus: number; // 单据状态
    carId: number; // 车辆
    goTime: string | Dayjs; // 出车时间
    returnTime: string | Dayjs; // 回车时间
    goArea: string; // 出车地点
    returnArea: string; // 回车地点
    cause: string; // 用车事由
    applyer: string; // 申请人
    passenger: string; // 随行人
    remark: string; // 备注
    creatorName: string; // 创建者姓名
    deptId: number; // 部门ID
    deptName: string; // 部门名称
    companyId: number; // 公司ID
    companyName: string; // 公司名称
  }
}

/** 查询用车申请单分页 */
export function getCarApplyBillPage(params: PageParam) {
  return requestClient.get<PageResult<CarApplyBillApi.CarApplyBill>>('/oa/car-apply-bill/page', { params });
}

/** 查询用车申请单详情 */
export function getCarApplyBill(id: number) {
  return requestClient.get<CarApplyBillApi.CarApplyBill>(`/oa/car-apply-bill/get?id=${id}`);
}

/** 新增用车申请单 */
export function createCarApplyBill(data: CarApplyBillApi.CarApplyBill) {
  return requestClient.post('/oa/car-apply-bill/create', data);
}

/** 修改用车申请单 */
export function updateCarApplyBill(data: CarApplyBillApi.CarApplyBill) {
  return requestClient.put('/oa/car-apply-bill/update', data);
}

/** 删除用车申请单 */
export function deleteCarApplyBill(id: number) {
  return requestClient.delete(`/oa/car-apply-bill/delete?id=${id}`);
}

/** 批量删除用车申请单 */
export function deleteCarApplyBillListByIds(ids: number[]) {
  return requestClient.delete(`/oa/car-apply-bill/delete-list?ids=${ids.join(',')}`)
}

/** 导出用车申请单 */
export function exportCarApplyBill(params: any) {
  return requestClient.download('/oa/car-apply-bill/export-excel', params);
}

