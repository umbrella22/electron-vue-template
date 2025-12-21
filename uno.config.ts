import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetWind4 from '@unocss/preset-wind4'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
      },
      collections: {
        tdesign: () =>
          import('@iconify-json/tdesign/icons.json').then((i) => i.default),
      },
    }),
    presetTypography(),
    presetWind4({
      dark: 'class',
      preflights: {
        reset: true,
      },
    }),
  ],
  theme: {
    colors: {
      bg: 'var(--background-color)',
      text: 'var(--text-color)',
      primary: 'var(--primary-color)',
      secondary: 'var(--secondary-color)',
      view: 'var(--main-view-bg-color)',
      glass: 'var(--glass)',
      glassStrong: 'var(--glass-strong)',
      borderLight: 'var(--border-light)',
      card: 'var(--card-bg)',
    }
  },
  transformers: [
    transformerVariantGroup(),
    transformerDirectives({
      enforce: 'pre',
    }),
  ],
})
