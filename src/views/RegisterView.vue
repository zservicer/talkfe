<template>
  <div class="center-container">
    <a-card :title="$t('label.register')" :bordered="false" class="center-content" :hoverable="true">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :rules="rules">
        <a-form-item has-feedback :label="$t('label.userName')" name="username" :rules="[{ required: true, message: 'Please input your username!' }]">
          <a-input v-model:value="formState.username" @keydown.enter="invokeTabKey" ref="userNameRef" autocomplete="new-password" />
        </a-form-item>
        <a-form-item has-feedback :label="$t('label.password')" name="pass">
          <a-input-password type="password" v-model:value="formState.password" @keydown.enter="invokeTabKey" />
        </a-form-item>
        <a-form-item has-feedback :label="$t('label.checkPassword')" name="checkPass">
          <a-input-password type="password" v-model:value="formState.checkPassword" @keydown.enter="doRegister" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="doRegister">{{ $t('label.submit')}}</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

export default {
  name: 'RegisterView',
  setup() {
    const instance = getCurrentInstance();
    const ctx = instance.appContext.config.globalProperties;

    const { t } = useI18n()

    const formState = reactive({
      username: '',
      password: '',
      checkPassword: '',
    });

    const store = useStore();
    const router = useRouter()

    const doRegister = () => {
      formRef.value.validate().then(()=>{
        ctx.$grpc.register(formState.username, formState.password).then((resp) => {
          console.log(resp)
          store.commit('servicerToken', resp.token)
          router.push('/')
        }).catch((e) => {
          console.log(e)
          ctx.$message.error(t('comm.exception') + ":" + e)
          if (ctx.$i18n.locale === 'zh') {
            ctx.$i18n.locale = 'en'
          } else {
            ctx.$i18n.locale = 'zh'
          }
          localStorage.setItem('locale', ctx.$i18n.locale)
        })
      }).catch((err) => {
        console.log('err:', err)
      });
    }

    const invokeTabKey = () => {
      let currInput = document.activeElement;
      if (currInput.tagName.toLowerCase() === "input") {
        const inputs = document.getElementsByTagName("input");
        currInput = document.activeElement;
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i] === currInput) {
            const next = inputs[i + 1];
            if (next && next.focus) {
              next.focus();
            }
            break;
          }
        }
      }
    }

    const userNameRef = ref()

    onMounted(()=>{
      userNameRef.value.focus()
    })

    const formRef = ref();

    let validatePass = async () => {
      if (formState.password === '') {
        return Promise.reject('Please input the password');
      } else {
        if (formState.checkPassword !== '') {
          formRef.value.validateFields('checkPass');
        }
        return Promise.resolve();
      }
    };

    let validatePass2 = async () => {
      if (formState.checkPassword === '') {
        return Promise.reject('Please input the password again');
      } else if (formState.checkPassword !== formState.password) {
        return Promise.reject("Two inputs don't match!");
      } else {
        return Promise.resolve();
      }
    };

    const rules = {
      pass: [{
        required: true,
        validator: validatePass,
        trigger: 'change',
      }],
      checkPass: [{
        validator: validatePass2,
        trigger: 'change',
      }],
    };

    return {
      userNameRef,
      formRef,
      rules,
      formState,
      doRegister,
      labelCol: { style: { "min-width": '120px' } },
      invokeTabKey,
    }
  }
}
</script>
