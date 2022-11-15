<template>
  <a-list item-layout="horizontal" :data-source="items" style="text-align: left">
    <template #renderItem="{ item }">
      <a-list-item @click="selectTalk({ item })" :style="{ 'background': activatedTalk === item.talkId ? '#ffff80': ''}">
        <template #actions>
          <a-badge :count="item.unreadMessageCount" />
          <a-button v-if="!pendingFlag" type="primary" shape="round" size="large" @click="unlockTalk(item, $event)" :disabled="item.closedFlag">
            <template #icon>
              <StopOutlined />
            </template>
            释放
          </a-button>
          <a-button v-if="pendingFlag" type="primary" shape="round" size="large" @click="lockTalk(item, $event)">
            <template #icon>
              <StopOutlined />
            </template>
            开始处理
          </a-button>
        </template>
        <a-list-item-meta
            :description="item.lastCustomerMessage"
        >
          <template #title>
            <div>{{ item.customerName}}: {{ item.title }}</div>
          </template>
          <template #avatar>
            <a-avatar src="https://joeschmoe.io/api/v1/random" />
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
</template>


<script>
import { defineComponent, inject, toRaw  } from 'vue';
export default defineComponent({
  props: {
    items: {
      type: Array,
      default: () => []
    },
    activatedTalk: String,
    pendingFlag: Boolean,
  },
  setup(props, ctx) {
    const fnLockTalk = inject('LockTalk');
    const fnUnlockTalk = inject('UnlockTalk')

    const lockTalk = (item, e) => {
      fnLockTalk(toRaw(item))
      e.stopPropagation()
    }

    const unlockTalk = (item, e) => {
      fnUnlockTalk(toRaw(item))
      e.stopPropagation()
    }

    const selectTalk = (item) => {
      ctx.emit('update:activatedTalk', item.item.talkId)
    }

    return {
      lockTalk,
      unlockTalk,
      selectTalk,
    }
    }
})
</script>
