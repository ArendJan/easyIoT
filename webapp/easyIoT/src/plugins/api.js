import { serverURL } from './../consts'
const axios = require('axios')
async function getDeviceData (options) {
  try {
    const promise = axios.get(serverURL + `/api/data/${options.deviceID}`, { withCredentials: true })
    const data = await promise
    if ('ok' in data.data) {
      if (!data.data.ok) {
        // something wrong, no access to this data
        return []
      } else {
        // shouldn't happen, because then it would return the array
        return []
      }
    } else {
      return data.data
    }
  } catch (e) {
    // TODO: do something with this error
    console.log(e)
    return []
  }
}


async function getDeviceDataNew (options) {
  try {
    let url = `/api/data/${options.deviceID}`;
    if('interval' in options) {
      url += `/${options.interval}`;
    }
    if('amount' in options && 'interval' in options) {
      url += `/${options.amount}`;
    }
    const promise = axios.get(serverURL + url, { withCredentials: true })
    const data = await promise
    if ('ok' in data.data) {
      if (!data.data.ok) {
        // something wrong, no access to this data
        return []
      } else {
        // shouldn't happen, because then it would return the array
        return []
      }
    } else {
      return data.data
    }
  } catch (e) {
    // TODO: do something with this error
    console.log(e)
    return []
  }
}



async function createAccount (options) {
  try {
    const promise = axios.post(serverURL + '/api/createAccount', { username: options.username, password: options.password })
    const data = await promise
    if ('ok' in data.data) {
      return data.data.ok
    } else {
      return false
    }
  } catch (e) {
    // TODO: do something with this error
    console.log(e)
    return false
  }
}

async function logOut () {
  try {
    const promise = axios.get(serverURL + '/api/logOut', { withCredentials: true })
    await promise
    return true
  } catch (e) {
    // TODO: do something with this error
    console.log(e)
    return false
  }
}

async function removeDevice(id) {
  const promise = axios.post(serverURL + '/api/removeDevice',{deviceID: id}, { withCredentials: true })
}

export default { getDeviceData, createAccount, logOut, getDeviceDataNew }
