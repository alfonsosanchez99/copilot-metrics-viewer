import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import './assets/global.css';

loadFonts()

createApp(App)
  .use(vuetify).use(createPinia())
  .mount('#app')
