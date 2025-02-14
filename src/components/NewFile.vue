<template>
  <div>
    <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 90%; max-width: 1200px;">
      <v-card-item>
        <div class="d-flex flex-column align-center">
          <div class="text-h6 mb-4">Select a JSON file to represent the Copilot metrics</div>
          <v-btn color="primary" class="mb-4" prepend-icon="mdi-file-upload" @click="handleFileSelect">
            Select file
          </v-btn>
          <input type="file" ref="fileInput" name="inputFile" id="inputFile" accept=".json" style="display: none"
            @change="onFileSelected" />
        </div>
        <v-card-item>
          <div class="d-flex flex-column align-center">
            <span v-if=file class="align-center">File selected: {{ file['name'] }}</span>
          </div>
        </v-card-item>
      </v-card-item>
    </v-card>

    <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 90%; max-width: 1200px;">
      <v-card-item>
        <div class="text-h6 mb-2">JSON example:</div>
        <v-card-text>
          <pre class="bg-grey-lighten-4 pa-4 rounded text-body-2 overflow-auto" style="max-height: 540px;">
            [
              {
              "date": "2024-12-04",
              "copilot_ide_chat": {
                  "editors": [
                      {
                        "name": "vscode",
                        "models": [
                            {
                                "name": "default",
                                "total_chats": 34,
                                "is_custom_model": false,
                                "total_engaged_users": 2,
                                "total_chat_copy_events": 1,
                                "total_chat_insertion_events": 0
                            }
                        ],
                        "total_engaged_users": 2
                      },
                      "name": "another editor...",
                    ]
                  }
                }
              ]
        </pre>
        </v-card-text>
      </v-card-item>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { convertToMetrics } from '../api/MetricsToUsageConverter';
import { CopilotMetrics } from '../model/Copilot_Metrics';
import { useMetricsStore } from '@/stores/metricStore';

export default defineComponent({
  name: 'NewFile',
  emits: ['load-main-component', 'update-metrics'],
  data() {
    return {
      file: null,
    }
  },
  methods: {
    selectFile(event: any) {
      this.file = event.target.files[0];
    },
    handleFileSelect() {
      const fileInput = this.$refs.fileInput as HTMLInputElement;
      fileInput.click();
    },
    
    async onFileSelected(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        try {
          const fileContent = await this.readFileContent(file);
          const jsonData = JSON.parse(fileContent);
          const originalData = this.ensureCopilotMetrics(jsonData);
          const metricsData = convertToMetrics(originalData);

          const metricsStore = useMetricsStore();
          metricsStore.setOriginalMetrics(originalData); 
          metricsStore.setMetrics(metricsData);

          this.$emit('load-main-component');
        } catch (error) {
          console.error('Error al procesar el archivo:', error);
        }
      }
    },
    readFileContent(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    },
    ensureCopilotMetrics(data: any[]): CopilotMetrics[] {
      return data.map(item => {
        if (!item.copilot_ide_code_completions) {
          item.copilot_ide_code_completions = { editors: [] };
        }
        item.copilot_ide_code_completions.editors?.forEach((editor: any) => {
          editor.models?.forEach((model: any) => {
            if (!model.languages) {
              model.languages = [];
            }
          });
        });
        return item as CopilotMetrics;
      });
    },
    loadMockedData() {
      this.$emit('load-main-component');
    }
  }
})
</script>