<template>
	<view class="mask">
		<!-- 快速会议弹窗 -->
		<!-- click.stop是兼容写法 -->
		<view class="popup-quick-meeting">
			
			<div class="header">
				<div class="title">{{$t('message.fast_meeting')}}</div>
				<uni-icons type="closeempty" size="30" @click="closeDialog"></uni-icons>
			</div>
			<TimeStepperScroll 
			:lb="lb" 
			:ub="ub" 
			:meetings="[]"
			v-model:leftHandle="leftHandle"
			v-model:rightHandle="rightHandle"
			:currentDate="currentTime"
			v-model:disabled="disabled"
			:isFirst="false"
			:scale="15"/>
			<input class="my-input" placeholder="Theme" v-model="theme"/>
			<input class="my-input" placeholder="Booker" v-model="booker"/>
			<div class="info">可预定当前1小时内的空闲时间</div>
			<div class="btns">
				<button class="btn btn-default" type="default" @click.stop="cancelReserve">Cancel</button>
				<button class="btn btn-confirm" type="default" @click.stop="confirmReserve">Confirm</button>
			</div>
		</view>
	</view>
</template>

<script>
	import TimeStepperScroll from './TimeStepperScroll.vue';
	import {getNearestNextTime} from '@/utils/timeTool.js'
	export default {
		name:"FastMeetingDialog",
		components:{
			TimeStepperScroll
		},
		props:['currentTime'],
		emits:['close','confirm'],
		data() {
			return {
				leftHandle: 8,
				rightHandle: 12,
				lb: getNearestNextTime(this.currentTime,15)-1,
				ub: getNearestNextTime(this.currentTime,15)+2,
				disabled: false,
				theme: "",
				booker: ""
			};
		},
		methods:{
			closeDialog(){
				this.$emit('close')
			},
			dummy(){
				// 取消冒泡
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
			quickMeet(confirm) {
				if (isNaN(this.roomId)) {
					uni.showToast({
						title: this.$t('message.roomNumberError'),
						icon: 'none'
					})
					return
				}
				console.log('this.roomId:', this.roomId)
				uni.request({
					url: `${HOST}/web/appapi/api.php?act=book_fast_meeting`,
					method: "POST",
					header: {
						'Content-type': 'application/json',
						'Accept-Language': this.languageSet
					},
					data: {
						room_id: this.roomId,
						confirm: confirm
					},
					success: (res) => {
						let data = res.data;
						console.log('quickMeet返回数据成功data:', data);
						if(confirm == 0 && data && data.data) {
							this.showQuickMeeting = true;
							this.quickMeetingMsg = data.data.time;
							console.log(this.quickMeetingMsg);
							return;
						} 
						let msg = '';
						if (data.code == -1) {
							msg = this.$t('message.noRoom');
						} else if (data.code == -2) {
							msg = this.$t('message.noFreeRoom');
						} else if (data.code == 0) {
							msg = this.$t('message.createMeetSuccess');
						}
						uni.showToast({
							title: msg,
							icon: 'none'
						})
					},
					fail: (e) => {
						console.error(e)
					}
				})
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
	height: 80%;
	padding: 20rpx 40rpx;
	background-color: #fff;
	border-radius: 4rpx;
	box-shadow: 0 0 4rpx 2rpx rgba(0,0,0,.25);
	
	.header{
		
		display: flex;
		justify-content: space-between;
		
		.title{
			font-size: 15rpx;
			font-weight: 700;
			margin-bottom: 5rpx;
			colot: #666666;
		}
	}
	

	
	.my-input{
		border: 1rpx solid #ccc;
		border-radius: 3rpx;
		height: 30rpx;
		padding-left: 10rpx;
		margin-bottom: 10rpx;
	}
	
	.info{
		font-size: 10rpx;
		color: #666666;
		height: 30rpx;
		line-height: 30rpx;
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