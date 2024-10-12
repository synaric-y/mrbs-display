<template>
	<div class="mask">
		<view class="change-language">
			<LanguageSelect/>
		</view>
		<div class="container">
			<div class="title" :style="'font-size:' + (($i18n.locale=='zh')?25:20) +'rpx'">{{$t('message.activate.welcome')}}</div>
			<div class="form-row">
				<div class="label">{{$t('message.activate.request_url')}}</div>
				<div class="input-wrapper">
					<input inputmode="url" class="my-input" :placeholder="$t('message.activate.placeholder')" v-model="url"/>
					<uni-icons @click="scan" class="scan" color="#333" type="scan" size="25"></uni-icons>
				</div>

				<button class="btn" type="default" @click="verify">{{$t('message.activate.verify')}}</button>
			</div>
			<div class="form-row">
				<div class="form-col">
					<div class="label">{{$t('message.activate.belong_to_area')}}</div>
					<uni-data-select
						class="data-select"
						v-model="area"
						:localdata="areaList"
						:clear="false"
						:placeholder="$t('message.activate.please_select')"
						@change="changeArea"
					></uni-data-select>
				</div>
				<div class="form-col">
					<div class="label">{{$t('message.activate.belong_to_meeting_room')}}</div>
					<uni-data-select
						class="data-select"
						v-model="room"
						:localdata="roomList"
						:placeholder="$t('message.activate.please_select')"
						:clear="false"
					></uni-data-select>
				</div>
			</div>
			<div class="btns">
				<button class="btn" type="default" @click="finish">{{$t('message.activate.finish')}}</button>
			</div>
		</div>
	</div>
</template>

<script>
import LanguageSelect from '../components/LanguageSelect.vue';
export default {
	name:"ActivateView",
	components:{
		LanguageSelect
	},
	emits:['close'],
	data() {
		return {
			url: '',
			area: -1,
			areaList:[
				{ value: 0, text: "上海" },
				{ value: 1, text: "香港" },
			],
			room: -1,
			roomList:[
				{ value: 0, text: "A" },
				{ value: 1, text: "B" },
				{ value: 2, text: "C" },
				{ value: 3, text: "D" },
			]
		};
	},
	onLoad(){ // 获取区域信息
		this.areaList = [
				{ value: 0, text: "上海" },
				{ value: 1, text: "香港" },
			]
		
	},
	methods:{
		changeArea(e){ 
			
			
			this.roomList = [ // 加载房间
					{ value: 0, text: "A" },
					{ value: 1, text: "B" },
					{ value: 2, text: "C" },
					{ value: 3, text: "D" },
				]
		},
		scan(){
			// 允许从相机和相册扫码
			// this.url='aaa'
			const that = this
			uni.scanCode({
				success: function (res) {
					// console.log('条码类型：' + res.scanType);
					// console.log('条码内容：' + res.result);
					
					const result = res.result
					console.log(result);
					
					that.url = result
				},
				fail: function(e){
					console.log(e);
				}
			});
		},
		verify(){
			
		},
		finish(){
			
			// this.url = ''
			// this.area = -1
			// this.room = -1
			
			this.$emit('close')
		}
		
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
	background-color: rgba(0,0,0,.5);
	z-index: 999;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	backdrop-filter: blur(3rpx);
	color: #fff;
	
	.change-language {
		position: fixed;
		top: 24rpx;
		right: 20rpx;
		background-color: rgba(230, 241, 252, 0.25);
		font-size: 12rpx;
		color: white;
		line-height: 22rpx;
		border-radius: 4rpx 4rpx 4rpx 4rpx;
		width: 66rpx;
		height: 22rpx;
		text-align: center;
		z-index: 9999
	}
	
	.container{
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		width: 60%;
		height: 60%;
		
		
		.title{
			width: 100%;
			font-size: 25rpx;
			text-align: center;
			color: #fff;
			margin-bottom: 10rpx;
		}
		
		.form-row{
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: 10rpx;
			font-size: 12rpx;
			height: 25rpx;
			width: 100%;
			
			.label{
				// min-width: 60rpx;
				flex-shrink: 0;
			}
			
			.input-wrapper{
				height: 100%;
				width: 100%;
				border-radius: 3rpx;
				padding: 0 5rpx 0 10rpx;
				background-color: #fff;
				display: flex;
				flex-direction: row;
				gap: 5rpx;
				
				.my-input{
					height: 25rpx;
					line-height: 25rpx;
					width: 100%;
					color: #333;
				}
				
				.scan{
					flex-shrink: 0;
				}
			}
			

			
			.data-select{
				min-width: 90rpx;
				height: 100%;
				color: #333;
				font-size: 12rpx;
			}
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				line-height: 25rpx;
				background-color: #591bb7;
				color: #fff;
			}
			
			.form-col{
				display: flex;
				flex-direction: row;
				gap: 10rpx;
			}
		}
		

		
		.btns{
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			width: 100%;
			margin-top: 30rpx;
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				background-color: #591bb7;
				color: #fff;
				margin: 0 0 0 58rpx;
			}
		}
	}
	
}
</style>