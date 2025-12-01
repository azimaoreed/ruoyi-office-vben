import type { SystemDeptApi } from '#/api/system/dept';

import { ref } from 'vue';

import { getDeptList } from '#/api/system/dept';
import { handleTree } from '@vben/utils';

/** 部门树数据 */
const treeData = ref<(SystemDeptApi.Dept & { children?: SystemDeptApi.Dept[] })[]>([]);

/** 扁平化的部门列表（用于查找） */
const flatDeptList = ref<SystemDeptApi.Dept[]>([]);

/** 加载部门树数据 */
export async function loadTreeData() {
  try {
    const data = await getDeptList();
    flatDeptList.value = data || [];
    treeData.value = handleTree(data, 'id', 'parentId') || [];
  } catch (error) {
    console.error('加载部门数据失败', error);
    treeData.value = [];
    flatDeptList.value = [];
  }
}

/** 查找部门所属的公司名称 */
export function findCompanyName(deptId: number): string {
  if (!deptId) {
    return '';
  }

  // 查找当前部门
  const dept = flatDeptList.value.find((d) => d.id === deptId);
  if (!dept) {
    return '';
  }

  // 如果当前部门就是公司，返回公司名称
  if (dept.orgType === '1') {
    return dept.name;
  }

  // 递归查找父级公司
  function findParentCompany(parentId?: number): string {
    if (!parentId) {
      return '';
    }

    const parent = flatDeptList.value.find((d) => d.id === parentId);
    if (!parent) {
      return '';
    }

    // 如果父级是公司，返回公司名称
    if (parent.orgType === '1') {
      return parent.name;
    }

    // 继续向上查找
    return findParentCompany(parent.parentId);
  }

  return findParentCompany(dept.parentId);
}

export function useDeptSelectData() {
  return {
    treeData,
    loadTreeData,
    findCompanyName,
  };
}

