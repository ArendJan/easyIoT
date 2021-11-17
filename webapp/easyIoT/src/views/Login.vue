<template>
  <v-container fill-height fluid>
    <v-row align="stretch">
      <v-col cols="12" align="center" justify="center">
        Log in:
        <v-alert type="warning" v-if="errortext.length > 0">
          {{ errortext }}
        </v-alert>
        <v-form @submit.prevent="loginButton" ref="form">
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
          <v-btn type="submit">Log in</v-btn>
        </v-form><br><br>
        <v-btn @click="addUser">Create account</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
      showP: false,
      errortext: ''
    }
  },
  mounted () {
    if (this.$store.loggedIn) {
      this.$$router.push('/dashboard')
    }
  },
  methods: {
    async loginButton () {
      const username = this.username
      const password = this.password
      const ok = await this.$store.dispatch('logIn', { username, password })
      if (ok.ok) {
        this.$router.push('/dashboard')
      } else {
        this.errortext = 'Incorrect login, try again'
      }
    },
    addUser () {
      this.$router.push('/createAccount')
    }
  }
}
</script>

<style>
</style>
