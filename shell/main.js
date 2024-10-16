
	
// #ifndef VUE3

	import App from './App'
	import store from './store'
	
	import i18n from './src/i18n'
	
	import Vue from 'vue'
	import './uni.promisify.adaptor'
	
	Vue.config.productionTip = false
	App.mpType = 'app'
	
	// Vue.prototype.$store = store
	
	const app = new Vue({
		i18n,
		store
	  ...App
	})
	app.$mount()
	
// #endif

// #ifdef VUE3

	import { createSSRApp } from 'vue'
	import App from './App'
	import store from './store'
	import i18n from './src/i18n'
	
	// const app = createSSRApp(App)
	// app.use(i18n)
	// app.mount('#app')


	export function createApp() {
	  const app = createSSRApp(App)
	  app.use(i18n)
	  app.use(store);
	  return {
		app
	  }
	}
	
// #endif
