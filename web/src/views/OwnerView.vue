<template>
  <div class="owner-view">
    <h1>owner page</h1>
    <h2>{{ privateWords }}</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Keycloak from 'keycloak-js'
import ApiService from '@/services/ApiService'

@Component
export default class OwnerView extends Vue {
  public privateWords = ''

  public created () {
    const initOptions: any = {
      url: 'http://localhost:18080/auth',
      realm: 'testrealm',
      clientId: 'app-vue',
      onLoad: 'login-required'
    }

    const keycloak = Keycloak(initOptions)
    keycloak.init({ onLoad: initOptions.onLoad }).then((auth) => {
      if (!auth) {
        window.location.reload()
      } else {
        const token = keycloak.token ? keycloak.token : ''
        ApiService.getPrivateMes(token).then((res) => {
          this.privateWords = res.data.mes
        })
      }
      setInterval(() => {
        keycloak.updateToken(70).then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed')
          } else {
            console.log('Token not refreshed')
          }
        }).catch(() => {
          console.log('Failed to refresh token')
        })
      }, 6000)
    }).catch(() => {
      console.log('failed to initialize')
    })
  }
}
</script>
