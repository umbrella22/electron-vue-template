import { RouteRecordRaw } from 'vue-router'
import notFound from '@renderer/views/not-found/index.vue'
import tools from '@renderer/views/tools/index.vue'
import SettingsGeneral from '@renderer/views/settings/general.vue'
import About from '@renderer/views/settings/about.vue'
import download from '@renderer/views/download/index.vue'
import layout from '@renderer/layout/layout-index.vue'
import fullLayout from '@renderer/layout/full-layout.vue'
import Browser from '@renderer/views/browser/index.vue'
import Print from '@renderer/views/print/index.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/:pathMatch(.*)*', component: notFound },
  {
    path: '/',
    component: layout,
    children: [
      {
        path: '',
        name: 'tools',
        component: tools,
      },
      {
        path: 'settings',
        name: 'settings',
        redirect: '/settings/general',
        children: [
          {
            path: 'general',
            name: 'general',
            component: SettingsGeneral,
          },
          {
            path: 'about',
            name: 'about',
            component: About,
          },
        ],
      },
      {
        path: 'download',
        name: 'download',
        component: download,
      },
    ],
  },
  {
    path: '/full-screen',
    name: 'full-screen',
    component: fullLayout,
    children: [
      {
        path: 'Browser',
        name: 'Browser',
        component: Browser,
      },
      {
        path: 'Print',
        name: 'Print',
        component: Print,
      },
    ],
  },
]

export default routes
