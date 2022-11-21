<template>
  <div class="container">
    <a-form class="login">
      <a-form-item label="Username" name="username">
        <a-input v-model:value="formState.username" />
      </a-form-item>
      <a-form-item label="Password" name="password">
        <a-input type="password" v-model:value="formState.password" @keydown.enter="doLogin" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doLogin">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {getCurrentInstance, reactive} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

export default {
  name: 'LoginView',
  setup() {
    const instance = getCurrentInstance();
    const ctx = instance.appContext.config.globalProperties;

    const formState = reactive({
      username: '',
      password: '',
    });

    const store = useStore();
    const router = useRouter()

    const doLogin = () => {
      ctx.$axios({
        method: "post",
        url: process.env.VUE_APP_URL_BASE_SERVICER+"/login",
        responseType: 'json',
        data: {
          'user_name': formState.username,
          'password': formState.password,
        },
      }).then((resp)=> {
        store.commit('servicerToken', resp.data.token)
        router.push('/')
      }).catch(e => {
        console.log(e)
        ctx.$message.error("登录失败：["+e.code+"]" + " " + e.message)
      })
    }

    return {
      formState,
      doLogin
    }
  }
}
</script>

<style scoped>
label{
  display: inline-block;
  min-width: 200px;
}

.container{
  position: fixed;
  width: 100%;
  height: 100%;
}

.login{
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 40%;
  padding: 5px;
  text-align: center;
  box-shadow: 0 0 100px 10px black;
  border: 1px solid black;
}

</style>