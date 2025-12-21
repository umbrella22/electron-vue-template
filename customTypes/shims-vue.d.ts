declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface OtherParams {
  recursive: boolean
  regExp: RegExp
}

interface ImportMeta {
  readonly env: Readonly<ImportMetaEnv>
  webpackContext: (path: string, options: OtherParams) => any
}
interface ImportMetaEnv {
  API_HOST: string
  NODE_ENV: string
}
