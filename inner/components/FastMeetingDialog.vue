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
			:scale="scale"
			@changing="autoCloseRefresh"/>
			<input @input="wordLimit1" :class="'my-input '+inputBlink1" :maxlength="inputMaxLength1"  :placeholder="$t('message.fast_meeting.theme')" v-model="theme"/>
			<input @input="wordLimit2" :class="'my-input '+inputBlink2" :maxlength="inputMaxLength2" :placeholder="$t('message.fast_meeting.name')" v-model="booker"/>
			
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
	import {SEC_PER_HOUR,SEC_PER_MINUTE,nextScaleTs} from '@/utils/timestampTool.js'
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
		props:['currentTime','meetings','avaliableHours','areaLb','areaUb','scale'], // 当前时间戳（10位），会议数组，可预约多少小时
		emits:['close','success','fail'],
		data() {
			return {
				autoCloseTimer: null, // 自动关闭弹窗定时器
				leftHandle: nextScaleTs(this.currentTime,this.scale*SEC_PER_MINUTE),
				rightHandle: nextScaleTs(this.currentTime,this.scale*SEC_PER_MINUTE),
				// lb: nextScaleTs(this.currentTime,15*60) - SEC_PER_HOUR,
				// ub: nextScaleTs(this.currentTime,15*60) + (1+this.avaliableHours)*SEC_PER_HOUR,
				disabled: false,
				theme: "",
				booker: "",
				inputMaxLength1: 20,
				inputMaxLength2: 20,
				inputBlink1: '',
				inputBlink2: ''
			};
		},
		mounted() {
			
			this.autoCloseRefresh() // 开启定时器
			console.log(this.autoCloseTimer);
			
		},
		unmounted(){
			console.log('组件销毁');
			
			// 清空旧的定时器
			if(this.autoCloseTimer){ 
				clearTimeout(this.autoCloseTimer)
				this.autoCloseTimer = null
			}
		},
		methods:{
			autoCloseRefresh(){
				
				console.log('刷新定时器');
				
				// 清空旧的定时器
				if(this.autoCloseTimer){ 
					clearTimeout(this.autoCloseTimer)
					this.autoCloseTimer = null
				}
				
				// 开启新的定时器
				this.autoCloseTimer = setTimeout(()=>{
					this.$emit('close')
				},30*1000) // 30s自动关闭
			},
			wordLimit1(e){
				
				this.autoCloseRefresh() // 刷新定时器
				
				const len = e.detail.value.length
				console.log(len);
				
				if(len>=this.inputMaxLength1) this.inputBlink1 = 'input-blink'
				else this.inputBlink1 = ''
			},
			wordLimit2(e){
				
				this.autoCloseRefresh() // 刷新定时器
				
				const len = e.detail.value.length
				console.log(len);
				
				if(len>=this.inputMaxLength2) this.inputBlink2 = 'input-blink'
				else this.inputBlink2 = ''
			},
			closeDialog(){
				this.$emit('close')
			},
			cancelReserve(){
				this.theme = ''
				this.booker = ''
				
				this.$emit('close')
			},
			testNumber(val){ // 判断是否为纯数字
				const str = /^[0-9]+$/
				const reg = new RegExp(str)
				return reg.test(val)
			},
			confirmReserve(){
				// 校验
				if(this.theme && this.theme.length>this.inputMaxLength1){
					uni.showToast({
						title: this.$t('message.fast_meeting.theme_too_long'), 
						icon: 'none'
					})
					return
				}
				if(this.booker && this.booker.length>this.inputMaxLength2){
					uni.showToast({
						title: this.$t('message.fast_meeting.booker_too_long'), 
						icon: 'none'
					})
					return
				}
				
				const pack = {
					"begin_time": this.leftHandle,
					"end_time": this.rightHandle,
					"booker": this.testNumber(this.booker)?('"'+this.booker+'"'):this.booker,
					"theme": this.testNumber(this.theme)?('"'+this.theme+'"'):this.theme
				}
				
				console.log(pack);
				
				quickMeetApi(this.currentBaseURL,pack)
				.then(res => {
					
					const code = res.data.code
					const data = res.data.data
					
					console.log(code,data);
						
					if(code==0) this.$emit('success') 
					else this.$emit('fail')

				})
				.catch((e) => {
					console.error(e)
					this.$emit('fail')
				})
				.finally(()=>{
					this.theme = ''
					this.booker = ''
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
	height: 90%;
	padding: 20rpx 40rpx;
	background-color: #fff;
	border-radius: 4rpx;
	box-shadow: 0 0 4rpx 2rpx rgba(0,0,0,.25);
	overflow-y: auto;
	
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
	

	@keyframes blink {
		50% {
			border-color: var(--color-danger-light);
		}
	}
	
	.my-input{
		border-width: 1rpx;
		border-style: solid;
		border-color: #ccc;
		
		border-radius: 3rpx;
		height: 30rpx;
		padding-left: 10rpx;
		margin-bottom: 10rpx;
	}
	
	.input-blink{
		animation: blink 0.3s 5 ease-in-out;
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