import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

//socket
import VueSocketIO from 'vue-socket.io';
import SocketIO from 'socket.io-client';

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO('http://localhost:7777', {
    path: '',
    transports: ['websocket', 'xhr-polling', 'jsonp-polling'],
  }) //options object is Optional
}));

Vue.use(ViewUI);
Vue.config.productionTip = false;

new Vue({
  sockets: {
    connect: function () {
      console.log('已连接服务器')
    },
    customEmit: function (data) {
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
    }
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app');