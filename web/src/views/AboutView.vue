<template>
  <div class="about">
    <h1>{{ mes }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ApiService from '@/services/ApiService'

@Component
export default class HomeView extends Vue {
  public mes = 'Loading...'

  public async mounted () {
    const response = await ApiService.getMes().then(res => res.data)
    this.mes = response.mes
  }
}
</script>
