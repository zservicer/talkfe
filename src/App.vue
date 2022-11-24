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

.center-container{
  position: fixed;
  width: 100%;
  height: 100%;
}

.center-content{
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 40%;
  text-align: center;
  box-shadow: 0 0 40px 10px black;
  border: 1px solid black;
}

.center-content:hover{
  box-shadow: 0 0 100px 10px black;
  border: 1px solid black;
}

@media (max-width: 1200px) {
  .center-content {
    width: 60%;
  }
}

@media (max-width: 700px) {
  .center-content {
    width: 80%;
  }
}

</style>
