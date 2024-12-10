<template>
	<div class="mask">
<!-- 		<view class="change-language">
			<LanguageSelect/>
		</view> -->
		
		<div class="left-view">
			<div class="title">{{$t('message.setting.left.basic_info')}}</div>

			<div class="info-list">
				<div class="info-row">
					<div class="info-title">{{$t('message.setting.left.unique_id')}}</div>
					<div class="info-desc">{{currentDeviceInfo.deviceId}}</div>
				</div>
				<div class="info-row">
					<div class="info-title">{{$t('message.setting.left.equipment_type')}}</div>
					<div class="info-desc">{{currentDeviceInfo.brand || $t('message.setting.left.unknown_brand')}}</div>
				</div>
				<div class="info-row">
					<div class="info-title">{{$t('message.setting.left.battery')}}</div>
					<div class="info-desc">{{currentBatteryInfo.level+'%'}}</div>
				</div>
				<div class="info-row">
					<div class="info-title">{{$t('message.setting.left.room_area')}}</div>
					<div class="info-desc">{{basicInfo.room+" "+basicInfo.area}}</div>
				</div>
				<div class="info-row">
					<div class="info-title">{{$t('message.setting.left.online_status')}}</div>
					<div class="info-desc">{{this.currentStatus=='online'?$t('message.setting.left.normal'):$t('message.setting.left.offline')}}</div>
				</div>
				<div class="info-row">
					<div class="info-title">{{$t('message.setting.left.about_us')}}</div>
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
						<input class="my-input" v-model="requestURL" @input="verifyStatus='none'"/>
						<button :loading="verifyStatus=='verifying'" :class="'btn btn'+(currentTheme!='dark'?'':'-dark')" type="default" @click="verify">
							<uni-icons color="#fff" v-if="verifyStatus=='verified'" type="checkmarkempty" size="30"></uni-icons>
							<text v-if="verifyStatus=='verifying'">{{$t('message.activate.verifying')}}</text>
							<text v-if="verifyStatus=='none'">{{$t('message.activate.verify')}}</text>
						</button>
					</div>
				</div>
				
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
import _ from 'lodash'; // lodash，用于数组运算
	
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
			
			verifyStatus: 'none',
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
		this.init();
		
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
		resetRoom(area_id){
			
			console.log(area_id);
			
			const that = this
			
			return new Promise((resolve,reject)=>{
				
				console.log("resetRoom");
				
				that.roomList = [] // 清空现有房间
				that.room = -1 // 恢复默认值
				
				getAllRoomsApi(that.currentBaseURL,{
					"type": "area",
					"id": area_id,
				}).then(res=>{
					const li = res.data.data?.areas?.rooms ?? null
					
					if(!li) return // 如果区域无会议室，直接返回，不报错
					
					that.roomList = _.forEach(li,item=>{
						item.value = item.room_id
						item.text = item.room_name
					})
					resolve()
				})
				.catch(()=>{
					reject()
				})
			})
		},
		initRoom(arr){
			
			const roomText = arr[0]
			const area_id = arr[1]
			
			console.log(roomText,area_id);
			
			const that = this
			return new Promise((resolve,reject)=>{
				that.resetRoom(area_id)
					.then(()=>{
						const room_id = that.room = _.find(that.roomList, ['text', roomText]).value
						resolve(room_id)
					})
					.catch(()=>{
						reject()
					})
			})
		},
		resetArea(arr){
			const roomText = arr[0]
			const areaText = arr[1]
			console.log("接收参数："+roomText+" "+areaText);
			
			const that = this
			return new Promise((resolve,reject)=>{
				getAllAreaApi(that.currentBaseURL,{
				}).then(({data})=>{
					
					const {data:li} = data
					
					console.log(li);
					
					if(!li) reject()
					
					that.areaList = _.forEach(li,item=>{
						item.value = item.id
						item.text = item.area_name
					})
					
					console.log(that.areaList);
					
					console.log(areaText);
					
					const area_id = that.area = _.find(that.areaList, ['text', areaText]).value
					
					console.log(area_id);
					
					resolve([roomText,area_id])
					
				}).catch(()=>{
					reject()
				})
			})
		},
		resetSetting(){
			return new Promise((resolve,reject)=>{
				getSettingApi(this.currentBaseURL,{})
					.then(({data})=>{
						const {room:roomText, area:areaText} = data.data // 字符串
						this.basicInfo.room = roomText
						this.basicInfo.area = areaText 
						
						console.log(roomText,areaText);
						resolve([roomText,areaText])
					}).catch(()=>{
						reject()
					})
			})
		},
		init(){
			
			this.resetSetting()
			.then(this.resetArea)
			.then(this.initRoom)
			.catch((e)=>{
				console.log(e);
				uni.showToast({
					title: this.$t('message.netDataError'),
					icon: 'none',
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
			this.resetRoom(this.area)
			.catch(e=>{
				console.log(e)
				uni.showToast({
					title: this.$t('message.netDataError'),
					icon: 'none',
				})
			})
		},
		verify(){
			// 判空
			if(!this.requestURL || this.requestURL==''){
				uni.showToast({
					title: this.$t('message.setting.right.url_empty'),
					icon: 'none',
				})
				return
			}
			
			const that = this
			
			// 尝试调这个接口，返回成功就是联通了
			this.verifyStatus = 'verifying'
			getAllAreaApi(this.requestURL,{
			}).then(({data})=>{
				
				const {
					code,
					data:li
				} = data
				
				if(code == 0){
					this.verifyStatus = 'verified'
					
					// 改store
					this.changeBaseURL(this.requestURL)
					
					uni.showToast({
						title: this.$t('message.setting.right.verify_success'),
						icon: 'none',
					})
				}
				else{
					this.verifyStatus = 'none'
					uni.showToast({
						title: this.$t('message.setting.right.verify_fail'),
						icon: 'none',
					})
				}
				
				
			}).catch(e=>{
				console.log(e)
				this.verifyStatus = 'none'
				uni.showToast({
					title: this.$t('message.setting.right.verify_fail'),
					icon: 'none',
				})
			})
			
		},
		submit: async function(){
			
			const that = this
			
			// 判空
			if(!this.requestURL || this.requestURL==''){
				uni.showToast({
					title: this.$t('message.setting.right.url_empty'),
					icon: 'none',
				})
				return
			}
			
			// 验证
			if(this.verifyStatus != 'verified'){
				uni.showToast({
					title: this.$t('message.activate.not_verified'),
					icon: 'none',
				})
				return
			}
			
			// 区域
			if(!this.area || this.area==-1){
				uni.showToast({
					title: this.$t('message.setting.right.area_empty'),
					icon: 'none',
				})
				return
			}
			
			//房间
			if(!this.room || this.room==-1){
				uni.showToast({
					title: this.$t('message.setting.right.room_empty'),
					icon: 'none',
				})
				return
			}
			
			
			// 换绑
			await changeBindApi(that.currentBaseURL,{
				"room_id": that.room,
			}).then((res)=>{
				console.log(res);
			}).catch(e=>{
				uni.showToast({
					title: this.$t('message.netDataError'),
					icon: 'none',
				})
			})
			
			
			// 修改请求地址重启弹窗（可选）
			if(that.oldRequestURL!==that.requestURL){
				that.$refs.popup.open()
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
		padding: 30rpx 25rpx 10rpx;
		width: 350rpx;
		height: 100%;
		background-color: #333333;
		font-size: 12rpx;
		
		.title{
			flex-shrink: 0;
			font-size: 18rpx;
			font-weight: 500;
		}
		
		.info-list{
			height: 100%;
			.info-row{
				min-height: 25rpx;
				line-height: 25rpx;
				word-break:break-all;
				margin-bottom: 15rpx;
				
				.info-title{
					font-size: 14rpx;
					font-weight: 500;
					color: #fff;
				}
				
				.info-desc{
					font-size: 10rpx;
					color: #ddd;
					line-height: 1.6;
				}
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
				
				padding: 0 5rpx 0 10rpx;
				
				display: flex;
				flex-direction: row;
				gap: 5rpx;
				
				.my-input{
					height: 25rpx;
					line-height: 25rpx;
					width: 100%;
					color: #333;
					background-color: #fff;
					border-radius: 3rpx;
					padding: 0 6rpx;
				}
				
				.btn{
					min-width: 60rpx;
					height: 25rpx;
					line-height: 25rpx;
					background-color: var(--color-primary);
					color: #fff;
					flex-shrink: 0;
					
					&-dark{
						background-color: var(--dark-color-primary);
					}
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