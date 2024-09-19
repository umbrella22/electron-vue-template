declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMeta {
  readonly env: Readonly<ImportMetaEnv>
}
interface ImportMetaEnv {
  API_HOST: string
  NODE_ENV: string
}
