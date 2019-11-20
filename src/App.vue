<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  /**
   * 禁用ctrl + R快捷键刷新页面
   * @param e
   * @returns {boolean}
   */
  window.onkeydown = (e) => {
    console.log(1);
    const ev = window.event || e;
    const code = ev.keyCode || ev.which;
    if (code === 82 && (ev.metaKey || ev.ctrlKey)) {
      // return false;
    }
  };

  export default {
    name: 'App',
  }
</script>

<style lang="less">
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