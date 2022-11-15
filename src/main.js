import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {Button} from 'ant-design-vue'
import * as antIcons from "@ant-design/icons-vue"

const app = createApp(App).use(Button)

Object.keys(antIcons).forEach(key => {
    app.component(key, antIcons[key])
})

app.config.globalProperties.$antIcons = antIcons


app.use(store).use(router).mount('#app')

