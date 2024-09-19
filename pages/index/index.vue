<template>
	<view>
		<web-view @onPostMessage="handlePostMessage" src="https://static-mp-49c47afc-c730-484f-983e-b607353d9f80.next.bspapp.com/"></web-view>
	</view>
</template>

<script>
	
	
	export default {
		data() {
		},
		onLoad() {
			uni.$on('syncRoom返回数据成功data', (data) => {
			    console.log('Received event:', data);
			  });
			uni.onMessage((e) => {
			    console.log('Message from WebView:', e.data);
			    // 根据消息内容执行相应的逻辑
			  });
		},
		methods: {
			// webview向外部发送消息
			handlePostMessage(data) {
				console.log("接收到消息：" + JSON.stringify(data.detail));
			},
			// 调用 webview 内部逻辑
			evalJs() {
				this.$refs.webview.evalJs("document.body.style.background ='#00FF00'");
			}
		}
	}
</script>

