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
              accept=".json"
              style="display: none"
              @change="onFileSelected"
            />
          </div>
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
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { Metrics } from '../model/Metrics';
  
  const fileInput = ref<HTMLInputElement | null>(null);
  const showSuccess = ref(false);
  
  const handleFileSelect = () => {
    fileInput.value?.click();
  };
  
  const onFileSelected = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      
    }
  };
  </script>