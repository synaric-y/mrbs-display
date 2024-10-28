<template>
	<view class="mask">
		<!-- 快速会议弹窗 -->
		<!-- click.stop是兼容写法 -->
		<view class="popup-quick-meeting">
			
			<div class="header">
				<div class="title">{{$t('message.fast_meeting.title')}}</div>
				<uni-icons type="closeempty" size="30" @click="closeDialog"></uni-icons>
			</div>
			<div :class="'info info'+(currentTheme!='dark'?'':'-dark')">{{$t('message.fast_meeting.tip_left')+avaliableHours+$t('message.fast_meeting.tip_right')}}</div>
			<div class="tip">
				
			</div>
			<TimeStepperScroll 
			:lb="areaLb" 
			:ub="areaUb" 
			:areaLb="areaLb"
			:areaUb="areaUb"
			:meetings="meetings"
			v-model:leftHandle="leftHandle"
			v-model:rightHandle="rightHandle"
			:currentTime="currentTime"
			v-model:disabled="disabled"
			:isFirst="false"
			:avaliableHours="avaliableHours"
			:scale="scale"/>
			<input @input="wordLimit1" :class="'my-input ' + inputClass1" maxlength="50"  :placeholder="$t('message.fast_meeting.theme')" v-model="theme"/>
			<input @input="wordLimit2" :class="'my-input ' + inputClass2" maxlength="30" :placeholder="$t('message.fast_meeting.name')" v-model="booker"/>
			
			<div class="btns">
				<button class="btn btn-default" type="default" @click.stop="cancelReserve">{{$t('message.fast_meeting.cancel')}}</button>
				<button :class="'btn btn-confirm btn-confirm'+(currentTheme!='dark'?'':'-dark')" type="default" @click.stop="confirmReserve">{{$t('message.fast_meeting.confirm')}}</button>
			</div>
		</view>
	</view>
</template>

<script>
	import TimeStepperScroll from './TimeStepperScroll.vue';
	import {getNearestNextTime} from '@/utils/timeTool.js'
	import {SEC_PER_HOUR,nextScaleTs} from '@/utils/timestampTool.js'
	import { PageMixin } from '@/mixin';
	import {
		quickMeetApi,
		quickMeetMessageMapping,
		syncRoomApi,
		getSettingApi
	} from '@/api/api.js'

	export default {
		mixins: [PageMixin],
		name:"FastMeetingDialog",
		components:{
			TimeStepperScroll
		},
		props:['currentTime','meetings','avaliableHours','areaLb','areaUb'], // 当前时间戳（10位），会议数组，可预约多少小时
		emits:['close'],
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
				inputClass1: "",
				inputClass2: "",
			};
		},
		methods:{
			wordLimit1(e){
				console.log('文本输入');
				const len = e.detail.value.length
				
				if(len>50) this.inputClass1 = 'input-blink'
			},
			wordLimit2(e){
				console.log('文本输入');
				const len = e.detail.value.length
				
				if(len>30) this.inputClass2 = 'input-blink'
			},
			closeDialog(){
				this.$emit('close')
			},
			cancelReserve(){
				this.theme = ''
				this.booker = ''
				
				this.$emit('close')
			},
			confirmReserve(){
				// 校验
				if(this.theme && this.theme.length>50){
					uni.showToast({
						title: this.$t('message.fast_meeting.theme_too_long'), 
						icon: 'none'
					})
					return
				}
				if(this.booker && this.booker.length>30){
					uni.showToast({
						title: this.$t('message.fast_meeting.booker_too_long'), 
						icon: 'none'
					})
					return
				}
				
				const pack = {
					"device_id": 'E37A3ACCCF19E6BD73C03DE47EB1D41B',
					"begin_time": this.leftHandle,
					"end_time": this.rightHandle,
					"is_charge": 0,
					"battery_level": 45,
					"booker": this.booker,
					"theme": this.theme
				}
				
				console.log(pack);
				
				quickMeetApi(this.currentBaseURL,pack)
				.then(res => {
					
					const code = res.data.code
					const data = res.data.data
					
					console.log(code,data);
						
						if(code==0){
							uni.showToast({
								title: this.$t('message.fast_meeting.success'), //转成字符串
								icon: 'none'
							})
						}else{
							uni.showToast({
								title: this.$t('message.fast_meeting.fail'), //转成字符串
								icon: 'none'
							})
						}
				
					})
					.catch((e) => {
						console.error(e)
						uni.showToast({
							title: this.$t('message.fast_meeting.fail'), //转成字符串
							icon: 'none'
						})
					})
				
				this.theme = ''
				this.booker = ''
				this.$emit('close')
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
			color: #666666;
		}
		
	}
	
	.info{
		font-size: 14rpx;
		color: var(--color-primary);
		
		&-dark{
			color: var(--dark-color-primary);
		}
		
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
	
	.input-blink{
		border: 1rpx solid red!important;
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
			background-color: var(--color-primary);
			color: #fff;
			
			&-dark{
				background-color: var(--dark-color-primary);
			}
		}
		
		.btn-default{
			background-color: #bebebe;
			color: #fff;
		}
	}
}
</style>