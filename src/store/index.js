import { createStore } from 'vuex'

function getServicerToken() {
  const token = localStorage.getItem("servicer_token")
  if (token === undefined || token === null) {
    return ''
  }

  return token
}

function getLocalStringValue(key) {
  const token = localStorage.getItem(key)
  if (token === undefined || token === null) {
    return ''
  }

  return token
}

export default createStore({
  state: {
    servicerToken: getServicerToken(),
    customerUsername: getLocalStringValue('customer_username'),
  },
  getters: {
    servicerToken(state) {
      return state.servicerToken
    },
    customerUsername(state) {
      return state.customerUsername
    }
  },
  mutations: {
    servicerToken(state, val) {
      state.servicerToken = val
      localStorage.setItem("servicer_token", val)
    },
    customerUsername(state, val) {
      state.customerUsername = val
      localStorage.setItem("customer_username", val)
    },
    logout(state) {
      state.servicerToken = ""
      localStorage.setItem("servicer_token", "")
    }
  },
  actions: {
  },
  modules: {
  }
})
