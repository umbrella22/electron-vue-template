module.exports = {
  build: {
    env: require('./prod.env'),
    DisableF12: true,
    cleanConsole: true,
    openDevTools: false,
    hotPublishUrl: "",
    hotPublishConfigName: "update-config"
  },
  dev: {
    env: require('./dev.env'),
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080
  },
  development: require('./dev.env'),
  production: require('./prod.env'),
  UseStartupChart: true,
  IsUseSysTitle: true,
  DllFolder: '',
  BuiltInServerPort: 25565,
  UseJsx: true
}
