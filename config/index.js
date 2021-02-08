module.exports = {
  build: {
    env: require('./prod.env'),
    DisableF12: true
  },
  dev: {
    env: require('./dev.env'),
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
    ESLintoptions:{
      formatter: require('eslint-friendly-formatter')
    },
    cssSourceMap: true
  },
  UseStartupChart: true,
  IsUseSysTitle: true,
  DllFolder: '',
  BuiltInServerPort: 25565
}
