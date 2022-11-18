<template>
  <div class="home4h">
    <div v-if="userName" style="position: fixed;top:0; ">Hello, {{ userName }}</div>
    <div>
      <TalkRight v-if="tokenOk && !newCreateFlag" :talk-id="talkId" :messages-in="messages" :customer-mode="true" />
      <e-row v-else>
        <a-form>
          <a-form-item label="您的称呼" name="username" v-if="!tokenOk">
            <a-input v-model:value="formState.username" />
          </a-form-item>
          <a-form-item label="问题描述" name="title">
            <a-input v-model:value="formState.title" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="createToken">Submit</a-button>
          </a-form-item>
        </a-form>
      </e-row>
    </div>
  </div>
</template>

<script>
import TalkRight from '@/components/TalkRight.vue'
import {getCurrentInstance, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref} from "vue";
import {
  CheckTokenResponse,
  CreateTokenRequest,
  CreateTokenResponse,
  QueryTalksResponse, TalkClose,
  TalkCreateRequest, TalkMessageW,
  TalkOpenRequest,
  TalkRequest,
  TalkResponse,
} from "../../js/talk_pb";
import SocketService from "@/api/websocket";
import {message} from "ant-design-vue";
import {useStore} from "vuex";

export default {
  name: 'HomeView',
  components: {
    TalkRight
  },
  setup() {
    const token = ref('');
    const tokenOk = ref(false);
    const userName = ref(null);
    const talkId = ref('');
    const messages = ref([]);
    const newCreateFlag = ref(false);

    const instance = getCurrentInstance();
    const ctx = instance.appContext.config.globalProperties;

    //
    //
    //

    const parentMessage = (e) => {
      if (e.data['target'] === 'customer') {
        if (e.data['token']) {
          queryToken(e.data['token'])
        }
      }
    }


    onMounted(() => {
      nextTick(() => {
        window.addEventListener('message', parentMessage);
      });
    });


    onBeforeUnmount(() => {
      window.removeEventListener('message', parentMessage);
    });


    //
    //
    //

    const store = useStore();
    const formState = reactive({
      username: store.getters.customerUsername,
      title: '',
    });

    const startTalk = () => {
      ctx.$axios({
        method: "get",
        headers: {
          'token': token.value,
        },
        url: process.env.VUE_APP_URL_BASE_CUSTOMER+"/listTalk",
      }).then((resp)=>{
        const pbResp = QueryTalksResponse.deserializeBinary(resp.data)
        const pbTalkList = pbResp.getTalksList();
        const talkStartRequest = new TalkRequest();

        if (pbTalkList.length > 0) {
          talkId.value = pbTalkList[0].getTalkId();
          const open = new TalkOpenRequest();
          open.setTalkId(talkId.value);
          talkStartRequest.setOpen(open);
        } else {
          if (formState.title === "") {
            newCreateFlag.value = true
            ws.finishConnect()

            return
          }
          const create = new TalkCreateRequest();
          create.setTitle(formState.title);
          talkStartRequest.setCreate(create);

          formState.title = ''
        }
        ws.send(talkStartRequest.serializeBinary().buffer)
      }).catch(e => {
        message.error('startTalk:', e)
      })
    }

    const createToken = () => {
      if (tokenOk.value) {
        queryToken(token.value)

        return
      }

      if (formState.title === '') {
        formState.title = '咨询'
      }

      if (formState.username !== '') {
        store.commit('customerUsername', formState.username)
      }

      const req = new CreateTokenRequest();
      req.setUserName(formState.username);

      ctx.$axios({
        method: "post",
        url: process.env.VUE_APP_URL_BASE_CUSTOMER+"/createToken",
        data: req.serializeBinary().buffer,
      }).then((resp)=> {
        const pbResp = CreateTokenResponse.deserializeBinary(resp.data)
        token.value = pbResp.getToken()
        userName.value = pbResp.getUserName()
        window.parent.postMessage({
          'token': pbResp.getToken(),
          target: 'customer',
        }, '*')

        tokenOk.value = true
        ws.setToken(token.value)
        ws.startConnect()
      })
    }

    const queryToken = (tkn) => {
      token.value = tkn
      tokenOk.value = false

      ctx.$axios({
        method: "get",
        headers: {
          'token': token.value,
        },
        url: process.env.VUE_APP_URL_BASE_CUSTOMER+"/checkToken",
      }).then((resp)=>{
        const pbResp = CheckTokenResponse.deserializeBinary(resp.data)
        if (pbResp.getValid()) {
          tokenOk.value = true

          token.value = pbResp.getNewToken();
          userName.value = pbResp.getUserName();

          window.parent.postMessage({
            'token': pbResp.getNewToken(),
            target: 'customer',
          }, '*')

          newCreateFlag.value = false
          ws.setToken(pbResp.getNewToken());
          ws.startConnect()
        }
      }).catch(e => {
        message.error(e)
      })
    }

    const ws = reactive(new SocketService(process.env.VUE_APP_WS_CUSTOMER, ''));

    ws.registerCallBack('open', () => {
      startTalk()
    })

    ws.registerCallBack('close', () => {
    })

    ws.registerCallBack('message', (message) => {
      const resp = TalkResponse.deserializeBinary(message.data);
      if (resp.getMessages() != null) {
        talkId.value = resp.getMessages().getTalkId();

        messages.value= [];
        resp.getMessages().getMessagesList().forEach(function (message) {
          const messageObject = message.toObject();
          if (messageObject.image.length > 0) {
            messageObject.image = atob(String(messageObject.image))
          }
          messages.value.push(messageObject)
        })
      } else if (resp.getMessage() != null) {
        const messageObject = resp.getMessage().toObject();
        if (messageObject.image.length > 0) {
          messageObject.image = atob(String(messageObject.image))
        }
        messages.value.push(messageObject)
      }

      console.log("resp:", resp.toObject())
    })

    //
    //
    //

    const sendMessage = (talkId, text, image) => {
      const message = new TalkMessageW();
      message.setText(text);
      if (image) {
        message.setImage(new TextEncoder().encode(image));
      }
      message.setSeqId(0);

      const request = new TalkRequest();
      request.setMessage(message);

      ws.send(request.serializeBinary().buffer)
    }
    provide('SendMessage', sendMessage)

    const closeTalk = () => {
      const request = new TalkRequest();
      request.setClose(new TalkClose())

      ws.send(request.serializeBinary().buffer)
      ws.finishConnect()

      formState.title = ''
      newCreateFlag.value = true
      token.value = ''
      userName.value = ''
    }
    provide('CloseTalk', closeTalk)

    //
    //
    //

    return {
      formState,
      createToken,
      userName,
      talkId,
      messages,
      parentMessage,
      newCreateFlag,
      tokenOk
    }
  }
}

</script>
