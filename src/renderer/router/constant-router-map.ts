import { RouteRecordRaw } from 'vue-router'
import notFound from '@renderer/views/404.vue'
import landingPage from '@renderer/views/landing-page/landing-page.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/:pathMatch(.*)*', component: notFound },
  { path: '/', name: '总览', component: landingPage },
]

export default routes
