import App from './App'

// #ifndef VUE3
import i18n from './src/i18n'
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	i18n,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import i18n from './src/i18n'
// const app = createSSRApp(App)
// app.use(i18n)
// app.mount('#app')

export function createApp() {
  const app = createSSRApp(App)
  app.use(i18n)
  return {
    app
  }
}
// #endif
