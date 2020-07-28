const Notfound = () => import('@/views/404')
export default [
  { path: '*', component: Notfound },
  { path: '/', name: '总览', component: () => import('@/components/LandingPage') }
]
