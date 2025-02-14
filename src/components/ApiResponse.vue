<template>
  <v-container>
    <div class="copy-container">
      <v-btn @click="checkMetricsDataQuality">Check Metric data quality</v-btn>
      <v-spacer></v-spacer>
      <v-btn @click="copyToClipboard('metricsJsonText')">Copy Metrics to Clipboard</v-btn>
    </div>
    <transition name="fade">
      <div v-if="showCopyMessage || showSeatMessage || showQualityMessage"
        :class="{ 'copy-message': true, 'error': isError }">
        {{ message }}
      </div>
    </transition>
    <br><br>
    <v-card max-height="575px" class="overflow-y-auto">
      <pre ref="metricsJsonText">{{ JSON.stringify(originalMetrics, null, 2) }}</pre>
    </v-card>
    <br>
    <div class="copy-container">
      <v-btn @click="showSeatCount">Show Assigned Seats count</v-btn>
      <transition name="fade">
        <div v-if="showSeatMessage" :class="{ 'copy-message': true, 'error': isError }">{{ message }}</div>
      </transition>
    </div>

    <v-card max-height="575px" class="overflow-y-auto">
      <pre ref="seatJsonText">{{ JSON.stringify(seats, null, 2) }}</pre>
    </v-card>
    <br>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { MetricsValidator } from '../api/MetricsValidator';
import { useMetricsStore } from '@/stores/metricStore';

export default defineComponent({
  name: 'ApiResponse',
  setup() {
    const metricsStore = useMetricsStore();
    const originalMetrics = computed(() => metricsStore.getOriginalMetrics);
    const seats = computed(() => metricsStore.getSeats);
    const showCopyMessage = ref(false);
    const showSeatMessage = ref(false);
    const showQualityMessage = ref(false);
    const isError = ref(false);
    const message = ref('');

    const copyToClipboard = (refName: string) => {
      const jsonText = document.querySelector(`[ref="${refName}"]`) as HTMLElement;
      if (jsonText && jsonText.innerText) {
        navigator.clipboard.writeText(jsonText.innerText)
          .then(() => {
            message.value = 'Copied to clipboard!';
            isError.value = false;
          })
          .catch((err) => {
            message.value = 'Could not copy text!';
            isError.value = true;
            console.error('Could not copy text: ', err);
          });

        showCopyMessage.value = true;
        setTimeout(() => {
          showCopyMessage.value = false;
        }, 3000);
      } else {
        message.value = 'No text to copy!';
        isError.value = true;
        showCopyMessage.value = true;
        setTimeout(() => {
          showCopyMessage.value = false;
        }, 3000);
      }
    };

    const showSeatCount = () => {
      const seatCount = seats.value.length;
      message.value = `Seat count: ${seatCount}`;

      showSeatMessage.value = true;
      setTimeout(() => {
        showSeatMessage.value = false;
      }, 3000);
    };

    const checkMetricsDataQuality = () => {
      const validator = new MetricsValidator(originalMetrics.value);
      const results = validator.checkAllMetrics();
      const allValid = Object.values(results).every((result: any) => result.length === 0);

      if (allValid) {
        message.value = 'All metrics are valid!';
        isError.value = false;
      } else {
        message.value = 'Some metrics might be inconsistent, please double check the API response.\n';
        isError.value = true;
        let typeCounter = 1;
        for (const [key, value] of Object.entries(results)) {
          if (value.length > 0) {
            message.value += `\n${typeCounter}).  ${key}:\n${JSON.stringify(value, null, 2)}\n`;
            typeCounter++;
          }
        }
      }

      showQualityMessage.value = true;
      setTimeout(() => {
        showQualityMessage.value = false;
      }, 6000);
    };

    return {
      originalMetrics,
      seats,
      showCopyMessage,
      showSeatMessage,
      showQualityMessage,
      isError,
      message,
      copyToClipboard,
      showSeatCount,
      checkMetricsDataQuality,
    };
  },
});
</script>

<style scoped>
.tiles-container {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.copy-container {
  display: flex;
  align-items: center;
}

.copy-message {
  margin-left: 10px;
  font-family: Roboto, sans-serif;
}

.copy-message.error {
  color: red;
}

.copy-message:not(.error) {
  color: darkgreen;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>