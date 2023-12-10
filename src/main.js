import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { router } from './router';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
