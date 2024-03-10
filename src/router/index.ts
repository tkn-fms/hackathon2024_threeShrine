import { createRouter, createWebHistory } from 'vue-router'; //createWebHistory or createWebHashHistory
import Home from '../views/Home.vue';
import Play from '../views/Play.vue';
import Result from '../views/Result.vue';
import Retry from '../views/Retry.vue';
import ShareResult from '../views/ShareResult.vue';
//API用の作業場　＊後ほどComponentsに移動
import miyama from '../views/miyama.vue';
import takano from '../views/takano.vue';


// ルート定義
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/play',
    name: 'Play',
    component: Play,
  },
  {
    path: '/result',
    name: 'Result',
    component:  Result,
  },
  {
    path: '/retry',
    name: 'Retry',
    component:  Retry,
  },
  {
    path: '/share/:uuid',
    name: 'ShareResult',
    component:  ShareResult,
  },
  {
    path: '/miyama',
    name: 'miyama',
    component:  miyama,
  },
  {
    path: '/takano',
    name: 'takano',
    component:  takano,
  },
];

// ルーターインスタンスの作成
const router = createRouter({
  history: createWebHistory(), //createWebHistory() or createWebHashHistory(import.meta.env.BASE_URL)
  routes,
});

export default router;

