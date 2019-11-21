import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import VueStomp from 'vue-stomp/src';
import VueBus from 'vue-bus';
import ErrorTipModal from "@/views/shared/errorTipModal";

Vue.use(VueStomp);
Vue.use(VueBus);
Vue.component(ErrorTipModal);

Vue.use(ViewUI);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');