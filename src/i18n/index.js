import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

const i18n = createI18n({
  legacy: false, // 让 setup 函数可以通过 t 访问
  globalInjection: true, // 让 template 可以像 vue2 那样使用 $t 来访问
  fallbackLocale: 'zh',
  locale: localStorage.getItem('locale') || navigator.language.slice(0, 2),
  messages:{
    zh,
    en
  }
});

export default i18n;
