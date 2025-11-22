import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/system/notify-message',
    component: () => import('#/views/system/notify/my/index.vue'),
    name: 'MyNotifyMessage',
    meta: {
      title: '我的站内信',
      icon: 'ant-design:message-filled',
      hideInMenu: true,
    },
  },
  {
    path: '/system/dept/org-chart',
    component: () => import('#/views/system/dept/org-chart.vue'),
    name: 'SystemDeptOrgChart',
    meta: {
      title: '组织架构图',
      icon: 'ant-design:apartment-outlined',
      hideInMenu: true,
    },
  },
];

export default routes;
