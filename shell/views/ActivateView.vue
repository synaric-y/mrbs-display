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

				<button :class="'btn btn'+(currentTheme!='dark'?'':'-dark')" type="default" @click="verify">{{$t('message.activate.verify')}}</button>
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
				<button :class="'btn btn'+(currentTheme!='dark'?'':'-dark')" type="default" @click="finish">{{$t('message.activate.finish')}}</button>
			</div>
		</div>
	</div>
</template>

<script>
import LanguageSelect from '../components/LanguageSelect.vue';
import {mapGetters} from 'vuex';
import { getAllAreaApi,getAllRoomsApi,activateDeviceApi } from '@/api/api';
export default {
	name:"ActivateView",
	components:{
		LanguageSelect
	},
	emits:['close'],
	props:['batteryInfo','deviceInfo'],
	computed: {
	  ...mapGetters(['currentTheme'])
	},
	data() {
		return {
			url: '',
			area: -1,
			areaList:[],
			room: -1,
			roomList:[],
			windowInfo: {}
		};
	},
	created(){ // 获取区域信息 onLoad不生效，那是页面函数，切页面才管用
	
		console.log(79);
	
		this.getAllArea()
		
		this.windowInfo = uni.getWindowInfo();
		console.log(this.windowInfo);
		
	},
	methods:{
		
		getAllArea(){
			const that = this;
			
			getAllAreaApi({
				"is_charging": this.batteryInfo.isCharging,
				"battery_level": this.batteryInfo.level,
			}).then(res=>{
				const li = res.data.data
				
				console.log(res);
				
				let tempList = []
				
				for(let item of li) tempList.push({value:item.id, text: item.area_name})
				
				that.areaList = tempList
				
			}).catch(e=>{console.log(e)})
		},
		changeArea(e){ 
			
			getAllRoomsApi({
				"type": "area",
				"id": this.area,
				"is_charge": this.batteryInfo.isCharging,
				"battery_level": this.batteryInfo.level
			}).then(res=>{
				const li = res.data.data.areas.rooms
				
				let tempList = []
				
				for(let item of li) tempList.push({value:item.room_id, text: item.room_name})
				
				this.roomList = tempList
				
			}).catch(e=>{
				console.log(e)
				uni.showToast({
					title: this.$t('message.netDataError'),
					icon: 'none',
				})
			})
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
			
			const pack = {
				"device_id": this.deviceInfo.deviceId,                //实际设备id
				"version": "1.0.0",                     //设备使用的软件版本？激活时是否直接使用全局的软件版本，还是由前端传入
				"description": "",                      //设备信息
				"resolution": `${this.windowInfo.screenWidth}*${this.windowInfo.screenHeight}`,              //分辨率
				"is_charge": this.batteryInfo.isCharging,                         //是否充电
				"battery_level": this.batteryInfo.level,                    //电量
				"status": 1,                            //是否在线
				"is_set": 0,                            //是否绑定
				"set_time": Math.trunc(new Date().getTime() / 1000),               //绑定时间（时间戳）
				"room_id": this.room                       //绑定的房间号，数据库中的房间号
			}
			
			console.log(pack);
			
			// console.log(this.batteryInfo);
			
			// activateDeviceApi(pack)
			// .then(res=>{
			// 	console.log(res);
			// }).catch(e=>{
			// 	console.log(e);
			// })
			
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
	
	.btn-dark{
		background-color: var(--dark-color-primary)!important;
	}
	
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
				background-color: var(--color-primary);
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
			justify-content: flex-end;
			width: 100%;
			margin-top: 30rpx;
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				background-color: var(--color-primary);
				color: #fff;
				margin: 0 58rpx 0 0;
			}
		}
	}
	
}
</style>