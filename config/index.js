module.exports = {
  build: {
    env: require('./prod.env'),
    DisableF12: true
  },
  dev: {
    env: require('./dev.env'),
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080
  },
  UseStartupChart: false,
  IsUseSysTitle: true,
  DllFolder: '',
  BuiltInServerPort: 25565
}
