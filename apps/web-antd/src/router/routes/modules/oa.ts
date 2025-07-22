import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/oa',
    name: 'OACenter',
    meta: {
      title: '办公自动化',
      hideInMenu: false,
    },
    children: [
      {
        path: 'car/carapply/create',
        name: 'OACarApplyCreate',
        component: () => import('#/views/oa/car/carapply/detail.vue'),
        meta: {
          title: '新建用车申请单',
          activeMenu: '/oa/car/carapply',
          hideInMenu: false,
        },
      },
      {
        path: 'car/carapply/edit/:id',
        name: 'OACarApplyEdit',
        component: () => import('#/views/oa/car/carapply/detail.vue'),
        meta: {
          title: '编辑用车申请单',
          activeMenu: '/oa/car/carapply',
          hideInMenu: false,
        },
      },
      {
        path: 'car/carapply/detail/:id',
        name: 'OACarApplyDetail',
        component: () => import('#/views/oa/car/carapply/detail.vue'),
        meta: {
          title: '用车申请单详情',
          activePath: '/oa/car/carapply',
          hideInMenu: false,
          hideInBreadcrumb: false,
          hideInTab: false,
        },
      },
    ],
  },
];

export default routes;
