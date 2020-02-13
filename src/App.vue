<template>
  <div id="app">
    <router-view/>

    <progress-modal :show="progressModal" title="正在下载更新"
                    :percent="percent"
                    :transferred="transferred" :total="total"/>
  </div>
</template>

<script>
  /**
   * 禁用ctrl + R快捷键刷新页面
   * @param e
   * @returns {boolean}
   */
  window.onkeydown = (e) => {
    const ev = window.event || e;
    const code = ev.keyCode || ev.which;
    if (code === 82 && (ev.metaKey || ev.ctrlKey)) {
      // return false;
    }
  };

  import { mapActions } from 'vuex'
  import ProgressModal from "./views/shared/progressModal";
  let ipcRenderer = require('electron').ipcRenderer;

  export default {
    name: 'App',
    components: {
      ProgressModal
    },
    data() {
      return {
        progressModal: false,
        percent: 0,
        transferred: 0,
        total: 0
      }
    },
    methods: {
      ...mapActions([
        'handleLogOut'
      ]),
      handleOnExitApp() {
        this.handleLogOut()
      },
      handleStartDownload() {
        this.progressModal = true;
      },
      handleEndDownload() {
        this.progressModal = false;
      },
      handleSetProgressBar(event, state) {
        this.percent = parseFloat((state.percent).toFixed(2));
        this.transferred = parseFloat((state.transferred / (1000 * 1000)).toFixed(2));
        this.total = parseFloat((state.total / (1000 * 1000)).toFixed(2));
      }
    },
    mounted() {
      ipcRenderer.on('endDownload', this.handleEndDownload);
      ipcRenderer.on('startDownload', this.handleStartDownload);
      ipcRenderer.on('setProgressBar', this.handleSetProgressBar);
      ipcRenderer.send('appMounted', '')
    },
    created() {
      ipcRenderer.on('onExitApp', this.handleOnExitApp);
    },
    beforeDestroy() {
      ipcRenderer.removeListener('endDownload', this.handleEndDownload);
      ipcRenderer.removeListener('startDownload', this.handleStartDownload);
      ipcRenderer.removeListener('setProgressBar', this.handleSetProgressBar);
    }
  }
</script>

<style lang="less">
  @import "./assets/styles/common.less";
  .size{
    width: 100%;
    height: 100%;
  }
  html,body{
    .size;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  #app {
    .size;
  }
</style>