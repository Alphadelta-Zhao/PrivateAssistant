import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from '~/config/progress.ts';

const basicRoutes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('~/pages/home.vue') },
  { path: '/konva', component: () => import('~/pages/konva.vue') },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: basicRoutes as unknown as RouteRecordRaw[],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// Injection Progress
router.beforeEach(() => {
  if (!NProgress.isStarted()) {
    NProgress.start();
  }
});

router.afterEach(() => {
  NProgress.done();
});
