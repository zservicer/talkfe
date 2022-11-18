<template>
  <perfect-scrollbar class="talk-right talk4h" ref="messageContainer">
    <TalkMessage v-for="message in messagesIn" :key="message.at" :position="messagePosition(message)" :at="messageTitle(message)"
                 :message="message.text" :image="message.image" />

    <a-comment>
      <template v-if="!smallMedia" #avatar>
        <a-avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
      </template>
      <template #content>
        <a-form-item>
          <a-row>
            <a-col :xs="24" :sm="20" :md="20" :xl="20">
              <a-textarea class="message" v-model:value="message" :rows="smallMedia?1:4" @paste="fileChange"  v-focus
                          ref="messageInput" @keydown.enter="handleEnter" />
            </a-col>
            <a-col :xs="0" :sm="4" :md="4" :xl="4">
              <a-upload-dragger
                  name="file"
                  :before-upload="beforeUpload"
                  :show-upload-list="false"
              >
                <p class="ant-upload-drag-icon">
                  <inbox-outlined></inbox-outlined>
                </p>
                <p class="ant-upload-text">上传图片</p>
              </a-upload-dragger>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item v-if="!smallMedia">
          <div>
            <a-button type="primary" class="subElement" @click="handleSubmit" >发送</a-button>
            <a-button type="primary" class="subElement" danger ghost @click="handleCloseTalk" v-if="fnCloseTalk">结束会话</a-button>
          </div>
        </a-form-item>
      </template>
    </a-comment>
  </perfect-scrollbar>
</template>

<script>
import TalkMessage from "@/components/TalkMessage";

import {inject, ref, watch, nextTick, getCurrentInstance} from 'vue';

export default {
  components: {
    TalkMessage,
  },
  props: {
    talkId: String,
    messagesIn: {
      type:Array,
      default:()=> []
    },
    customerMode: Boolean,
  },
  setup(props) {
    const messageContainer = ref()
    const messageInput = ref();

    const fnSendMessage = inject('SendMessage')
    const fnCloseTalk = inject('CloseTalk')

    const comments = ref([]);
    const submitting = ref(false);

    const handleSubmit = () => {
      if (!message.value) {
        return;
      }

      fnSendMessage(props.talkId, message.value, "")
      message.value = ""
    };

    const handleCloseTalk = () => {
      fnCloseTalk()
    }


    const readAndUpload = (file) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        fnSendMessage(props.talkId, "", e.target.result)
      };
      reader.readAsDataURL(file);
    }

    const fileChange = (event) => {
      console.log(event);

      const items = event.clipboardData.items;
      if(items === undefined){
        return
      }

      for (let i = 0; i < items.length; i++) {
        console.log(items[i].type)
        if (items[i].type.indexOf("image") === -1 && items[i].type.indexOf("file") === -1) continue;
        readAndUpload(items[i].getAsFile())
      }
    }

    const beforeUpload = file => {
      readAndUpload(file)
    }

    const messagePosition = (message) => {
      if (props.customerMode) {
        return message.customerMessage ? "right" : "left";
      }

      return message.customerMessage ? "left" : "right"
    }

    const {proxy} = getCurrentInstance()

    const messageTitle = message => {
      return message.user + " " + proxy.$dateFormat(new Date(message.at * 1000))
    }

    watch(() => props.messagesIn, async () => {
      await nextTick()
      messageContainer.value.$el.scrollTo({top: messageContainer.value.$el.scrollHeight});
      messageInput.value.focus()
    }, {deep:true});


    const message = ref('');

    const handleEnter = (e) => {
      if (e.altKey) {
        const blurIndex = e.srcElement.selectionStart;
        message.value = message.value.substring(0, blurIndex) + '\n' + message.value.substring(blurIndex, message.value.length)

        return
      }

      e.preventDefault()
      handleSubmit()
    }

    const smallMedia = ref(false)
    const mQuery = window.matchMedia('(max-width: 300px)')
    smallMedia.value = mQuery.matches
    mQuery.addListener((e) => {
      smallMedia.value = e.matches
    })
    return {
      comments,
      submitting,
      message,
      handleEnter,
      fileChange,
      beforeUpload,
      messagePosition,
      messageTitle,
      messageContainer,
      messageInput,
      handleSubmit,
      handleCloseTalk,
      fnCloseTalk,
      smallMedia,
    };
  }
}
</script>

<style scoped>
.message {
  height:100%;
}
.subElement {
  margin: 10px;
}
</style>
