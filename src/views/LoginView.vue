<template>
  <div class="center-container">
    <a-card :title="$t('label.login')" :bordered="false" class="center-content" :hoverable="true" style="text-align: left">
    <a-form ref="formRef" :model="formState" :label-col="labelCol">
      <a-form-item has-feedback :label="$t('label.userName')" name="username" :rules="[{ required: true, message: $t('tip.noEmpty')}]">
        <a-input v-model:value="formState.username" @keydown.enter="$invokeTabKey" ref="userNameRef" />
      </a-form-item>
      <a-form-item has-feedback :label="$t('label.password')" name="password" :rules="[{ required: true, message: $t('tip.noEmpty')}]">
        <a-input type="password" v-model:value="formState.password" @keydown.enter="doLogin" />
      </a-form-item>
      <a-form-item  style="text-align: center">
        <a-button type="primary" @click="doLogin">{{ $t('label.submit')}}</a-button>
        <router-link to="/register"><a-button type="link" style="font-style:italic; float: right">我还没有账户</a-button></router-link>
      </a-form-item>
    </a-form>
    </a-card>
  </div>
</template>

<script>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
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

    const formRef = ref();

    const doLogin = () => {
      formRef.value.validate().then(()=>{
        ctx.$axios({
          method: "post",
          url: process.env.VUE_APP_URL_BASE_SERVICER+"/login",
          responseType: 'json',
          data: {
            'user_name': formState.username,
            'password': formState.password,
          },
        }).then((resp)=> {
          router.push('/')
          store.commit('servicerToken', resp.data.token)
          ctx.$message.info("登录成功")
        }).catch(e => {
          console.log(e)
          ctx.$message.error("登录失败：["+e.code+"]" + " " + e.message)
        })
      })
    }

    const userNameRef = ref()

    onMounted(()=>{
      userNameRef.value.focus()
    })


    return {
      formRef,
      formState,
      doLogin,
      labelCol: { style: { "min-width": '120px' } },
      userNameRef,
    }
  }
}
</script>

<style scoped>
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
  padding: 25px;
  text-align: center;
  box-shadow: 0 0 100px 10px black;
  border: 1px solid black;
}

</style>