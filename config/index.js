module.exports = {
  build: {
    DisableF12: true,
    hotPublishUrl:"http://umbrella22.github.io/electron-vite-template",
    hotPublishConfigName: "update-config"
  },
  dev: {
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
    ESLintoptions: {
      formatter: require('eslint-friendly-formatter')
    },
    cssSourceMap: true
  },
  DllFolder: '',
}
