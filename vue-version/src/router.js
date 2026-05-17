import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './components/HomeView.vue';
import DetailView from './components/DetailView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/country/:code',
    name: 'Detail',
    component: DetailView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
