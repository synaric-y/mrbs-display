<template>

	<div class="container" id="app">
		<ActivateView v-if="activateViewShow" @close="activateViewShow=false" @activateSuccess="startSync" />
		<LoginView v-if="loginViewShow" @close="loginViewShow=false"
			@success="()=>{loginViewShow=false;settingViewShow=true}" />
		<SettingView v-if="settingViewShow" @close="settingViewShow=false" />

		<div class="left-time-view">
			<!-- 会议时间 -->
			<view class="meeting-time">
				<view class="meeting-scroll">
					<scroll-view scroll-y="true" class="meeting-scroll-view">
						<div class="meeting-wrapper">
							<div class="left">
								<div class="hm" v-for="(item,index) in hourList" :key="index">
									{{ item.text }}
								</div>
							</div>
							<div class="right">
								<div class="meeting-item" :id="'meeting-'+item.id" v-for="(item,index) in meetingList" :key="item.id" :style="{top: calculateY(item.start_time)+'rpx', height: calculateHeight(item.start_time,item.end_time)+'rpx' }">
									<div :class="'meeting '+meetingClass(item.start_time,item.end_time)">
										<text class="meeting-theme">
											{{ item.description || $t('message.index.left.default_name') }}
										</text>
										<text class="meeting-span">
											{{ tsHourMinuteFormat(item.start_time) +' - '+ tsHourMinuteFormat(item.end_time)}}
										</text>
									</div>
									<image v-if="item.id==roomData?.now_entry?.id" class="in-meeting-icon"
										src="@/static/in-meeting.png" mode="aspectFit">
									</image>
								</div>
							</div>
						</div>
					</scroll-view>
				</view>
			</view>
			<!-- 预约会议 -->
			<view class="reserve-meeting">
				<!-- <view class="reserve-title">{{$t('message.quickMeeting')}}</view> -->
				<div class="reserve-title"></div>
				<view
					:class="[hasTimeInCurrentAvaliable?'reserve-button reserve-button-free':'reserve-button']"
					@click="prepareQuickMeet(hasTimeInCurrentAvaliable)">
					{{$t('message.index.left.book')}}
				</view>
				<!-- 预约会议对话框 -->
				<FastMeetingDialog v-if="showQuickMeeting" @close="showQuickMeeting=false"
					:currentTime="roomData?.now_timestamp ?? Math.trunc(new Date().getTime()/1000)"
					:areaLb="lb"
					:areaUb="ub"
					:meetings="roomData?.entries ?? []"
					:avaliableHours="avaliableHours" />
			</view>
		</div>
		<div
			:class="(roomData?.now_entry)?('right-meeting-info right-meeting-info-busy right-meeting-info-busy'+(currentTheme === 'dark' ? '-dark' : '' )):('right-meeting-info right-meeting-info'+(currentTheme === 'dark' ? '-dark' : '' ))">

			<div class="battery">
				<BatteryShow/>
			</div>
			<div class="header">
				<div class="header-left">
					<div class="room-title">{{$t('message.index.right.meeting')}}</div>
					<div class="room-number">
						{{roomData?.room?.room_name ?? 'A'}}</div>
				</div>
				<div class="header-right">
					<view class="change-language">
						<LanguageSelect @update="changeLang" />
					</view>
					<uni-icons type="gear" @click="prepareSetting" color="#ffffff" size="35"></uni-icons>
				</div>
			</div>
			<view class="current-time">{{nowlanguageTime}}</view>

			<!-- 会议详情 -->
			<view class="right-meeting-detail">
				<!-- 空闲中 -->
				<view class="meeting-status">
					{{(roomData?.now_entry)?$t('message.index.right.in_meeting'):$t('message.index.right.no_meeting')}}
				</view>

				<!-- 现在有会 -->
				<template v-if="roomData?.now_entry">
					<text class="meeting-title">{{roomData?.now_entry?.description || $t('message.index.right.default_name')}}</text>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-time.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{(roomData?.now_entry)?(tsHourMinuteFormat(roomData.now_entry.start_time) +' - '+ tsHourMinuteFormat(roomData.now_entry.end_time)):'-'}}</text>
					</view>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-person.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{roomData?.now_entry?.create_by || $t('message.index.right.default_booker')}}</text>
					</view>
				</template>
				<!-- 现在无会 -->
				<template v-else>
					<view class="nextMeet">
						{{$t('message.index.right.next_meeting')}}:
					</view>
					<text class="meeting-title">{{(nextMeetData?.name) ?? '-'}}</text>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-time.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{(nextMeetData)?(tsHourMinuteFormat(nextMeetData.start_time) +' - '+ tsHourMinuteFormat(nextMeetData.end_time)):'-'}}</text>
					</view>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-person.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{(nextMeetData?.book_by) ?? '-'}}</text>
					</view>
				</template>

			</view>
			<view class="right-meeting-logo">
				<image class="company-logo" src="@/static/bcc-logo-en.png" mode="aspectFit"></image>
			</view>
		</div>
	</div>
</template>


<script>
	import moment from 'moment-timezone';
	import {
		dateDisplayLocale,
		dateDisplayLocaleOnly,
		formatDate,
		formatTime,
		getTimestamp,
		displayHM
	} from '../../utils/indexTimeTool.js'
	import {
		hourDisplay,
		nextScaleTs,
		hourToTimestamp,
		SEC_PER_MINUTE,
		SEC_PER_HOUR
	} from '@/utils/timestampTool.js'
	import LanguageSelect from '../../components/LanguageSelect.vue';
	import {
		timeZoneMapping,
		languageSetMapping
	} from '../../src/i18nMapping.js';
	import FastMeetingDialog from '@/components/FastMeetingDialog.vue'
	import LoginView from '@/views/LoginView.vue';
	import SettingView from '@/views/SettingView.vue';
	import ActivateView from '@/views/ActivateView.vue';
	import BatteryShow from '../../components/BatteryShow.vue';
	import {
		quickMeetApi,
		quickMeetMessageMapping,
		syncRoomApi,
		getSettingApi
	} from '../../api/api.js'
	import {
		Decimal
	} from 'decimal.js';
	import {
		isBetween,
		clamp
	} from "@/utils/mathUtil";
	import {PageMixin} from '@/mixin/index.js'

	const heightPerBlock = 30 // 每15分钟rpx
	

	export default {
		name: 'App',
		interval: null,
		mixins:[PageMixin],
		components: {
			FastMeetingDialog,
			SettingView,
			LanguageSelect,
			BatteryShow,
			LoginView,
			ActivateView
		},
		mounted() {
			// webview接收uniapp传过来的信息
			
			// 设备信息初始化
			document.addEventListener("getDeviceInfo", (e) => {
				console.log(e);
				console.log('deviceInfo', e.detail.value)
				this.changeDeviceInfo(JSON.parse(e.detail.value))
			}, false)
			
			// 电量信息初始化
			document.addEventListener("getBatteryInfo", (e) => {
				console.log('batteryInfo', e.detail.value)
				this.changeBatteryInfo(JSON.parse(e.detail.value))
			}, false)
		},
		computed: {
			calculateY() {
				return (startTs) => {
					const len = this.hourList.length
					const dayBegTs = this.hourList[0].ts
					const dayEndTs = this.hourList[len - 1].ts

					return Number(new Decimal(startTs).minus(this.hourList[0].ts).dividedBy(dayEndTs - dayBegTs).times(
						len - 1).times(heightPerBlock))
				}
			},
			calculateHeight() {
				return (startTs, endTs) => {
					const len = this.hourList.length
					const dayBegTs = this.hourList[0].ts
					const dayEndTs = this.hourList[len - 1].ts

					const res = Number(new Decimal(endTs).minus(startTs).dividedBy(dayEndTs - dayBegTs).times(len - 1)
						.times(heightPerBlock))
					// console.log(res);
					return res
				}
			},
			meetingClass() { // 根据会议起止时间获取类名
				return (startTs, endTs) => {
					const min15 = SEC_PER_MINUTE * 15
					const min60 = SEC_PER_MINUTE * 60
					const min90 = SEC_PER_MINUTE * 90

					const diff = endTs - startTs

					let res = ''

					if (diff <= min15) res = 'min15'
					else if (diff <= min60) res = 'min60'
					else res = 'min90'

					// console.log(res);

					return res
				}
			},
			tsHourMinuteFormat() {
				return (ts) => {
					return displayHM(ts, 'zh-cn', this.currentTimeFormat=='12'?true:false);
				}
			},
			hasTimeInCurrentAvaliable(){
				
				// 下一个15分钟在不在区域可用时间内 
				// console.log(this.roomData?.now_timestamp);
				// console.log(nextScaleTs(this.roomData.now_timestamp,15*SEC_PER_MINUTE),this.lb,this.ub);
				// console.log(isBetween(nextScaleTs(this.roomData.now_timestamp,15*SEC_PER_MINUTE),this.lb,this.ub));
				// console.log(this.roomData?.now_timestamp);
				return (this.roomData?.now_timestamp && isBetween(nextScaleTs(this.roomData.now_timestamp,15*SEC_PER_MINUTE),this.lb,this.ub))
				
				// function leftAvailable(tempLb,li,lb){
				// 	if(tempLb < lb) return false
				// 	for(let entry of li){
				// 		if(tempLb>=entry.start_time && tempLb<entry.end_time) return false
				// 	}
				// 	return true
				// }
				
				// function rightAvailable(tempUb,li,ub){
				// 	if(tempUb > ub) return false
				// 	for(let entry of li){
				// 		if(tempUb>entry.start_time && tempUb<=entry.end_time) return false
				// 	}
				// 	return true
				// }
				
				// function isBothValid(tempLb, tempUb, li){
				// 	for(let entry of li){
				// 		if(tempLb<=entry.start_time && tempUb>=entry.end_time) return false
				// 	}
				
				// 	return true
				// }
				
				
				// let startTs = nextScaleTs(this.roomData.now_timestamp,15*SEC_PER_MINUTE) // 5:45
				// // 1729200600
				// // let startTs = nextScaleTs(1729200600,15*SEC_PER_MINUTE) // 5:45
				// let endTs = startTs + this.avaliableHours * SEC_PER_HOUR // 6:45
				
				// // console.log(startTs,endTs);
				
				// if(endTs <= this.lb || startTs >= this.ub) return false // 已经不在预定时间内 
				
				// const realStart = Math.max(startTs,this.lb) // 6:00
				// const realEnd = Math.min(endTs,this.ub) // 6:45
				
				// // console.log(realStart,realEnd);
				
				// startTs = realStart
				// endTs = realStart + 15*SEC_PER_MINUTE
				
				// // 滑动窗口……
				// for(;endTs<=realEnd;startTs+=15*SEC_PER_MINUTE,endTs+=15*SEC_PER_MINUTE){
					
				// 	// console.log(startTs,endTs);
					
				// 	if(leftAvailable(startTs,this.meetingList,realStart) && rightAvailable(endTs,this.meetingList,realEnd) && isBothValid(startTs,endTs,this.meetingList) && (startTs < endTs)){
				// 		return true
				// 	}
				// }
				
				// return false
			},
			nowlanguageTime(){
				return this.roomData?.now_timestamp && dateDisplayLocaleOnly(this.roomData.now_timestamp, this.$i18n.locale, this.currentTimeFormat=='12'?true:false)
			}
		},
		data() {
			return {
				activateViewShow: false, // 激活页面弹窗
				loginViewShow: false, // 登录页面弹窗
				settingViewShow: false, // 设置页面弹窗
				showQuickMeeting: false, // 快速会议弹窗


				avaliableHours : 1, // 可预约一小时内的时间
				lb: 8, // 会议室开始时间
				ub: 21, // 会议室结束时间
				hourList: [], // 左侧会议列表时间轴
				meetingList: [], // 所有会议
				

				meeting: false,
				roomData: null,
				nextMeetData: null,
				timezore: 'Asia/Shanghai',
				languageSet: 'zh-CN,zh;q=0.9',
			}
		},
		onLoad() {
			
			// 获取是否激活（尝试调一下syncRoom接口），需要等电量和设备信息传过来才行，等待5秒
			uni.showLoading({
				title: this.$t('message.initializing')
			})
			setTimeout(()=>{
				syncRoomApi(this.currentBaseURL,{
				}, {
					'Content-type': 'application/json',
					'Accept-Language': this.languageSet
				}, ).then(res => {
					console.log(JSON.stringify(res));
					let data = res.data.data;
					let code = res.data.code
					uni.hideLoading()
					
					// this.activateViewShow = true // 打开激活页面
				
					if (data == null) { // 数据异常
						this.changeStatus('offline') // 离线
						
						// this.activateViewShow = true // 打开激活页面
				
						if (code == -59 || code == -60) // 未激活
							this.activateViewShow = true // 打开激活页面
						else // 网络错误
							uni.showToast({
								title: this.$t('message.netDataError'),
								icon: 'none'
							})
					} else { // 已激活，数据正常
						// 开始同步
						this.startSync();
						console.log("startSync");
						// this.syncRoom()
					}
				}).catch(e => {
					uni.hideLoading()
					console.error(JSON.stringify(e))
					// this.activateViewShow = true // 打开激活页面
					uni.showToast({
						title: this.$t('message.netDataError'),
						icon: 'none'
					})
				})
			},5000)

		},
		methods: {
			// 获取会议时间
			nowMeetTime() {
				let start_time;
				let end_time;
				if (this.roomData?.now_entry) {
					start_time = this.roomData.now_entry.start_time;
					end_time = this.roomData.now_entry.end_time;
				} else if (this.nextMeetData?.start_time) {
					start_time = this.nextMeetData.start_time;
					end_time = this.nextMeetData.end_time;
				} else {
					return '';
				}
				let dateFormat = 'hh:mm A';
				const startTime = formatDate(start_time, 'Asia/Shanghai', 'zh-cn', dateFormat);
				const endTime = formatDate(end_time, 'Asia/Shanghai', 'zh-cn', dateFormat);
				let stampStr = startTime + '-' + endTime;
				console.log('nowMeetTime startTime endTime', startTime, endTime);
				return stampStr;
			},

			startSync() {
				
				console.log(435);
				
				// 同步room（5s）
				this.interval && clearInterval(this.interval)

				this.syncRoom()
				this.interval = setInterval(() => {
					this.syncRoom()
				}, 5000)


			},


			foundNextMeet() {
				this.nextMeetData = null;
				let foundNextMeet = false;
				let entryList = this.roomData.entries;
				let nowTime = this.roomData.now_timestamp || (new Date().getTime() / 1000);
				for (let entry of entryList) {
					if (nowTime < entry['start_time']) {
						foundNextMeet = entry;
						break;
					}
				}
				if (foundNextMeet) {
					this.nextMeetData = foundNextMeet;
				}
			},

			initTimeline(data) {
				// console.log(this.currentTimeFormat);

				const res = hourDisplay(this.lb,this.ub, this.currentTimeFormat=='12'?true:false);
				// console.log(res);

				this.hourList = res
			},

			changeLang(index) {
				const locale = this.$i18n.locale
				this.timezore = timeZoneMapping[locale]
				this.languageSet = languageSetMapping[locale]

				this.syncRoom()
			},

			syncRoom() {
				syncRoomApi(this.currentBaseURL,{
				}, {
					'Content-type': 'application/json',
					'Accept-Language': this.languageSet
				}, ).then(res => {
					// console.log(res);
					let data = res.data.data;
					if (data == null) {
						this.changeStatus('offline') // 离线
						uni.showToast({
							title: this.$t('message.netDataError'),
							icon: 'none'
						})
						return;
					}

					// console.log('syncRoom返回数据成功data:', data);
					this.changeStatus('online') // 在线
					this.roomData = data;
					this.lb = hourToTimestamp(this.roomData?.area?.morningstarts ?? 8)
				    this.ub = hourToTimestamp(this.roomData?.area?.eveningends ?? 21)
					
					// console.log(this.lb,this.ub);
					
					this.initTimeline();


					// 寻找当前会议并作标记
					let entries = res.data.data.entries
					
					const idx = entries.indexOf(item=>{return item.id == this.roomData.now_entry.id;})
					if(idx != -1) entries[idx].isCurrentMeeting = true
					
					this.meetingList = entries
					// console.log(this.meetingList);
					

					// 寻找下一个会议
					this.foundNextMeet();
					
					// 会议列表渲染完成后，滚动到当前会议/下一个会议
					// this.$nextTick(()=>{
						
					// 	const targetId = (this.roomData?.now_entry?.id ?? this.nextMeetData?.id ?? 0)
						
					// 	console.log(targetId);
						
					// 	if(targetId == 0) return
						
					// 	const query = uni.createSelectorQuery();
					// 	query.select('#meeting-'+targetId).boundingClientRect(data => {
					// 		console.log(data)
					// 		this.scrollTop = Math.max(data.top - 60*1.75, 0); // 让上面空出半小时
					// 	}).exec();
						
					// });
					
					
					
					// this.meetTimeString = this.nowMeetTime();
				}).catch(e => {
					console.error(e)
				})
			},
			prepareSetting() { // 预先请求一下，成功则跳过登录
				const that = this
				getSettingApi(this.currentBaseURL,{
				}).then(res => {
					// that.loginViewShow = true
					if (res.data.data == null) { // 未登录，则打开登录页面
						that.loginViewShow = true
					} else { // 已登录，直接进
						that.settingViewShow = true
					}

				}).catch(e => {
					console.log(e);
				})
			},
			prepareQuickMeet(opt) {
				if(opt){
					this.showQuickMeeting = true;
				}else{
					uni.showToast({
						title: this.$t('message.index.left.no_free'),
						icon: 'none'
					})
				}
			},
		},

		onUnload() {
			// 清除定时器
			if (this.interval) {
				clearInterval(this.interval)
				this.interval = null
			}
		}
	}
</script>

<style lang="scss" scoped>
	/*去除scroll-view默认的滚动条，但是还能滚动*/
	::v-deep .uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
	  display: none;
	}
	
	* {
		margin: 0;
		padding: 0;
	}

	.test {
		// background-color: #fff;
		// height: 100rpx;
	}

	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: row;
		background-color: #ccc;
		overflow: hidden;

		.left-time-view {
			display: flex;
			margin: 0;
			padding: 0;
			width: 250rpx;
			background-color: #333333;

			.meeting-time {
				display: flex;
				flex-direction: column;
				justify-content: center;
				width: 250rpx;
				height: 100%;
				position: relative;

				.meeting-scroll {
					width: 250rpx;
					height: 470rpx;
				}

				.meeting-scroll-view {
					width: 250rpx;
					height: 377rpx;


					.meeting-wrapper {
						display: flex;
						flex-direction: row;
						color: #fff;
						padding: 20rpx 8rpx;
						gap: 8rpx;
						height: 100%;

						.left {
							// width: 50rpx;
							flex-shrink: 0;

							.hm {
								height: 30rpx;
								width: 100%;
								text-align: right;
								font-size: 9rpx;
								line-height: 0rpx;
							}
						}

						.right {
							position: relative;
							height: 100%;
							width: 100%;
							
							.meeting-item{
								position: absolute;
								top: 0;
								left: 0;
								height: 60rpx;
								width: 100%;
								padding: 4rpx 8rpx;
								background-color: rgba(255, 255, 255, 0.12);
								font-size: 9rpx;
								border: 1rpx solid #333;
								/*产生空隙，防止会议黏在一起*/
								
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 5rpx;
								
								.in-meeting-icon {
									flex-shrink: 0;
									width: 15rpx;
									height: 15rpx;
									animation: blink 2s infinite steps(2);
								}
								@keyframes blink {
								    0% {
								        opacity: 0;
								    }
								    100% {
								        opacity: 1;
								    }
								}
								
								.meeting {
									display: flex;
									flex-direction: column;
									justify-content: space-between;
									height: 100%;
									width: 100%;
									
									.meeting-theme,.meeting-span {
										line-height: 1.5;
									}
								}
								
								.min15 {
								
									/*会议时长不足30分钟时，由于没有显示空间，不显示起止时间*/
									.meeting-theme {
										word-break: break-all;
										display: -webkit-box;
										overflow: hidden;
										-webkit-line-clamp: 1;
										-webkit-box-orient: vertical;
										text-overflow: ellipsis;
									}
								
									.meeting-span {
										display: none;
									}
								}
								
								.min60 {
								
									/*不足1小时时，会议名最多一行，会议名下方显示一行起止时间*/
									.meeting-theme {
										word-break: break-all;
										display: -webkit-box;
										overflow: hidden;
										-webkit-line-clamp: 1;
										-webkit-box-orient: vertical;
										text-overflow: ellipsis;
									}
								
									.meeting-span {}
								}
								
								.min90 {
								
									/*1.5小时以上时，会议名可显示两行，最多显示两行，下方显示会议起止时间。*/
									.meeting-theme {
										word-break: break-all;
										display: -webkit-box;
										overflow: hidden;
										-webkit-line-clamp: 2;
										-webkit-box-orient: vertical;
										text-overflow: ellipsis;
									}
								
									.meeting-span {}
								}
							}

							
						}
					}
				}


			}



			.reserve-meeting {
				height: 63rpx;
				width: 250rpx;
				border-top: 1rpx solid rgba(230, 241, 252, 0.25);
				position: absolute;
				left: 0;
				bottom: 0;
				display: flex;
				justify-content: center;
				align-items: center;

				.reserve-button {
					width: 187rpx;
					height: 32rpx;
					line-height: 32rpx;
					border-radius: 4rpx;
					background-color: rgba(230, 241, 252, 0.25);
					color: white;
					font-size: 14rpx;
					text-align: center;
					box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.4);
				}

				.reserve-button-free {
					background-color: rgba(129, 179, 55, 1);
				}

			}

		}


		.right-meeting-info {
			position: relative;
			display: flex;
			flex-direction: column;
			flex: 1;
			height: 100vh;
			background-color: var(--color-primary);

			&-dark {
				background-color: var(--dark-color-primary);
			}

			padding: 10rpx 20rpx 0 37rpx;
			box-sizing: border-box;
			text-align: left;
			color: #fff;

			.battery {
				// position: absolute;
				// top: 0;
				// right: 0;
				display: flex;
				justify-content: flex-end;
				width: 100%;
				padding-right: 10rpx;
			}

			.header {
				width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				gap: 20rpx;
				padding-bottom: 5rpx;
				border-bottom: 1rpx solid rgba(255, 255, 255, .5);
				align-items: center;

				.header-left {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 8rpx;

					.room-title {
						font-size: 22rpx;
						line-height: 38rpx;
					}

					.room-number {
						font-size: 38rpx;
						line-height: 38rpx;
					}
				}

				.header-right {

					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 10rpx;

					.change-language {
						width: 66rpx;
						height: 22rpx;
						border-radius: 4rpx;
						background-color: rgba(230, 241, 252, 0.25);
						font-size: 12rpx;
						color: white;
						line-height: 22rpx;
						text-align: center;
					}
				}
			}

			.current-time {
				margin-top: 5rpx;
				font-size: 18rpx;
				text-align: left;
				width: 100%;
				height: 40rpx;
			}



		}

		.right-meeting-info-busy {
			background-color: var(--color-danger);

			&-dark {
				background-color: var(--dark-color-danger);
			}
		}





		.right-meeting-detail {
			flex: 1;
			flex-direction: column;
			width: 100%;

			.meeting-status {
				font-size: 80rpx;
				line-height: 1.6;
			}

			.nextMeet {
				line-height: 1.5;
				font-size: 14rpx;
			}

			.meeting-title {
				line-height: 2;
				font-size: 22rpx;
				width: 100%;
				font-weight: 500;
				text-align: left;
				margin-bottom: 5rpx;
				
				word-break: break-all;
				display: -webkit-box;
				overflow: hidden;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
				text-overflow: ellipsis;
			}

			.meeting-detail-item {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 10rpx;
				margin-bottom: 10rpx;

				.meeting-detail-item-icon {
					width: 17rpx;
					height: 17rpx;
				}

				.meeting-detail-item-desc {
					line-height: 28rpx;
					font-size: 14rpx;
					text-align: left;
					word-break: break-all;
					display: -webkit-box;
					overflow: hidden;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
					text-overflow: ellipsis;
				}

			}
		}


		.right-meeting-logo {
			width: 100%;
			height: 50rpx;

			.company-logo {
				width: 150rpx;
				height: 17rpx;
			}
		}



		.popup-setting-room-number {
			width: 250rpx;
			height: 150rpx;
			background-color: white;
			display: flex;
			flex-direction: column;
			align-items: center;
			z-index: 9;
			position: fixed;
			left: 250rpx;
			top: 150rpx;

			.popup-input {
				width: 200rpx;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 30rpx;
				border: 1rpx solid royalblue;
				margin-top: 20rpx;
			}

			.popup-sure {
				width: 80rpx;
				height: 40rpx;
				background-color: royalblue;
				line-height: 40rpx;
				margin-top: 10rpx;
				text-align: center;
				font-size: 22rpx;
				color: white;
				border-radius: 6rpx;
			}
		}

	}
</style>