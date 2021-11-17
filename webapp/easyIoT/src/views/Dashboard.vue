<template>
  <v-container fill-height fluid>
    <!-- list the devices -->

    <!-- add device button -->
    <v-row v-for="(device, index) in devices" :key="index">
      <v-col cols="12">
        <v-card>
          <v-card-title primary-title>
            {{ device.name }}
          </v-card-title>
          <v-card-subtitle>See data from this device({{device.id}}): {{deviceText[device.id]}}</v-card-subtitle>
          <v-card-actions>
            <v-btn @click="showData(device.id)">show data</v-btn>
            <v-btn @click="removeDevice(device.id)">remove device</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row align="stretch">
      <v-col cols="12" align="center">
        <v-btn color="info" @click="addDevice">Add device</v-btn>
      </v-col></v-row
    ></v-container
  >
</template>

<script>
import { mapState } from 'vuex'
import api from '../plugins/api'
export default {
  name: 'Dashboard',
  methods: {
    addDevice () {
      this.$router.push('addDevice')
    },
    showData (id) {
      this.$router.push(`/dashboard/${id}`)
    },
    removeDevice(id) {
      api.removeDevice(id);
    }
  },
  mounted () {
    this.$store.dispatch('getDevices', { force: true })
  },
  computed: {
    ...mapState(['devices']),
    ...mapState({ deviceText: (state) => state.deviceData.map((v) => {console.log(v);return v.join(', '); })})
  }
}
</script>

<style>
</style>
