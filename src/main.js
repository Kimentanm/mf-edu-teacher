import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design';
import ElementUI from 'element-ui';
import 'view-design/dist/styles/iview.css';
import 'element-ui/lib/theme-chalk/index.css';
import VueStomp from 'vue-stomp/src';
import VueBus from 'vue-bus';
import ErrorTipModal from "@/views/shared/errorTipModal";

Vue.use(VueStomp);
Vue.use(VueBus);
Vue.use(ErrorTipModal);
Vue.use(ViewUI);
Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');