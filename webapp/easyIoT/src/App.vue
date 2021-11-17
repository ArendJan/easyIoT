<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      Easy IoT
      <v-spacer></v-spacer>
      <v-btn v-if="loggedIn" @click="logOutButton">Log out</v-btn>
      <v-btn v-else @click="logInButton">Log in</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from "vuex";
require('./static/client');
export default {
  name: "App",

  data: () => ({}),
  computed: mapState(["loggedIn"]),
  mounted() {
    console.log(this.loggedIn);
    this.$store.dispatch("isLoggedIn");
  },
  methods: {
    logInButton() {
      this.$router.push("/login");
    },
    logOutButton() {
      this.$store.dispatch("logOut", { router: this.$router });
    },
  },
};
</script>
