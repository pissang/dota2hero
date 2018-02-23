<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

import store from './store';

export default {
  name: 'App',

  created() {
    fetch('./heroes/overview_en.json')
      .then(response => response.json())
      .then(json => {
        store.heroList = json;
      })
  }
}
</script>

<style lang="scss">
html{
  height: 100%;
}
body {

  &.pushed{
    margin-right: 200px;
  }
  overflow: hidden;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

ul {
  padding: 0;
  margin: 0;
}
li {
  list-style: none;
  margin: 0;
}

</style>
