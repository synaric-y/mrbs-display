<template>

	<div class="container" id="app">
		<ActivateView v-if="activateViewShow" :batteryInfo="batteryInfo" :deviceInfo="deviceInfo"
			@close="activateViewShow=false" />
		<LoginView v-if="loginViewShow" @close="loginViewShow=false"
			@success="()=>{loginViewShow=false;settingViewShow=true}" />
		<SettingView v-if="settingViewShow" :batteryInfo="batteryInfo" :deviceInfo="deviceInfo"
			@close="settingViewShow=false" />

		<view class="popup-setting-room-number" v-if="showSettingRoomNumber">
			<input class="popup-input" v-model="_roomId" :placeholder="$t('message.alert_code')" />
			<view class="popup-sure" @click="onSetRoomId">{{$t('message.sure')}}</view>
		</view>

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
								<div class="meeting-item" v-for="(item,index) in meetingList" :key="item.id" :style="{top: calculateY(item.start_time)+'rpx', height: calculateHeight(item.start_time,item.end_time)+'rpx' }">
									<div :class="'meeting '+meetingClass(item.start_time,item.end_time)">
										<text class="meeting-theme">
											{{ item.name }}
										</text>
										<text class="meeting-span">
											{{ tsHourMinuteFormat(item.start_time) +' - '+ tsHourMinuteFormat(item.end_time)}}
										</text>
									</div>
									<image v-if="item.isCurrentMeeting" class="in-meeting-icon"
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
					:class="[(roomData && (roomData.now_entry != null))?'reserve-button':'reserve-button reserve-button-free']"
					@click="prepareQuickMeet">
					{{$t('message.book')}}
				</view>
				<!-- 预约会议对话框 -->
				<FastMeetingDialog v-if="showQuickMeeting" @close="showQuickMeeting=false" @confirm="quickMeet(1)"
					:currentTime="roomData?.now_timestamp ?? Math.trunc(new Date().getTime()/1000)"
					:meetings="roomData?.entries ?? []" :batteryInfo="batteryInfo" :deviceInfo="deviceInfo"
					:avaliableHours="1" />
			</view>
		</div>
		<div
			:class="(roomData?.now_entry)?'right-meeting-info right-meeting-info-busy':('right-meeting-info right-meeting-info'+(currentTheme === 'dark' ? '-dark' : '' ))">

			<div class="battery">
				<BatteryShow :battery="batteryInfo.level" />
			</div>
			<div class="header">
				<div class="header-left">
					<div class="room-title">{{$t('message.room')}}</div>
					<div class="room-number" @longpress="showSettingRoomNumber=true">
						{{roomData?.room?.room_name ?? 'A'}}</div>
				</div>
				<div class="header-right">
					<view class="change-language">
						<LanguageSelect @update="changeLang" />
					</view>
					<uni-icons type="gear" @click="prepareSetting" color="#ffffff" size="35"></uni-icons>
				</div>
			</div>
			<view class="current-time">{{this.nowlanguageTime}}</view>

			<!-- 会议详情 -->
			<view class="right-meeting-detail">
				<!-- 空闲中 -->
				<view class="meeting-status">
					{{(roomData?.now_entry)?$t('message.in_meeting'):$t('message.no_meeting')}}
				</view>

				<!-- 现在有会 -->
				<template v-if="roomData?.now_entry">
					<text class="meeting-title">{{roomData?.now_entry?.name ?? '-'}}</text>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-time.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{(roomData?.now_entry)?(tsHourMinuteFormat(roomData.now_entry.start_time) +' - '+ tsHourMinuteFormat(roomData.now_entry.end_time)):'-'}}</text>
					</view>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-person.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{roomData?.now_entry?.book_by ?? '-'}}</text>
					</view>
				</template>
				<!-- 现在无会 -->
				<template v-else>
					<view class="nextMeet">
						{{$t('message.nextMeet')}}:
					</view>
					<text class="meeting-title">{{(nextMeetData?.name) ?? '-'}}</text>
					<view class="meeting-detail-item">
						<image class="meeting-detail-item-icon" src="@/static/reverse-time.png" mode=""></image>
						<text class="meeting-detail-item-desc">{{(nextMeetData)? meetTimeString:'-'}}</text>
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
		formatDate,
		formatTime,
		getTimestamp,
	} from '../../utils/indexTimeTool.js'
	import {
		hourDisplay,
		SEC_PER_MINUTE
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
	// import {
	// 	quickMeetApi,
	// 	quickMeetMessageMapping,
	// 	syncRoomApi
	// } from '../../api/mockApi.js' // 模拟接口

	import {
		mapGetters,
		mapMutations
	} from 'vuex';

	const heightPerBlock = 30 // 每15分钟rpx

	export default {
		name: 'App',
		interval: null,
		batteryInterval: null,
		components: {
			FastMeetingDialog,
			SettingView,
			LanguageSelect,
			BatteryShow,
			LoginView,
			ActivateView
		},
		computed: {
			...mapGetters(['currentTheme']),
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
					console.log(res);
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

					console.log(res);

					return res
				}
			},
			tsHourMinuteFormat() {
				return (ts) => {
					return formatDate(ts, 'Asia/Shanghai', 'zh-cn', 'hh:mm A');
				}
			}
		},
		data() {
			return {
				activateViewShow: false, // 激活页面弹窗
				loginViewShow: false, // 登录页面弹窗
				settingViewShow: false, // 设置页面弹窗
				showSettingRoomNumber: false, // 内置码输入弹窗
				showQuickMeeting: false, // 快速会议弹窗

				hourList: [], // 左侧会议列表时间轴
				meetingList: [], // 所有会议

				meeting: false,
				timeRange: [],
				_roomId: 2,
				roomId: 2,
				meetStartTime: 8,
				meetStartMinute: 0,
				meetEndTime: 21,
				meetEndMinute: 30,
				meetArangeList: [],
				currenMeetStart: 0,
				currenMeetEnd: 0,
				value: 0,
				roomData: null,
				nextMeetData: null,
				roomFree: false,
				nowlanguageTime: '',
				timezore: 'Asia/Shanghai',
				languageSet: 'zh-CN,zh;q=0.9',
				meetTimeZore: '',
				meetTimeString: '',
				largeScreenHeight: 0,
				quickMeetingMsg: '接口未及时返回数据',
				itemHight: 29.5,
				batteryInfo: {},
				deviceInfo: {},
			}
		},
		onLoad() {
			// 缓存获取room_id
			let roomId = uni.getStorageSync("ROOM_ID")
			if (roomId) {
				this.roomId = Number(roomId)
				this._roomId = Number(roomId)
			}
			console.log("Room ID: ", roomId);

			// uniapp查询窗口高度
			this.largeScreenHeight = uni.getWindowInfo().windowHeight;
			console.log('getWindowInfo windowHeight:', this.largeScreenHeight)

			// 获取设备信息
			let localDeviceInfo = uni.getStorageSync("DEVICE_INFO")
			if (localDeviceInfo) {
				this.deviceInfo = localDeviceInfo
			} else {
				let deviceInfo = uni.getDeviceInfo();
				uni.setStorageSync("DEVICE_INFO", deviceInfo);
				this.deviceInfo = deviceInfo;
			}
			console.log('获取设备的信息deviceInfo:', this.deviceInfo);

			// 获取电量信息
			uni.getBatteryInfo({
				success: (res) => {
					console.log('获取电量信息res:', res);
					this.batteryInfo = res;

					// 获取是否激活（尝试调一下syncRoom接口）
					syncRoomApi({
						device_id: this.deviceInfo.deviceId,
						battery_level: this.batteryInfo.level,
						is_charging: this.batteryInfo.isCharging,
					}, {
						'Content-type': 'application/json',
						'Accept-Language': this.languageSet
					}, ).then(res => {
						console.log(res);
						let data = res.data.data;
						let code = res.data.code

						if (data == null) { // 数据异常
							this.changeStatus('offline') // 离线

							if (code == -59) // 未激活
								this.activateViewShow = true // 打开激活页面
							else // 网络错误
								uni.showToast({
									title: this.$t('message.netDataError'),
									icon: 'none'
								})
						} else { // 已激活，数据正常
							// 开始同步
							// this.startSync();
							this.syncRoom()
						}
					}).catch(e => {
						console.error(e)
						uni.showToast({
							title: this.$t('message.netDataError'),
							icon: 'none'
						})
					})
				}
			})

		},
		methods: {
			...mapMutations(['changeStatus']), //对象展开运算符直接拿到change
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
				// 同步room（5s）
				this.interval && clearInterval(this.interval)

				this.syncRoom()
				this.interval = setInterval(() => {
					this.syncRoom()
				}, 5000)


				// 同步电量（5分钟，300s）
				this.batteryInterval && clearInterval(this.batteryInterval)

				// #ifdef APP-PLUS
				uni.getBatteryInfo({
					success: (res) => {
						console.log('获取电量信息res:', res);
						this.batteryInfo = res;
					}
				})
				this.batteryInterval = setInterval(() => {
					uni.getBatteryInfo({
						success: (res) => {
							// console.log('获取电量信息res:',res);
							this.batteryInfo = res;
						}
					})
				}, 1000 * 300)
				// #endif
			},

			dateDisplay() {
				const timestamp = this.roomData.now_timestamp;
				this.nowlanguageTime = dateDisplayLocale(timestamp, this.$i18n.locale)
			},

			onSetRoomId() {
				console.log('set room', this._roomId)
				if (isNaN(this._roomId)) {
					uni.showToast({
						title: this.$t('message.alert_error_code')
					})
					return
				}
				this.roomId = this._roomId
				this.showSettingRoomNumber = false
				uni.setStorageSync("ROOM_ID", this.roomId)
				this.syncRoom()
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
				//  else {
				// 	this.nextMeetData = {
				// 		"start_time": 0,
				// 		"end_time": 0,
				// 		"entry_type": 0,
				// 		"repeat_id": null,
				// 		"room_id": this.roomId,
				// 		"timestamp": "",
				// 		"create_by": "",
				// 		"modified_by": "",
				// 		"name": "",
				// 		"type": "I",
				// 		"description": "",
				// 		"book_by": "",
				// 	};
				// }
			},

			initTimeline(data) {

				const startHr = data?.area?.morningstarts ?? 8
				const endHr = data?.area?.eveningends ?? 21

				const res = hourDisplay(startHr, endHr, true);
				console.log(res);

				this.hourList = res
			},

			changeLang(index) {
				const locale = this.$i18n.locale
				this.timezore = timeZoneMapping[locale]
				this.languageSet = languageSetMapping[locale]

				this.dateDisplay()
				this.syncRoom()
			},

			syncRoom() {
				//console.log('syncRoom batteryInfo',this.batteryInfo);
				//console.log('syncRoom deviceInfo',this.deviceInfo);

				syncRoomApi({
					device_id: this.deviceInfo.deviceId,
					battery_level: this.batteryInfo.level,
					is_charging: this.batteryInfo.isCharging,
				}, {
					'Content-type': 'application/json',
					'Accept-Language': this.languageSet
				}, ).then(res => {
					console.log(res);
					let data = res.data.data;
					if (data == null) {
						this.changeStatus('offline') // 离线
						uni.showToast({
							title: this.$t('message.netDataError'),
							icon: 'none'
						})
						return;
					}

					console.log('syncRoom返回数据成功data:', data);
					this.changeStatus('online') // 在线
					this.roomData = data;
					this.initTimeline(data);


					// 寻找当前会议
					let entries = res.data.data.entries
					const len = entries.length
					
					const now = res.data.data.now_timestamp
					let i = 0
					
					for(;i<len;i++){
						if(now>=entries[i].start_time && now<=entries[i].end_time){
							entries[i].isCurrentMeeting = true
							break
						}
					}
					this.meetingList = entries
					console.log(this.meetingList);
					
					if(i<len-1) this.nextMeetData = entries[i+1]

					// this.foundNextMeet();
					// this.dateDisplay();
					// this.meetTimeString = this.nowMeetTime();
				}).catch(e => {
					console.error(e)
				})
			},
			prepareSetting() { // 预先请求一下，成功则跳过登录
				const that = this
				getSettingApi({
					"device_id": that.deviceInfo.deviceId,
					"is_charging": that.batteryInfo.isCharging,
					"battery_level": that.batteryInfo.level,
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

			prepareQuickMeet() {
				this.showQuickMeeting = true;
			},
		},

		onUnload() {
			// 清除定时器
			if (this.interval) {
				clearInterval(this.interval)
				this.interval = null
			}
			if (this.batteryInterval) {
				clearInterval(this.batteryInterval)
				this.batteryInterval = null
			}
		}
	}
</script>

<style lang="scss" scoped>
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
							width: 50rpx;
							flex-shrink: 0;

							.hm {
								height: 30rpx;
								width: 100%;
								text-align: right;
								font-size: 9rpx;
								font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback';
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
									width: 10rpx;
									height: 10rpx;
									animation: blink 2s infinite steps(2);
								}
								@keyframes blink {
								    from {
								        opacity: 0;
								    }
								    to {
								        opacity: 1.0;
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
					font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
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
			font-family: 'Noto Sans CJK SC',
			'Source Han Sans CN',
			'Droid Sans',
			sans-serif;

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
				font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
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
				text-overflow: ellipsis;
				word-wrap: break-word;
				margin-bottom: 5rpx;
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
					font-family: 'Noto Sans CJK SC ExtraLight', 'Source Han Sans CN ExtraLight', 'Droid Sans Fallback', sans-serif;
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