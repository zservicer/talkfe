<template>
  <div class="home home4h">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :xl="10">
        <TalkLeft :pending-talks="pendingTalks" :talks="talks" @activeTalkChanged="activeTalkChanged" />
      </a-col>
      <a-col :xs="24" :sm="24" :md="12" :xl="14">
        <TalkRight :talk-id="activatedTalkId" :messages-in="activatedTalkMessages" :customer-mode="false" />
      </a-col>
    </a-row>

  </div>
</template>

<script>
// @ is an alias to /src
import TalkLeft from '@/components/TalkLeft.vue'
import TalkRight from '@/components/TalkRight.vue'
import {ref, provide, reactive, onActivated, onDeactivated} from 'vue'
import SocketService from "@/api/websocket";
import { notification } from 'ant-design-vue';

import {
  ServiceRequest,
  ServiceResponse,
  ServiceAttachRequest,
  ServiceDetachRequest, ServicePostMessage, TalkMessageW
} from "../../proto/talk_pb";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

export default {
  name: 'HomeView',
  components: {
    TalkLeft,
    TalkRight
  },
  setup() {
    const socketNotificationKey = 'wsNotification';
    const openNotification = (message) => {
      notification.open({
        socketNotificationKey,
        message: '会话通道状态改变',
        description: message,
      });
    };

    //
    //
    //

    const store = useStore();
    const router = useRouter()

    //
    //
    //

    const pendingTalks = ref([])
    const talks = ref([]);

    const talkLocked = (talkId, talkInfo) => {
      for (let idx = 0; idx < pendingTalks.value.length; idx++) {
        if (pendingTalks.value[idx].talkId === talkId) {
          pendingTalks.value.splice(idx, 1)
          break
        }
      }

      if (talkInfo === undefined || talkInfo === null) {
          return
      }

      for (let idx = 0; idx < talks.value.length; idx++) {
        if (talks.value[idx].talkId === talkInfo.talkId) {
          return
        }
      }

      talks.value.push(talkInfo)
    }

    const talkUnlocked = (talkInfo) => {
      for (let idx = 0; idx < talks.value.length; idx++) {
        if (talks.value[idx].talkId === talkInfo.talkId) {
          talks.value.splice(idx, 1)
          break
        }
      }

      for (let idx = 0; idx < pendingTalks.value.length; idx++) {
        if (pendingTalks.value[idx].talkId === talkInfo.talkId) {
          return
        }
      }

      pendingTalks.value.push(talkInfo)
    }

    const talkClosed = (talkId) => {
      for (let idx = 0; idx < talks.value.length; idx++) {
        if (talks.value[idx].talkId === talkId) {
          talks.value[idx].lastCustomerMessage = "用户关闭会话"
          talks.value[idx].closedFlag = true

          break
        }
      }
    }


    //
    // websocket
    //

    const calcLastMessage = (messageObject) => {
      let lastCustomerMessage = '';

      if (messageObject.customerMessage) {
        if (messageObject.text !== '') {
          lastCustomerMessage = messageObject.text;
        } else {
          lastCustomerMessage = '<图片>'
        }
      } else {
        lastCustomerMessage = '等待客户反馈'
      }

      return lastCustomerMessage;
    }

    const ws = reactive(new SocketService(process.env.VUE_APP_WS_SERVICER, store.getters.servicerToken));
    ws.startConnect()

    ws.registerCallBack('open', () => {
      openNotification('通道打开')
    })

    ws.registerCallBack('close', (e) => {
      console.log("close:", e)
      if (e.code === 16 || e.code === 1005) {
        ws.finishConnect()

        router.push('/login')

        return
      }

      openNotification('通道关闭. ' + e.code + ": " +e.reason)
    })

    ws.registerCallBack('message', (message) => {
      const resp = ServiceResponse.deserializeBinary(message.data)
      if (resp.getTalks() != null) {
        talks.value = [];
        resp.getTalks().getTalksList().forEach(function (item) {
          let messages = []
          let lastCustomerMessage = '';

          item.getMessagesList().forEach(function (message) {
            const messageObject = message.toObject();
            if (messageObject.image.length > 0) {
              messageObject.image = atob(String(messageObject.image))
            }

            lastCustomerMessage = calcLastMessage(messageObject)

            messages.push(messageObject)
          })

          talks.value.push({
            ...item.getTalkInfo().toObject(),
            messages: messages,
            lastCustomerMessage: lastCustomerMessage,
            closedFlag: false,
            unreadMessageCount: 0,
          })
        })
      } else if (resp.getPendingTalks() != null) {
        pendingTalks.value = [];
        resp.getPendingTalks().getTalksList().forEach(function (talk) {
          pendingTalks.value.push(talk.toObject())
        })
      } else if (resp.getAttach() != null) {
        talkLocked(resp.getAttach().getTalk().getTalkId(), resp.getAttach().getTalk().toObject())
      } else if (resp.getDetach() != null) {
        talkUnlocked(resp.getDetach().getTalk().toObject())
      } else if (resp.getReload() != null) {
        for (let idx=0; idx<talks.value.length; idx++) {
          if (talks.value[idx].talkId === resp.getReload().getTalk().getTalkInfo().getTalkId()) {
            let messages = []
            resp.getReload().getTalk().getMessagesList().forEach(function (message) {
              const messageObject = message.toObject();
              if (messageObject.image.length > 0) {
                messageObject.image = atob(String(messageObject.image))
              }
              messages.push(messageObject)
            })
            talks.value[idx].messages = messages || [];

            break
          }
        }
      } else if (resp.getMessage() != null) {
        for (let idx=0; idx<talks.value.length; idx++) {
          if (talks.value[idx].talkId === resp.getMessage().getTalkId()) {
            const messageObject = resp.getMessage().getMessage().toObject();
            if (messageObject.image.length > 0) {
              messageObject.image = atob(String(messageObject.image))
            }

            talks.value[idx].lastCustomerMessage = calcLastMessage(messageObject)
            if (talks.value[idx].talkId !== activatedTalkId.value) {
              talks.value[idx].unreadMessageCount++
            }
            talks.value[idx].messages.push(messageObject)

            break
          }
        }
      } else if (resp.getKickOut() != null) {
        openNotification(resp.getKickOut().getCode() + ": " + resp.getKickOut().getMessage())
      } else if (resp.getNotify() != null) {
        openNotification('服务端消息：', resp.getNotify().getMsg())
      } else if (resp.getClose() != null) {
        talkClosed(resp.getClose().getTalkId())
      }

      console.log('resp:', resp.toObject())
    })

    //
    // provider
    //

    const lockTalk = (item) => {
      const attach = new ServiceAttachRequest()
      attach.setTalkId(item.talkId);
      const request = new ServiceRequest();
      request.setAttach(attach);
      ws.send(request.serializeBinary().buffer)
    }

    provide('LockTalk', lockTalk)

    const unlockTalk =  (item) => {
      const detach = new ServiceDetachRequest()
      detach.setTalkId(item.talkId);
      const request = new ServiceRequest();
      request.setDetach(detach);
      ws.send(request.serializeBinary().buffer)
    }

    provide('UnlockTalk', unlockTalk)

    const sendMessage = (talkId, text, image) => {
      const message = new TalkMessageW();
      message.setText(text);
      if (image) {
        message.setImage(new TextEncoder().encode(image));
      }
      message.setSeqId(0);

      const postMessage = new ServicePostMessage();
      postMessage.setTalkId(talkId);
      postMessage.setMessage(message);

      const request = new ServiceRequest();
      request.setMessage(postMessage);

      ws.send(request.serializeBinary().buffer)
    }
    provide('SendMessage', sendMessage)

    //
    //
    //

    const activatedTalkMessages = ref([]);
    const activatedTalkId = ref('');

    const activeTalkChanged = (talkId) => {
      activatedTalkId.value = talkId;

      talks.value.forEach(function (item) {
        if (item.talkId === talkId) {
          item.unreadMessageCount = 0
          activatedTalkMessages.value = item.messages;
        }
      })
    }

    //
    //
    //

    onActivated(()=>{
      ws.startConnect()
    })

    onDeactivated(()=>{
      ws.finishConnect()
    })

    //
    //
    //

    return {
      talks,
      pendingTalks,
      activeTalkChanged,
      activatedTalkId,
      activatedTalkMessages,
    }
  }
}
</script>
