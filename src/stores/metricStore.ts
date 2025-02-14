import { defineStore } from 'pinia';
import { Metrics } from '@/model/Metrics';
import { CopilotMetrics } from '@/model/Copilot_Metrics';

export const useMetricsStore = defineStore('metrics', {
  state: () => ({
    originalMetrics: [] as CopilotMetrics[],
    metrics: [] as Metrics[], 
    seats: [] as any[],
  }),
  actions: {
    setOriginalMetrics(newMetrics: CopilotMetrics[]) {
      this.originalMetrics = newMetrics;
    },
    setMetrics(newMetrics: Metrics[]) {
      this.metrics = newMetrics;
    },
    setSeats(newSeats: any[]) {
      this.seats = newSeats;
    },
  },
  getters: {
    getOriginalMetrics: (state) => state.originalMetrics,
    getMetrics: (state) => state.metrics,
    getSeats: (state) => state.seats,
  },
});