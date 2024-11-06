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
					<input inputmode="url" class="my-input" :placeholder="$t('message.activate.placeholder')" v-model="url" @input="verifyStatus='none'"/>
					<uni-icons @click="scan" class="scan" color="#333" type="scan" size="25"></uni-icons>
				</div>

				<button :loading="verifyStatus=='verifying'" :class="'btn btn'+(currentTheme!='dark'?'':'-dark')" type="default" @click="verify">
				
				<uni-icons color="#fff" v-if="verifyStatus=='verified'" type="checkmarkempty" size="30"></uni-icons>
				<text v-if="verifyStatus=='verifying'">{{$t('message.activate.verifying')}}</text>
				<text v-if="verifyStatus=='none'">{{$t('message.activate.verify')}}</text>
				
				</button>
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
import {mapGetters,mapMutations} from 'vuex';
import { getAllAreaApi,getAllRoomsApi,activateDeviceApi,changeBindApi } from '@/api/api';
import { PageMixin } from '@/mixin';
import _ from 'lodash'

export default {
	name:"ActivateView",
	components:{
		LanguageSelect
	},
	mixins: [PageMixin],
	emits:['close','activateSuccess'],
	data() {
		return {
			url: '',
			verifyStatus: 'none', // 'verifying','verified'
			area: -1,
			areaList:[],
			room: -1,
			roomList:[],
			windowInfo: {}
		};
	},
	created(){ // 获取区域信息 onLoad不生效，那是页面函数，切页面才管用
	
		console.log(79);
	
		// this.getAllArea()
		
		this.windowInfo = uni.getWindowInfo();
		// console.log(this.windowInfo);
		
	},
	mounted() {
		document.addEventListener("getScanResult", (e) => {
			//webview接收uniapp传过来的信息
			console.log('getScanResult', e.detail.value)
			
			this.url = e.detail.value
			
		}, false)
	},
	methods:{
		getAllArea(){
			const that = this;
			
			getAllAreaApi(this.currentBaseURL,{
			}).then(res=>{
				
				const li = res.data.data
				
				_.forEach(li,item=>{
					item = {
						value:item.id,
						text: item.area_name,
						...item
					}
				})
				
				that.areaList = li
				
				console.log(li);
				
			}).catch(e=>{console.log(e)})
		},
		changeArea(e){ 
			this.roomList = [] // 清空现有房间
			this.room = -1
			
			
			getAllRoomsApi(this.currentBaseURL,{
				"type": "area",
				"id": this.area,
			}).then(res=>{
				
				const li = res.data.data?.areas?.rooms ?? null
				
				if(!li){
					return // 如果区域无会议室，直接返回，不报错
				}
				
				// 房间信息赋值
				this.roomList = _.forEach(li,item=>{
						item.value = item.room_id,
						item.text = item.room_name
				})
				
			})
				
		},
		scan(){
			
			//h5向app传参，触发事件
			console.log('postMessage');
			uni.webView.postMessage({
				data: {
					type: 'scan'
				}
			}, '*');
			
			               

		},
		verify(){
			// 判空
			if(!this.url){
				uni.showToast({
					title: this.$t('message.activate.url_empty'),
					icon: 'none',
				})
				return
			}
			
			const that = this
			
			// 尝试调这个接口，返回成功就是联通了
			this.verifyStatus = 'verifying'
			getAllAreaApi(this.url,{
			}).then(({data})=>{
				
				const {
					code,
					data:li
				} = data
				
				if(code == 0 || code == -49){
					this.verifyStatus = 'verified'
					
					// 改store
					this.changeBaseURL(this.url)
					
					// 区域信息赋值
					that.areaList = _.forEach(li,item=>{
						item.value = item.id, // 不能整体赋值，会无效
						item.text = item.area_name
					})
					
					uni.showToast({
						title: this.$t('message.activate.verify_success'),
						icon: 'none',
					})
				}
				else{
					this.verifyStatus = 'none'
					uni.showToast({
						title: this.$t('message.activate.verify_fail'),
						icon: 'none',
					})
				}
				
				
			}).catch(e=>{
				console.log(e)
				this.verifyStatus = 'none'
				uni.showToast({
					title: this.$t('message.activate.verify_fail'),
					icon: 'none',
				})
			})
			
		},
		finish(){
			
			if(!this.url){
				uni.showToast({
					title: this.$t('message.activate.url_empty'),
					icon: 'none',
				})
				return
			}
			if(this.verifyStatus != 'verified'){
				uni.showToast({
					title: this.$t('message.activate.not_verified'),
					icon: 'none',
				})
				return
			}
			if(!this.area || this.area==-1){
				uni.showToast({
					title: this.$t('message.activate.area_empty'),
					icon: 'none',
				})
				return
			}
			if(!this.room || this.room==-1){
				uni.showToast({
					title: this.$t('message.activate.room_empty'),
					icon: 'none',
				})
				return
			}
			
			const pack = {              //实际设备id
				"version": "1.0.0",                     //设备使用的软件版本？激活时是否直接使用全局的软件版本，还是由前端传入
				"description": "",                      //设备信息
				"resolution": `${this.windowInfo.screenWidth}*${this.windowInfo.screenHeight}`,              //分辨率
				"status": 1,                            //是否在线
				"is_set": 0,                            //是否绑定
				"set_time": Math.trunc(new Date().getTime() / 1000),               //绑定时间（时间戳）
				"room_id": this.room                       //绑定的房间号，数据库中的房间号
			}
			
			console.log(JSON.stringify(pack));
			
			
			const that = this
			activateDeviceApi(this.currentBaseURL,pack)
			.then(({data})=>{
				console.log(JSON.stringify(data));
				
				const code = data.code
				
				if(code==-49){ // 已激活，就换绑
					changeBindApi(that.currentBaseURL,{
						"room_id": that.room,                 //房间id
					}).then(()=>{
						
						this.url = ''
						this.area = -1
						this.room = -1
						
						uni.showToast({
							title: this.$t('message.activate.activate_success'),
							icon: 'none',
						})
						
						this.$emit('activateSuccess')
						this.$emit('close')
						
					}).catch(e=>{
						uni.showToast({
							title: this.$t('message.netDataError'),
							icon: 'none',
						})
					})
				}else{
					// this.changeBaseURL(this.url)
					this.url = ''
					this.area = -1
					this.room = -1
					
					uni.showToast({
						title: this.$t('message.activate.activate_success'),
						icon: 'none',
					})
					
					this.$emit('activateSuccess')
					this.$emit('close')
				}
				
				
				
				
				
			}).catch(e=>{
				console.log(e);
				uni.showToast({
					title: this.$t('message.activate.activate_fail'),
					icon: 'none',
				})
				this.$emit('close')
			})
			
			
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