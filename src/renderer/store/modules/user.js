const user = {
  state: {
    // token: JSON.parse(localStorage.getItem('token')),
    // name: JSON.parse(localStorage.getItem('name')),
    // roles: JSON.parse(localStorage.getItem('roles'))
    token: 'admin',
    name: 'Super Admin',
    roles: ['admin']
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      localStorage.setItem('token', JSON.stringify(token))
      state.token = token
    },
    SET_NAME: (state, name) => {
      localStorage.setItem('name', JSON.stringify(name))
      state.name = name
    },
    SET_ROLES: (state, roles) => {
      localStorage.setItem('roles', JSON.stringify(roles))
      state.roles = roles
    }
  },

  actions: {
    // 登录
    Login ({
      commit
    }, data) {
      return new Promise((resolve, reject) => {
        console.log('这是传过来的登录信息', data)
        commit('SET_TOKEN', 'admin')
        commit('SET_ROLES', ['admin'])
        commit('SET_NAME', 'Super Admin')
        resolve()
      })
    },

    // 登出
    LogOut ({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        resolve()
      })
    },

    // 前端 登出
    FedLogOut ({
      commit
    }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        resolve()
      })
    }
  }
}

export default user
