import { RouteRecordRaw } from 'vue-router'
import notFound from '@renderer/views/404.vue'
import landingPage from '@renderer/views/landing-page/landing-page.vue'
import layout from '@renderer/layout/layout-index.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/:pathMatch(.*)*', component: notFound },
  {
    path: '/',
    component: layout,
    children: [
      {
        path: '',
        name: 'home',
        component: landingPage,
      },
    ],
  },
]

export default routes
