import { computed, ref } from 'vue'

export const globalLang = ref('zh-cn')
export function loadLanguages() {
  const context = import.meta.webpackContext('./languages', {
    recursive: false,
    regExp: /\.ts$/,
  })
  const languages: any = {}
  context.keys().forEach((key: string) => {
    if (key === './index.ts') return
    const lang = context(key).lang
    const name = key.replace(/^\.\//, '').replace(/\.ts$/, '')
    languages[name] = lang
  })

  return languages
}

export const i18nt = computed(() => {
  const lang = loadLanguages()
  return lang[globalLang.value]
})

export function setLanguage(locale: string) {
  globalLang.value = locale
}
