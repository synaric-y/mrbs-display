// 页面路径：store/index.js 
import { createStore } from 'vuex'

//Vuex.Store 构造器选项
const store = createStore({
	state: { //存放状态
		"theme": "default",
		"status": "online"
	},
	getters: {
		currentTheme: state => {
			return state.theme
		},
		currentStatus: state=>{
			return state.status
		}
	},
	mutations: {
		changeTheme(state, newTheme) { // 变更状态
			state.theme = newTheme
		},
		changeStatus(state, newStatus) { // 变更状态
			state.status = newStatus
		}
	}
})
export default store