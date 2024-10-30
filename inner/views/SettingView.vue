<template>
	<div class="mask">
<!-- 		<view class="change-language">
			<LanguageSelect/>
		</view> -->
		
		<div class="left-view">
			<div class="title">{{$t('message.setting.left.basic_info')}}</div>

			<div class="info-list">
				<div class="info-row">
					{{$t('message.setting.left.unique_id')}}: {{currentDeviceInfo.deviceId}}
				</div>
				<div class="info-row">
					{{$t('message.setting.left.equipment_type')}}: {{currentDeviceInfo.brand}}
				</div>
				<div class="info-row">
					{{$t('message.setting.left.battery')}}: {{currentBatteryInfo.level+'%'}}
				</div>
				<div class="info-row">
					
				</div>
				<div class="info-row">
					{{$t('message.setting.left.room_area')}}: {{basicInfo.room+" "+basicInfo.area}}
				</div>
				<div class="info-row">
					
				</div>
				<div class="info-row">
					{{$t('message.setting.left.online_status')}}: {{this.currentStatus=='online'?$t('message.setting.left.normal'):$t('message.setting.left.offline')}}
				</div>
				<div class="info-row">
					
				</div>
				<div class="info-row">
					{{$t('message.setting.left.about_us')}}
				</div>
				<div class="info-row">
					
				</div>
			</div>
			
			<div class="copyright">
				Copyright © 2024 BCC.Global/商霖华通
			</div>
		</div>
		<div class="right-view">
			<div class="header">
				<uni-icons type="left" size="30" @click="cancel"></uni-icons>
				<div class="title">{{$t('message.setting.right.setting')}}</div>
			</div>
			<div class="container">
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.brightness')}}</div>
					<div class="slider-wrapper">
						<slider :value="initialBrightness" @changing="changeBrightness" :activeColor="currentTheme!='dark'?'#591BB7':'#285fd4'" backgroundColor="#ffffff" block-color="#ffffff" block-size="20" />
					</div>
					<div class="slider-value">{{brightness+'%'}}</div>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.volume')}}</div>
					<div class="slider-wrapper">
						<slider :value="initialVolume" @changing="changeVolume" @change="testVolume" :activeColor="currentTheme!='dark'?'#591BB7':'#285fd4'" backgroundColor="#ffffff" block-color="#ffffff" block-size="20" />
					</div>
					<div class="slider-value">{{volume+'%'}}</div>
				</div>
				<div class="form-row">
					<div class="form-col">
						<div class="label">{{$t('message.setting.right.area')}}</div>
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
						<div class="label">{{$t('message.setting.right.meeting_room')}}</div>
						<uni-data-select
							class="data-select"
							v-model="room"
							:localdata="roomList"
							:placeholder="$t('message.activate.please_select')"
							:clear="false"
						></uni-data-select>
					</div>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.request_url')}}</div>
					<div class="input-wrapper">
						<input class="my-input" v-model="requestURL"/>
					</div>
				</div>
<!-- 				<div class="form-row">
					<div class="label">{{$t('message.setting.right.time_format')}}</div>
					<uni-data-select
						class="data-select"
						style="width: 90rpx;"
						v-model="timeFormat"
						:localdata="timeFormatList"
						:placeholder="$t('message.activate.please_select')"
						:clear="false"
					></uni-data-select>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.theme_color')}}</div>
					<div class="checkboxes">
						<div class="checkbox-group" v-for="item in themeColorList">
							<div :class="themeColor==item.value?('my-checkbox my-checkbox'+(currentTheme!='dark'?'':'-dark')):'my-checkbox my-checkbox-disabled'" @click="changeThemeColor(item.value)">
								<uni-icons v-if="themeColor==item.value" type="checkmarkempty" :color="currentTheme!='dark'?'#591BB7':'#285fd4'" size="20"></uni-icons>
							</div>
							
							<div class="colors">
								<div v-for="color in item.colors" class="color" :style="'background-color:'+color"></div>
							</div>
						</div>
					</div>
				</div> -->
				
				<div class="btns">
					<button class="btn btn-default" type="default" @click="cancel">{{$t('message.setting.right.cancel')}}</button>
					<button :class="'btn btn'+(currentTheme!='dark'?'':'-dark')" type="default" @click="submit">{{$t('message.setting.right.submit')}}</button>
					
				</div>
			</div>
		</div>
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog type="warn" :cancelText="$t('message.setting.right.cancel')" :confirmText="$t('message.setting.right.confirm')" :title="$t('message.setting.right.notice')" :content="$t('message.setting.right.restart')" @confirm="restart()"
				@close="dialogClose"></uni-popup-dialog>
		</uni-popup>
		
		
	</div>
</template>

<script>
import LanguageSelect from '../components/LanguageSelect.vue';
import {PageMixin} from '@/mixin/index.js'
import { getAllAreaApi,getAllRoomsApi,activateDeviceApi,getSettingApi,changeBindApi } from '@/api/api';
export default {
	mixins:[PageMixin],
	name:"SettingView",
	components:{
		LanguageSelect
	},
	emits:['close'],
	data() {
		return {
			basicInfo:{
				room: '',
				area: '',
			},
			
			initialBrightness: 50,
			initialVolume: 50,
			
			brightness: 50,
			volume: 50,
			
			area: -1,
			room: -1,
			
			requestURL: '',
			oldRequestURL: '',
			timeFormat: 0,
			themeColor: 0,
			
			areaList:[],
			roomList:[],
			timeFormatList:[
				{ value: 0, text: this.$t('message.setting.right.12hour_format') },
				{ value: 1, text: this.$t('message.setting.right.24hour_format') },
			],
			themeColorList:[
				{ value: 0, colors:['#591bb7','#b71b1b']},
				{ value: 1, colors:['#337ecc','#ff7b00']},
			]
		};
	},
	mounted() {
		document.addEventListener("getInitialBrightness", (e) => {
			//webview接收uniapp传过来的信息
			console.log('getInitialBrightness', e.detail.value)
			
			this.initialBrightness = this.brightness = Math.round(e.detail.value*100)
			
		}, false)
		
		document.addEventListener("getInitialVolume", (e) => {
			//webview接收uniapp传过来的信息
			console.log('getInitialVolume', e.detail.value)
			
			this.initialVolume = this.volume = Math.round(e.detail.value*100)
			
		}, false)
	},
	created(){
	
		console.log("设置页面初始化");
		this.initAreaAndRoom()
		
		// store必须在created初始化
		this.requestURL = this.currentBaseURL
		this.oldRequestURL = this.currentBaseURL
		this.timeFormat = this.currentTimeFormat=='12'?0:1
		this.themeColor = this.currentTheme=='default'?0:1
		
		
		this.tryGetBrightnessAndVolume()
		
		
	},
	methods:{
		tryGetBrightnessAndVolume(){
			//h5向app传参，触发事件
			console.log('postMessage');
			uni.webView.postMessage({
				data: {
					type: 'brightness'
				}
			}, '*');
			
			uni.webView.postMessage({
				data: {
					type: 'volume'
				}
			}, '*');
		},
		initAreaAndRoom(){
			const that = this
			getSettingApi(this.currentBaseURL,{})
			.then(res=>{
				console.log(res);
				that.basicInfo.room = res.data.data.room
				that.basicInfo.area = res.data.data.area
				
				getAllAreaApi(that.currentBaseURL,{
				}).then(res=>{
					console.log(res);
					
					const li = res.data.data
					let tempList = []
					for(let item of li) tempList.push({value:item.id, text: item.area_name})
					that.areaList = tempList
					
					const areaIdx = that.areaList.findIndex(item=>{return item.text == that.basicInfo.area})
					console.log(areaIdx);
					that.area = that.areaList[areaIdx].value
					console.log(that.area);
					
					getAllRoomsApi(that.currentBaseURL,{
						"type": "area",
						"id": that.area,
					}).then(res=>{
						console.log(JSON.stringify(res));
						
						const li = res.data.data.areas.rooms
						let tempList = []
						for(let item of li){
							tempList.push({value:item.room_id, text: item.room_name})
						}
						that.roomList = tempList
						
						const roomIdx = that.roomList.findIndex(item=>{return item.text == that.basicInfo.room})
						console.log(roomIdx);
						that.room = that.roomList[roomIdx].value
						console.log(that.room);
					})
					
				})
			})
		},
		
		changeBrightness(e){
			this.brightness = e.detail.value
			
			uni.webView.postMessage({
				data: {
					type: 'changeBrightness',
					value: e.detail.value / 100
				}
			}, '*');
			
		},
		changeVolume(e){
			this.volume = e.detail.value
			
			uni.webView.postMessage({
				data: {
					type: 'changeVolume',
					value: e.detail.value / 100
				}
			}, '*');
			
		},
		testVolume(e){ // 完成音量调整，测试音量
			uni.webView.postMessage({
				data: {
					type: 'testVolume'
				}
			}, '*');
		},
		changeArea(e){
			this.roomList = [] // 清空现有房间
			this.room = -1 // 恢复默认值
			getAllRoomsApi(this.currentBaseURL,{
				"type": "area",
				"id": this.area,
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
		changeThemeColor(v){
			this.themeColor = v
			this.changeTheme(v==0?'default':'dark')
			console.log(v);
		},
		submit: async function(){
			
			const that = this
			
			if(!this.requestURL || this.requestURL==''){
				uni.showToast({
					title: this.$t('message.setting.right.url_empty'),
					icon: 'none',
				})
				return
			}
			
			// 如果有区域和房间就换绑
			console.log(this.area,this.room);
			if(this.area && this.area!=-1 && this.room && this.room!=-1){	
				console.log(347);
				await changeBindApi(that.currentBaseURL,{
					"room_id": that.room,                 //房间id
				}).then(()=>{
					
				}).catch(e=>{
					uni.showToast({
						title: this.$t('message.netDataError'),
						icon: 'none',
					})
				})
			}
			
			// 修改请求地址
			if(that.oldRequestURL!==that.requestURL){
				uni.showLoading({
					title:this.$t('message.setting.right.validating')
				})
				// 尝试调这个接口，返回成功就是联通了
				await getAllAreaApi(that.requestURL,{
				})
				.then(res=>{
					if(res.data.code != 0){ // 返回错误
						throw new Error('invalid url')
					}else{ // 验证通过
						that.changeBaseURL(that.requestURL)
						that.$refs.popup.open()
					}
				})
				.catch(e=>{ // 请求超时
					uni.showToast({
						title: this.$t('message.setting.right.invalid_url'),
						icon: 'none',
					})
					console.log(e);
				}).finally(()=>{
					uni.hideLoading()
				})
				
			}else{
				uni.showToast({
					title: that.$t('message.setting.right.setting_success'),
					icon: 'none',
				})
				that.$emit('close')
			}
			
			
		},
		restart(){
			this.$refs.popup.close()
			uni.webView.postMessage({
				data: {
					type: 'restart'
				}
			}, '*');
		},
		dialogClose(){
			this.$refs.popup.close()
		},
		cancel(){
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
	background-color: #fff;
	z-index: 999;
	display: flex;
	flex-direction: row;
	
	.left-view{
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		color: #fff;
		margin: 0;
		padding: 20rpx 25rpx 10rpx;
		width: 350rpx;
		height: 100%;
		background-color: #333333;
		font-size: 12rpx;
		
		.title{
			flex-shrink: 0;
			font-size: 18rpx;
			font-weight: 700;
		}
		
		.info-list{
			height: 100%;
			.info-row{
				min-height: 25rpx;
				line-height: 25rpx;
				word-break:break-all;
			}
		}
		
		.copyright{
			flex-shrink: 0;
			font-size: 10rpx;
		}
	}
	
	.right-view{
		display: flex;
		flex-direction: column;
		color: #333;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 15rpx 80rpx 20rpx 30rpx;
		background-color: #d6d6d6;
		
		.header{
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 10rpx;
			margin-bottom: 20rpx;
			
			.title{
				font-size: 15rpx;
			}
		}
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
				flex-shrink: 0;
			}
			
			.checkboxes{
				display: flex;
				align-items: center;
				gap: 30rpx;
				width: 100%;
				
				.checkbox-group{
					display: flex;
					align-items: center;
					gap: 15rpx;
					
					.my-checkbox{
						
						&-dark{
							border: 1rpx solid var(--dark-color-primary);
						}
						border: 1rpx solid var(--color-primary);
						
						border-radius: 2rpx;
						width: 24px;
						height: 24px;
						display: flex;
						justify-content: center;
						align-items: center;
						transition: all 0.2s;
					}
					
					.my-checkbox-disabled{
						border: 1rpx solid #717171;
						border-radius: 2rpx;
						width: 20px;
						height: 20px;
					}
					
					.colors{
						display: flex;
						align-items: center;
						gap: 15rpx;
						
						.color{
							width: 14rpx;
							height: 14rpx;
						}
					}
				}
			}
			
			
			.slider-wrapper{
				width: 100%;
			}
			.slider-value{
				color: #999;
				min-width: 30rpx;
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
				width: 100%;
				height: 100%;
				color: #333;
				font-size: 12rpx;
			}
			
			.form-col{
				display: flex;
				flex-direction: row;
				gap: 10rpx;
				width: 90%;
			}
		}
		

		
		.btns{
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			width: 100%;
			margin-top: 5rpx;
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				background-color: var(--color-primary);
				color: #fff;
				margin: 0 0 0 58rpx;
				
				&-dark{
					background-color: var(--dark-color-primary);
				}
			}
			
			.btn-default{
				background-color: #fff;
				color: #333;
			}
			
		}
	}
	
}
</style>