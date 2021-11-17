import Vue from 'vue'
import Vuex from 'vuex'
import api from '../plugins/api'
import { serverURL } from './../consts'

const axios = require('axios')
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedIn: undefined,
    devices: null,
    devicesPromise: null,
    logInPromise: null,
    isLoggedInPromise: null,
    deviceData: []
  },
  mutations: {
    setLoggedIn (state, val) {
      state.loggedIn = val
    },
    setDevices (state, devices) {
      state.devices = devices
    },
    setDevicesPromise (state, promise) {
      state.devicesPromise = promise
    },
    setLogInPromise (state, promise) {
      state.logInPromise = promise
    },
    setIsLoggedInPromise (state, promise) {
      state.isLoggedInPromise = promise
    },
    setDevice (state, { id, data }) {
      if (state.deviceData === null) {
        state.deviceData = new Array(id + 1)
      }
      if (state.deviceData.length < id) {
        state.deviceData.length = id + 1
      }
      Vue.set(state.deviceData, id, data)
    },
    deleteAll (state) {
      state.loggedIn = false
      state.isLoggedInPromise = null
      state.devices = null
      state.devicesPromise = null
      state.logInPromise = null
      state.isLoggedInPromise = null
      state.deviceData = []
    }
  },
  actions: {
    // these functions can be called at all times,
    // when a request is currently busy, it will return the current promise,
    // when no data is yet available or force, it will start a new promise
    // when data is available and not forced, this will be returned immediately.
    // TODO: move api things outside this file
    async getDevices (context, options) {
      const force = options?.force
      if (context.state.devicesPromise !== null && !force) {
        return context.state.devicesPromise
      }
      if (context.state.devices !== null && !force) {
        return context.state.devices
      }
      const promise = new Promise(async (res, rej) => {
        const promise2 = axios.get(serverURL + '/api/devices', { withCredentials: true })
        const data = (await promise2).data
        context.commit('setDevices', data)
        context.commit('setDevicesPromise', null)
        console.log(data)
        data.forEach(device => {
          console.log('dev', device)
          context.dispatch('getDevice', device.id)
        })
        return res(data)
      })
      context.commit('setDevicesPromise', promise)
    },
    async logIn (context, values) {
      const promise = axios.post(serverURL + '/api/login', {
        username: values.username,
        password: values.password
      }, { withCredentials: true })
      const data = (await promise).data
      console.log(data)
      if (data.ok) {
        context.commit('setLoggedIn', true)
      }
      return data
    },
    async isLoggedIn (context) {
      if (context.state.isLoggedInPromise !== null) {
        return context.state.isLoggedInPromise
      }
      if (context.state.isLoggedIn !== undefined) {
        return context.state.isLoggedIn
      }
      console.log('serverurl', serverURL)
      const promise = new Promise(async (res, rej) => {
        const promise2 = axios.get(serverURL + '/api/isLoggedIn', { withCredentials: true })
        console.log(await promise2)
        const data = (await promise2).data
        context.commit('setIsLoggedInPromise', null)
        context.commit('setLoggedIn', data.ok)
        res(data)
      })

      context.commit('setIsLoggedInPromise', promise)
      return promise
    },
    async getDevice (context, id) {
      if (context.state.deviceData !== null) {
        if (context.state.deviceData[id] !== undefined) {
          return context.state.deviceData[id]
        }
      }
      const promise2 = axios.get(serverURL + `/api/dev/${id}`, { withCredentials: true })
      const data = (await promise2).data
      context.commit('setDevice', { id, data })
      return data
    },

    async logOut (context, options) {
      if (!context.state.loggedIn) {
        return
      }
      await api.logOut()
      context.commit('deleteAll')
      if (options.router) {
        options.router.push('/login')
      }
    }
  },
  modules: {
  }
})
