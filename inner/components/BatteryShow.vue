<template>
	<view class="battery-container">
		<div class="battery-shell">
			<div class="battery-inner" :style="'width:'+currentBatteryInfo.level/100*12+'rpx'"></div>
		</div>
		<div class="battery-pole"></div>
	</view>
</template>

<script>
	import {PageMixin} from '@/mixin/index.js'
	export default {
		name:"BatteryShow",
		mixins:[PageMixin],
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss" scoped>
.battery-container{
	display: flex;
	align-items: center;
	height: 8rpx;
	width: 17rpx;
	
	.battery-shell{
		height: 8rpx;
		width: 15rpx;
		border: 0.5rpx solid #fff;
		padding: 1rpx;
		
		.battery-inner{
			width: 12rpx;
			height: 100%;
			background-color: #fff;
		}
	}
	
	.battery-pole{
		height: 3rpx;
		width: 1rpx;
		background-color: #fff;
	}
	
	
}
</style>