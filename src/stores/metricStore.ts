import { defineStore } from 'pinia'
import { Metrics } from '../model/Metrics'

export const useMetricsStore = defineStore('metrics', {
  state: () => ({
    metrics: [] as  Metrics[],
  }),
  actions: {
    setMetrics(newMetrics: Metrics[]) {
      this.metrics = newMetrics
    }
  },
  getters: {
    getMetrics: (state) => state.metrics,
  }
})