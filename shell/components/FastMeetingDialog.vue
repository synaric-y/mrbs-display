<template>
	<view class="mask" @click="$emit('close')">
		<!-- 快速会议弹窗 -->
		<view class="popup-quick-meeting">
			<div class="title">{{$t('message.fast_meeting')}}</div>
			
		</view>
	</view>
</template>

<script>
	export default {
		name:"FastMeetingDialog",
		
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss" scoped>
.mask{
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	background-color: rgba(0,0,0,.25);
	z-index: 999;
	// display: flex;
	// flex-direction: row;
	// justify-content: center;
	// align-items: center;
	// backdrop-filter: blur(1rpx);
}

.popup-quick-meeting{
	width: 50%;
	height: 200rpx;
	background-color: #fff;
	border-radius: 4rpx;
	box-shadow: 0 0 4rpx 2rpx rgba(0,0,0,.25);
}
</style>