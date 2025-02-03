import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Metrics } from '../model/Metrics'

export const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics[]>([])
  
  function setMetrics(newMetrics: Metrics[]) {
    metrics.value = newMetrics
  }

  return {
    metrics,
    setMetrics
  }
})