<template>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;

}

.home4h {
  padding: 2vh;
  height: 100vh;
}

.talk4h {
  height: 96vh;
  overflow: auto scroll;
}

@media (max-width: 700px) {
  .ant-comment-avatar {
    margin-right:0 !important;
  }
}
</style>
