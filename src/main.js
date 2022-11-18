import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {Button,Switch,Collapse, List, Avatar, Row, Col, Badge, Image, Comment, Input, Form, Upload } from 'ant-design-vue'
import * as antIcons from "@ant-design/icons-vue"
import axios from '@/api/axios.js'
import moment from "moment";
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'

const app = createApp(App).use(Button).use(Switch).use(Collapse).use(List).use(Avatar).use(Row).use(Col)
app.use(Badge).use(Image).use(Comment).use(Input).use(Form).use(Upload)

Object.keys(antIcons).forEach(key => {
    app.component(key, antIcons[key])
})

app.config.globalProperties.$antIcons = antIcons

app.use(PerfectScrollbar)

app.use(store).use(router).mount('#app')

app.config.globalProperties.$axios = axios
app.config.globalProperties.$dateFormat = (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

app.directive('focus', {
    mounted(el) {
        el.focus()
    }
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? to.meta.title : 'TalkFe';
    next()
})