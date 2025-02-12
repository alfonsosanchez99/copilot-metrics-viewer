<template>
  <div>
    <div class="text-h5 mx-4" style="font-weight: 500; margin-top: 20px;">Select Date</div>
    <div class="dates-container" style="display: flex; flex-direction: row; margin-top: 10px;">
      <v-card elevation="2" color="white" variant="elevated" class="mx-auto my-3"
        style="width: calc(50% - 20px); height: 50px; text-align-last: center;">
        <v-card-item>
          <label for="start" style="font-size: 18px;">Start date: </label>
          <input type="date" id="start" name="trip-start" v-model="startDate" min="2024-01-01" max="2026-12-31" />
        </v-card-item>
      </v-card>
      <v-card elevation="2" color="white" variant="elevated" class="mx-auto my-3"
        style="width: calc(50% - 20px); height: 50px; text-align-last: center;">
        <v-card-item>
          <label for="start" style="font-size: 18px;">End date: </label>
          <input type="date" id="end" name="trip-start" v-model="endDate" min="2024-01-01" max="2026-12-31" />
        </v-card-item>
      </v-card>
    </div>
    <div class="tiles-container">
      <!-- Acceptance Rate Tile -->
      <!--changed on 2024/11/22 to reorder cards, so the accepance rate by counts are be more focused-->
      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-25"></div>
            <div class="text-h6 mb-1">Acceptance Rate (by count)</div>
            <div class="text-caption">
              Over the last {{ daysDifference }} days
            </div>
            <p class="text-h4">{{ acceptanceRateAverageByCount.toFixed(2) }}%</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-10"></div>
            <div class="text-h6 mb-1">Total count of Suggestions (Prompts)</div>
            <div class="text-caption">
              Over the last {{ daysDifference }} days
            </div>
            <p class="text-h4">{{ cumulativeNumberSuggestions }}</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="spacing-25"></div>
          <div class="tiles-text">
            <div class="text-h6 mb-1">Acceptance Rate (by lines)</div>
            <div class="text-caption">
              Over the last {{ daysDifference }} days
            </div>
            <p class="text-h4">{{ acceptanceRateAverageByLines.toFixed(2) }}%</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-10"></div>
            <div class="text-h6 mb-1">Total Lines of code Suggested</div>
            <div class="text-caption">
              Over the last {{ daysDifference }} days
            </div>
            <p class="text-h4">{{ totalLinesSuggested }}</p>
          </div>
        </v-card-item>
      </v-card>
    </div>

    <v-main class="p-1" style="min-height: 300px;">

      <v-container style="min-height: 300px;" class="px-4 elevation-2">
        <h2>Acceptance rate by count (%)</h2>
        <Bar :data="acceptanceRateByCountChartData" :options="chartOptions" />

        <h2>Total Suggestions Count | Total Acceptances Count</h2>
        <Line :data="totalSuggestionsAndAcceptanceChartData" :options="chartOptions" />

        <h2>Acceptance rate by lines (%)</h2>
        <Bar :data="acceptanceRateByLinesChartData" :options="chartOptions" />

        <h2>Total Lines Suggested | Total Lines Accepted</h2>
        <Line :data="chartData" :options="chartOptions" />

        <h2>Total Active Users</h2>
        <Bar :data="totalActiveUsersChartData" :options="totalActiveUsersChartOptions" />

      </v-container>
    </v-main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useDateStore } from '@/stores/dateStore';
import { useMetricsStore } from '@/stores/metricStore'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import { Line } from 'vue-chartjs'
import { Bar } from 'vue-chartjs'
import { Metrics } from '@/model/Metrics';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)


export default defineComponent({
  name: 'MetricsViewer',
  components: {
    Line,
    Bar
  }
  ,
  data() {
    return {
      data: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [40, 20, 80, 10]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  setup() {

    //Tiles
    let acceptanceRateAverageByLines = ref(0);
    let acceptanceRateAverageByCount = ref(0);
    let cumulativeNumberSuggestions = ref(0);
    let cumulativeNumberAcceptances = ref(0);
    let cumulativeNumberLOCAccepted = ref(0);
    let totalLinesSuggested = ref(0);
    const dateStore = useDateStore();
    const metricsStore = useMetricsStore();
    const newMetrics = useMetricsStore();

    const metrics = computed (() => metricsStore.getMetrics);

    const filteredData = computed(() => {
      const start = new Date(dateStore.startDate);
      const end = new Date(dateStore.endDate);
      return metrics.value.filter((m: Metrics) => {
        const day = new Date(m.day);
        return day >= start && day <= end;
      });
    });


    const startDate = computed({
      get: () => dateStore.startDate,
      set: (value) => dateStore.setDates(value, dateStore.endDate),
    });

    const endDate = computed({
      get: () => dateStore.endDate,
      set: (value) => dateStore.setDates(dateStore.startDate, value),
    });

    const updateDates = () => {
      dateStore.setDates(startDate.value, endDate.value);
    };
    const daysDifference = computed(() => dateStore.daysDifference);


    //Acceptance Rate by lines
    const acceptanceRateByLinesChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Acceptance Rate by count
    const acceptanceRateByCountChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Suggestions Count | Total Acceptance Counts
    const totalSuggestionsAndAcceptanceChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Lines Suggested | Total Lines Accepted
    const chartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Active Users
    const totalActiveUsersChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      height: 300,
      width: 300,
      layout: {
        padding: {
          left: 150,
          right: 150,
          top: 20,
          bottom: 40
        }
      },
    };

    const totalActiveUsersChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      layout: {
        padding: {
          left: 50,
          right: 50,
          top: 50,
          bottom: 50
        }
      },
    };

    //const data = toRef(props, 'metrics').value;

    watch([startDate, endDate], () => {
      cumulativeNumberSuggestions.value = 0;
      const cumulativeSuggestionsData = filteredData.value.map((m: Metrics) => {
        cumulativeNumberSuggestions.value += m.total_suggestions_count;
        return m.total_suggestions_count;
      });

      cumulativeNumberAcceptances.value = 0;
      const cumulativeAcceptancesData = filteredData.value.map((m: Metrics) => {
        cumulativeNumberAcceptances.value += m.total_acceptances_count;
        return m.total_acceptances_count;
      });

      totalSuggestionsAndAcceptanceChartData.value = {
        labels: filteredData.value.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Suggestions',
            data: cumulativeSuggestionsData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)'

          },
          {
            label: 'Total Acceptance',
            data: cumulativeAcceptancesData,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)'
          },

        ]
      };

      cumulativeNumberLOCAccepted.value = 0;
      const cumulativeLOCAcceptedData = filteredData.value.map((m: Metrics) => {
        const total_lines_accepted = m.total_lines_accepted;
        cumulativeNumberLOCAccepted.value += total_lines_accepted;
        return total_lines_accepted;
      });

      chartData.value = {
        labels: filteredData.value.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Lines Suggested',
            data: filteredData.value.map((m: Metrics) => m.total_lines_suggested),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)'

          },
          {
            label: 'Total Lines Accepted',
            data: cumulativeLOCAcceptedData,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)'
          }
        ]
      };

      const acceptanceRatesByLines = filteredData.value.map((m: Metrics) => {
        const rate = m.total_lines_suggested !== 0 ? (m.total_lines_accepted / m.total_lines_suggested) * 100 : 0;
        return rate;
      });

      const acceptanceRatesByCount = filteredData.value.map((m: Metrics) => {
        const rate = m.total_suggestions_count !== 0 ? (m.total_acceptances_count / m.total_suggestions_count) * 100 : 0;
        return rate;
      });

      acceptanceRateByLinesChartData.value = {
        labels: filteredData.value.map((m: Metrics) => m.day),
        datasets: [
          {
            type: 'line', // This makes the dataset a line in the chart
            label: 'Acceptance Rate by Lines',
            data: acceptanceRatesByLines,
            backgroundColor: 'rgba(173, 216, 230, 0.2)', // light blue
            borderColor: 'rgba(173, 216, 230, 1)', // darker blue
            fill: false // This makes the area under the line not filled
          }
        ]
      };

      acceptanceRateByCountChartData.value = {
        labels: filteredData.value.map((m: Metrics) => m.day),
        datasets: [
          {
            type: 'line', // This makes the dataset a line in the chart
            label: 'Acceptance Rate by Count',
            data: acceptanceRatesByCount,
            backgroundColor: 'rgba(173, 216, 230, 0.2)', // light blue
            borderColor: 'rgba(173, 216, 230, 1)', // darker blue
            fill: false // This makes the area under the line not filled
          }
        ]
      };

      totalLinesSuggested.value = filteredData.value.reduce((sum: number, m: Metrics) => sum + m.total_lines_suggested, 0);

      if (totalLinesSuggested.value === 0) {
        acceptanceRateAverageByLines.value = 0;
      } else {
        acceptanceRateAverageByLines.value = cumulativeNumberLOCAccepted.value / totalLinesSuggested.value * 100;
      }

      // Calculate acceptanceRateAverageByCount
      if (cumulativeNumberSuggestions.value === 0) {
        acceptanceRateAverageByCount.value = 0;
      } else {
        acceptanceRateAverageByCount.value = cumulativeNumberAcceptances.value / cumulativeNumberSuggestions.value * 100;
      }

      totalActiveUsersChartData.value = {
        labels: filteredData.value.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Active Users',
            data: filteredData.value.map((m: Metrics) => m.total_active_users),
            backgroundColor: 'rgba(0, 0, 139, 0.2)', // dark blue with 20% opacity
            borderColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      }, { inmediate: true }
    });


    return {
      totalSuggestionsAndAcceptanceChartData, chartData, startDate, endDate, updateDates, daysDifference,
      chartOptions, totalActiveUsersChartData,
      totalActiveUsersChartOptions, acceptanceRateByLinesChartData, acceptanceRateByCountChartData, acceptanceRateAverageByLines, acceptanceRateAverageByCount, cumulativeNumberSuggestions,
      cumulativeNumberAcceptances, cumulativeNumberLOCAccepted, totalLinesSuggested
    };
  },

});
</script>
