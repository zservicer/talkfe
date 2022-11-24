<template>
  <a-collapse class="talk-left talk4h">
    <a-collapse-panel key="1" header="处理中的会话">
      <LeftItem :pending-flag="false" v-model:activated-talk="activatedTalkID" :items="talks" />
    </a-collapse-panel>
    <a-collapse-panel key="2" header="等待处理的会话">
      <LeftItem :pending-flag="true" v-model:activated-talk="activatedPendingTalkID" :items="pendingTalks" />
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
import {defineComponent, onMounted, ref, watch} from 'vue';
import LeftItem from "@/components/LeftItem";
import PerfectScrollbar from 'perfect-scrollbar';

export default defineComponent({
  components: {LeftItem},
  props: {
    pendingTalks: {
      type:Array,
      default:()=> []
    },
    talks: {
      type:Array,
      default:()=> []
    }
  },
  setup(props, {emit}) {
    let activatedTalkID = ref('');
    let activatedPendingTalkID = ref('');
    const ps = ref(null)

    onMounted(()=>{
      const container = document.querySelector('.talk-left');
      ps.value = new PerfectScrollbar(container);
    })

    watch(activatedTalkID, val => {
      emit("activeTalkChanged", val)
    });

    return {
      activatedTalkID,
      activatedPendingTalkID,
    };
  },

});
</script>
