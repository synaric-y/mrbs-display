<template>
	<web-view id="wv" :src="wvURL" @message="handleWebviewMessage"></web-view>
	<!-- <div style="width: 100vw;height: 100vh;background-color: #ccc;">aaa</div> -->
</template>

<script>
	export default {
		batteryInterval: null,
		data() {
			return {
				wvNode: null,
				wvURL: uni.getStorageSync('webview-url') || 'https://meeting-manage-dev.businessconnectchina.com:11443/display/2.0/index.html', // 默认值
				// wvURL: 'https://meeting-manage-dev.businessconnectchina.com:11443/display/2.0/index.html', // 正式环境
				// wvURL: 'https://meeting-manage-test.businessconnectchina.com:12443/display/2.0/index.html', // 测试环境
				// wvURL: 'https://meeting-manage-test.businessconnectchina.com:12443/display/2.1/index.html', // 测试环境
			}
		},
		onLoad() {
			
			
			
			// #ifdef APP-PLUS

			const pages = getCurrentPages()
			const currentWebview = pages[pages.length - 1].$getAppWebview() // 页面本身的webview

			// 拿到真正的webview
			const that = this
			setTimeout(() => {
				// 这个才是真正的webview
				that.wvNode = currentWebview.children()[0];
				
				// 发送设备信息
				that.sendDeviceInfo()
				
				// 发送电量
				that.sendBatteryInfo()
				// 开启定时器
				that.batteryInterval && clearInterval(that.batteryInterval)
				that.batteryInterval = setInterval(that.sendBatteryInfo, 5 * 60 * 1000) // 5分钟一次
				
				
			}, 2000)
			

			// #endif
			
		},
		methods:{
			handleWebviewMessage(e){
				console.log("接收到消息：" + JSON.stringify(e.detail.data[0]));
				
				const messageType = e.detail.data[0].type
				const val = e.detail.data[0].value
				
				const that = this
				switch(messageType){
					case 'scan': {
						that.sendQRCodeResult()
					}break;
					case 'brightness': {
						that.sendBrightness()
					}break;
					case 'volume': {
						that.sendVolume()
					}break;
					case 'changeBrightness':{
						that.changeBrightness(val)
					}break;
					case 'changeVolume':{
						that.changeVolume(val)
					}break;
					case 'testVolume':{
						that.testVolume()
					}break;
					case 'restart':{
						that.restart()
					}break;
					case 'updateWvURL':{
						that.updateWvURL(val)
					}break;
				}
			},
			updateWvURL(val){
				this.wvURL = val
				
				uni.setStorageSync('webview-url', val) // 存localStorage, 重启之后就生效了
				
				// #ifdef APP-PLUS
				plus.runtime.restart();
				// #endif
			},
			sendDeviceInfo(){
				const that = this
				
				let deviceInfo = uni.getDeviceInfo();
				console.log(JSON.stringify(deviceInfo));
				
				// 传deviceInfo
				that.wvNode.evalJS(
				`document.dispatchEvent(new CustomEvent('getDeviceInfo', {
					detail: {
						value: '${JSON.stringify(deviceInfo)}'
					}
				}))`
				);
			},
			sendBatteryInfo(){
				const that = this
				// 获取电量信息
				uni.getBatteryInfo({
					success: (res) => {
						console.log('获取电量信息res:', res);
						const batteryInfo = res;
						
						// 传batteryInfo
						that.wvNode.evalJS(
						`document.dispatchEvent(new CustomEvent('getBatteryInfo', {
							detail: {
								value: '${JSON.stringify(batteryInfo)}'
							}
						}))`
						);
					}
				})
			},
			sendQRCodeResult(){
				const that = this
				// 允许从相机和相册扫码
				
				// #ifdef APP-PLUS
				uni.scanCode({
					success: function (res) {
						// console.log('条码类型：' + res.scanType);
						// console.log('条码内容：' + res.result);
						
						const result = res.result
						console.log(result);
						
						// 传二维码内容
						that.wvNode.evalJS(
						`document.dispatchEvent(new CustomEvent('getScanResult', {
							detail: {
								value: '${result}'
							}
						}))`
						);
					},
					fail: function(e){
						console.log(e);
					}
				});
				// #endif
			},
			sendBrightness(){
				const that = this
				uni.getScreenBrightness({
					success: function (res) {
						console.log(res);

						that.wvNode.evalJS(
						`document.dispatchEvent(new CustomEvent('getInitialBrightness', {
							detail: {
								value: '${res.value}'
							}
						}))`
						);
					}
				});
			},
			sendVolume(){
				const that = this
				// #ifdef APP-PLUS
				
				that.wvNode.evalJS(
				`document.dispatchEvent(new CustomEvent('getInitialVolume', {
					detail: {
						value: '${plus.device.getVolume()}'
					}
				}))`
				);
				
				// #endif
			},
			changeBrightness(val){
				uni.setScreenBrightness({
					value: val, // 百分比，需要除以100
					success: function () {
						console.log('success');
					}
				});
			},
			changeVolume(val){
				// #ifdef APP-PLUS
				plus.device.setVolume(val) // 百分比，需要除以100
				console.log(plus.device.getVolume()); // 获取当前音量
				// #endif
			},
			testVolume(){
				// #ifdef APP-PLUS
					let main = plus.android.runtimeMainActivity();
					let RingtoneManager = plus.android.importClass("android.media.RingtoneManager");
					let uri = RingtoneManager.getActualDefaultRingtoneUri(main, RingtoneManager.TYPE_NOTIFICATION);  
					let MediaPlayer = plus.android.importClass("android.media.MediaPlayer");  
					let player = MediaPlayer.create(main, uri);  
					player.setLooping(false);  
					player.prepare();  
					player.start();
				// #endif
			},
			restart(){
				// #ifdef APP-PLUS
				plus.runtime.restart();
				// #endif
			}
		},
		onUnload() {
			// 清除定时器
			if (this.batteryInterval) {
				clearInterval(this.batteryInterval)
				this.batteryInterval = null
			}
		}
	}
</script>

<style>
</style>