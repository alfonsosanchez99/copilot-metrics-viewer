<template>
    <div>
      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 90%; max-width: 1200px;">
        <v-card-item>
          <div class="d-flex flex-column align-center">
            <div class="text-h6 mb-4">Select a JSON file to represent the Copilot metrics</div>
            <v-btn
              color="primary"
              class="mb-4"
              prepend-icon="mdi-file-upload"
              @click="handleFileSelect"
            >
              Select file
            </v-btn>
            <input
              type="file"
              ref="fileInput"
              name="inputFile" id="inputFile"
              accept=".json"
              v-on="file"
              style="display: none"
              @change="selectFile"
            />
          </div>
        <v-card-item>
          <div class="d-flex flex-column align-center">
            <span v-if=file class="align-center">File selected: {{file['name']}}</span>
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
      "day": "2024-03-18",
      "total_suggestions_count": 8312,
      "total_acceptances_count": 2009,
      "total_lines_suggested": 35290,
      "total_lines_accepted": 5038,
      "total_active_users": 97,
      "total_chat_acceptances": 157,
      "total_chat_turns": 190,
      "total_active_chat_users": 38,
      "breakdown": [
        {
          "language": "dockercompose",
          "editor": "vscode",
          "suggestions_count": 7,
          "acceptances_count": 2,
          "lines_suggested": 133,
          "lines_accepted": 66,
          "active_users": 2
        }
      ]
    }
  ]</pre>
          </v-card-text>
        </v-card-item>
      </v-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent} from 'vue';
  import config from '../config';
  import { convertToMetrics } from '../api/MetricsToUsageConverter';
  import { CopilotMetrics } from '../model/Copilot_Metrics';
  
  export default defineComponent({
    name: 'NewFile',
    emits: ['load-main-component', 'update-metrics'],
    computed: {
      displayedViewName(): string {
        return config.scope.name;
      }
    },
    data() {
      return {
        tabItems: [],
        tab: null,
        file: null,
      }
    },
    methods: {
      selectFile(event : any) {
      this.file = event.target.files[0];
      },
      handleFileSelect() {
        const fileInput = this.$refs.fileInput as HTMLInputElement;
        fileInput.click();
      },

      //TODO: hacer que funciones bien el lector de archivos y cambien los datos mostrados.
      async onFileSelected (event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
        const file = target.files[0];
        try {
          const fileContent = await this.readFileContent(file);
          const jsonData = JSON.parse(fileContent);
          const originalData = this.ensureCopilotMetrics(jsonData);
          const metricsData = convertToMetrics(originalData);
          
          this.$emit('update-metrics', { metrics: metricsData, original: originalData });
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