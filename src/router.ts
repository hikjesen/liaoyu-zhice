import { createRouter, createWebHashHistory } from "vue-router";
export default createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: "/",
      component: () => import("./views/Overview.vue"),
      meta: { title: "养殖环境总览" },
    },
    {
      path: "/evaluation",
      component: () => import("./views/Evaluation.vue"),
      meta: { title: "养殖条件评估" },
    },
    {
      path: "/scenarios",
      component: () => import("./views/Scenarios.vue"),
      meta: { title: "情景推演" },
    },
    {
      path: "/reports",
      component: () => import("./views/Reports.vue"),
      meta: { title: "评估报告" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
