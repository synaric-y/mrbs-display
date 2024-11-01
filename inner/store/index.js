// 页面路径：store/index.js 
import { createStore } from 'vuex'

//Vuex.Store 构造器选项
const store = createStore({
	state: { //存放状态
		"theme": "default", // 主题 "default" | "dark"
		"status": "online", // 在线状态 "online" | "offline"
		"timeFormat": "24", // 时间格式 "12"（有AM的） | "24"
		// "baseURL": "http://172.16.89.161:82", // 请求地址
		"baseURL": "https://meeting-manage-test.businessconnectchina.com:12443", // 请求地址
		
		"deviceInfo": {deviceId:'E37A3ACCCF19E6BD73C03DE47EB1D41B',type:'XiaoMi'},
		"batteryInfo": {isCharging: 0, level: 64},
	},
	getters: {
		currentTheme: state => {
			return state.theme
		},
		currentStatus: state=>{
			return state.status
		},
		currentTimeFormat: state=>{
			return state.timeFormat
		},
		currentBaseURL: state=>{
			return state.baseURL
		},
		currentDeviceInfo: state=>{
			return state.deviceInfo
		},
		currentBatteryInfo: state=>{
			return state.batteryInfo
		}
	},
	mutations: {
		changeTheme(state, newTheme) { // 变更状态
			state.theme = newTheme
		},
		changeStatus(state, newStatus) {
			state.status = newStatus
		},
		changeTimeFormat(state, newTimeFormat) {
			state.timeFormat = newTimeFormat
		},
		changeBaseURL(state, newBaseURL) {
			state.baseURL = newBaseURL
		},
		changeDeviceInfo(state, newDeviceInfo) {
			state.deviceInfo = newDeviceInfo
		},
		changeBatteryInfo(state, newBatteryInfo) {
			state.batteryInfo = newBatteryInfo
		},
	}
})


// 如果 localStorage 中有之前保存的 state，就将其替换当前的 state
let savedState = undefined
if(uni.getStorageSync('vuex-state')) savedState = JSON.parse(uni.getStorageSync('vuex-state'))
if (savedState) {
  store.replaceState(savedState)
}

// 监听 Vuex 的 state 变化，如果有变化就保存到 localStorage 中
store.subscribe((mutation, state) => {
  // console.log(60);
  uni.setStorageSync('vuex-state', JSON.stringify(state))
})

export default store