<template>
  <v-container fill-height fluid>
    <v-row align="stretch">
      <v-col cols="12" align="center" justify="center">
        Add device:
        <v-alert :type="errorColor" v-if="errortext.length > 0">
          {{ errortext }}
        </v-alert>
        <v-form @submit.prevent="addButton" ref="form">
          <v-text-field
            v-model="deviceID"
            label="Device ID"
            outlined
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="devicePassword"
            label="Device Password(5 characters)"
            outlined
          ></v-text-field>
          <v-btn type="submit">Add</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { serverURL } from './../consts'
const axios = require('axios')
export default {
  name: 'AddDevice',
  data () {
    return {
      deviceID: '',
      devicePassword: '',
      errortext: '',
      errorColor: 'warning'
    }
  },
  mounted () {
    console.log(serverURL)
    if (!this.$store.state.loggedIn) {
      this.$router.push('/login')
    }
  },
  methods: {
    async addButton () {
      this.errortext = ''
      this.errorColor = 'warning'
      try {
        const promise = axios.post(serverURL + '/api/connect', {
          deviceID: this.deviceID,
          password: this.devicePassword
        }, { withCredentials: true })
        const data = (await promise).data
        if (data.ok) {
          console.log('ok')
          this.errortext = 'Added device! Will redirect in 2 seconds...'
          this.errorColor = 'success'
          setTimeout(() => { this.$router.push(`/dashboard/${this.deviceID}`) }, 2000)
        } else {
          this.errortext = 'Oops, incorrect ID or password, try again.'
          console.log(await promise)
        }
      } catch (e) {
        console.log(e)
        this.errortext = 'Oops, error contacting server.'
      }
    }
  }
}
</script>

<style>
</style>
