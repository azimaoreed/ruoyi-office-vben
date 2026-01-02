import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'DashboardHome',
        path: '/home',
        component: () => import('#/views/dashboard/home/index.vue'),
        meta: {
          icon: 'lucide:home',
          title: '我的首页',
        },
      },
      {
        name: 'HomePageManage',
        path: '/home/manage',
        component: () => import('#/views/dashboard/home/manage/index.vue'),
        meta: {
          icon: 'lucide:layout-dashboard',
          title: '首页管理',
          authority: ['system:home:query'],
        },
      },
      {
        name: 'HomeComponentManage',
        path: '/home/component',
        component: () => import('#/views/dashboard/home/component/index.vue'),
        meta: {
          icon: 'lucide:component',
          title: '组件管理',
          authority: ['system:home-component:query'],
        },
      },
      {
        name: 'HomeDesigner',
        path: '/home/designer',
        component: () => import('#/views/dashboard/home/designer/index.vue'),
        meta: {
          icon: 'lucide:layout-dashboard',
          title: '首页设计器',
          hideInMenu: true,
          authority: ['system:home:update'],
        },
      },
    ],
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'ant-design:profile-outlined',
      title: $t('ui.widgets.profile'),
      hideInMenu: true,
    },
  },
];

export default routes;
