import { computed, ref } from 'vue'

export const globalLang = ref('zh-cn')
export function loadLanguages() {
  console.log('loadLanguages')
  const context = import.meta.webpackContext('./languages', {
    recursive: false,
    regExp: /\.ts$/,
  })
  const languages: any = {}
  context.keys().forEach((key: string) => {
    console.log('key', key, context(key))
    if (key === './index.ts') return
    let lang = context(key).lang
    let name = key.replace(/^\.\//, '').replace(/\.ts$/, '')
    console.log('name', name)
    languages[name] = lang
  })

  return languages
}

export const i18nt = computed(() => {
  const lang = loadLanguages()
  console.log('lang', lang)
  return lang[globalLang.value]
})

export function setLanguage(locale: string) {
  globalLang.value = locale
}
