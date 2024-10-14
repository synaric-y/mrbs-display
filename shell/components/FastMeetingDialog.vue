<template>
	<view class="mask">
		<!-- 快速会议弹窗 -->
		<!-- click.stop是兼容写法 -->
		<view class="popup-quick-meeting">
			
			<div class="header">
				<div class="title">{{$t('message.fast_meeting.title')}}</div>
				<uni-icons type="closeempty" size="30" @click="closeDialog"></uni-icons>
			</div>
			<div class="info">{{$t('message.fast_meeting.tip_left')+avaliableHours+$t('message.fast_meeting.tip_right')}}</div>
			<div class="tip">
				
			</div>
			<TimeStepperScroll 
			:lb="lb" 
			:ub="ub" 
			:meetings="meetings"
			v-model:leftHandle="leftHandle"
			v-model:rightHandle="rightHandle"
			:currentTime="currentTime"
			v-model:disabled="disabled"
			:isFirst="false"
			:scale="scale"/>
			<input class="my-input" :placeholder="$t('message.fast_meeting.theme')" v-model="theme"/>
			<input class="my-input" :placeholder="$t('message.fast_meeting.name')" v-model="booker"/>
			
			<div class="btns">
				<button class="btn btn-default" type="default" @click.stop="cancelReserve">{{$t('message.fast_meeting.cancel')}}</button>
				<button class="btn btn-confirm" type="default" @click.stop="confirmReserve">{{$t('message.fast_meeting.confirm')}}</button>
			</div>
		</view>
	</view>
</template>

<script>
	import TimeStepperScroll from './TimeStepperScroll.vue';
	import {getNearestNextTime} from '@/utils/timeTool.js'
	import {SEC_PER_HOUR,nextScaleTs} from '@/utils/timestampTool.js'

	export default {
		name:"FastMeetingDialog",
		components:{
			TimeStepperScroll
		},
		props:['currentTime','meetings','avaliableHours'], // 当前时间戳（10位），会议数组，可预约多少小时
		emits:['close','confirm'],
		data() {
			return {
				leftHandle: nextScaleTs(this.currentTime,15*60),
				rightHandle: nextScaleTs(this.currentTime,15*60),
				lb: nextScaleTs(this.currentTime,15*60) - SEC_PER_HOUR,
				ub: nextScaleTs(this.currentTime,15*60) + (1+this.avaliableHours)*SEC_PER_HOUR,
				disabled: false,
				theme: "",
				booker: "",
				scale: 15,
			};
		},
		methods:{
			closeDialog(){
				this.$emit('close')
			},
			cancelReserve(){
				this.theme = ''
				this.booker = ''
				
				this.$emit('close')
			},
			confirmReserve(){
				// 提交逻辑
				this.theme = ''
				this.booker = ''
				this.$emit('close')
				this.$emit('confirm')
			},
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
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	backdrop-filter: blur(1rpx);
}

.popup-quick-meeting{

	width: 80%;
	height: 90%;
	padding: 20rpx 40rpx;
	background-color: #fff;
	border-radius: 4rpx;
	box-shadow: 0 0 4rpx 2rpx rgba(0,0,0,.25);
	
	.header{
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		
		.title{
			font-size: 15rpx;
			font-weight: 700;
			colot: #666666;
		}
		
	}
	
	.info{
		font-size: 14rpx;
		color: #591bb7;
		height: 30rpx;
		line-height: 30rpx;
		margin-bottom: 5rpx;
	}
	

	
	.my-input{
		border: 1rpx solid #ccc;
		border-radius: 3rpx;
		height: 30rpx;
		padding-left: 10rpx;
		margin-bottom: 10rpx;
	}
	
	
	
	.btns{
		margin-top: 20rpx;
		display: flex;
		justify-content: space-between;
		
		.btn{
			width: 35%;
			margin: 0;
		}
		
		.btn-confirm{
			background-color: #591bb7;
			color: #fff;
		}
		
		.btn-default{
			background-color: #bebebe;
			color: #fff;
		}
	}
}
</style>