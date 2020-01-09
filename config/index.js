module.exports = {
  build: {
    env: require('./prod.env'),
    DisableF12: true
  },
  dev: {
    env: require('./dev.env'),
    removeElectronJunk: true,
    port: 9080
  },
  UseStartupChart: true,
  IsUseSysTitle: true
}
