import { reactive } from 'vue';
import { Metrics } from '../model/Metrics';

const state = reactive({
  metrics: [] as Metrics[],
});

export function setMetrics(newMetrics: Metrics[]) {
  state.metrics.length = 0;
  state.metrics.push(...newMetrics);}

export default state;