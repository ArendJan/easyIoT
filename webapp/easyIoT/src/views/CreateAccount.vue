<template>
  <v-container fill-height fluid>
    <v-row align="stretch">
      <v-col cols="12" align="center" justify="center">
        Create account:
        <v-alert :type="errorColor" v-if="errortext.length > 0">
          {{ errortext }}
        </v-alert>
        <v-form @submit.prevent="createButton" ref="form">
          <v-text-field
            v-model="username"
            label="Username"
            outlined
            clearable
          ></v-text-field>
          <v-text-field
            v-model="password"
            :append-icon="!showP ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showP ? 'text' : 'password'"
            name="input-10-1"
            label="Password"
            outlined
            @click:append="showP = !showP"
          ></v-text-field>
          <v-btn type="submit">Create!</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '../plugins/api'
export default {
  name: 'CreateAccount',
  data () {
    return {
      username: '',
      password: '',
      showP: false,
      errortext: '',
      errorColor: 'warning'
    }
  },
  mounted () {},
  methods: {
    async createButton () {
      this.errortext = ''
      const username = this.username
      const password = this.password
      const ok = await api.createAccount({ username, password })
      if (ok) {
        this.errortext = 'Account created. Will redirect to login in 2s.'
        this.errorColor = 'success'
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      } else {
        this.errortext = 'Something went wrong, try again'
      }
    }
  }
}
</script>

<style></style>
