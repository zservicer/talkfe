import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CustomerTalkView from "@/views/CustomerTalkView";
import LoginView from "@/views/LoginView";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta:{
      title: '客服系统'
    },
  },
  {
    path: '/customer',
    name: 'customer',
    component: CustomerTalkView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta:{
      title: '登录'
    },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
