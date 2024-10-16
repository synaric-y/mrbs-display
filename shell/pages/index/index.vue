<template>

	<div class="container" id="app">
		<GuideView v-if="needGuide" :batteryInfo="batteryInfo" :deviceInfo="deviceInfo" />
		<SettingView v-if="settingViewShow" :batteryInfo="batteryInfo" :deviceInfo="deviceInfo" @close="settingViewShow=false" />
		
		<view class="popup-setting-room-number" v-if="showSettingRoomNumber">
			<input class="popup-input" v-model="_roomId" :placeholder="$t('message.alert_code')" />
			<view class="popup-sure" @click="onSetRoomId">{{$t('message.sure')}}</view>
		</view>
		
		<div class="left-time-view">
			<!-- 会议时间 -->
			<view class="meeting-time">
				<view class="meeting-scroll">
					<scroll-view scroll-y="true"
						:class="[largeScreenHeight > 670?'meeting-scroll-view':'ext-scroll-view']"
						@scrolltolower="lower" @scroll="scroll">
						<template v-for="(item,index) in timeRange" :key="index">
							<view class="scroll-view-item">
								<view class="scroll-item-left">
									<text class="scroll-item-time">{{item.leftTitle}}</text>
								</view>
								<!-- 当前有会议 -->
								<template v-if="item.meetHeight > 0">
									<view class="scroll-item-right extention-height"
										:style="{height:item.meetHeight + 'rpx'}">
										<template v-if="item.meetHeight < 40">
											<text class="scroll-item-meeting">{{item.meetRange}}\n{{item.title}}</text>
										</template>
										<template v-else>
											<text class="scroll-item-meeting-more">{{item.meetRange}}\n{{item.title}}</text>
										</template>

										<image v-if="item.isCurrentMeet" class="in-meeting-icon"
											src="@/static/in-meeting.png" mode="aspectFit">
										</image>
									</view>
								</template>
								<!-- 当前无会议 -->
								<template v-else>
									<view class="scroll-item-right">
									</view>
								</template>
							</view>
						</template>
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
					:meetings="roomData?.entries ?? []"
					:avaliableHours="1"/>
			</view>
		</div>
		<div :class="(roomData?.now_entry)?'right-meeting-info right-meeting-info-busy':('right-meeting-info right-meeting-info'+(currentTheme === 'dark' ? '-dark' : '' ))">

			<div class="battery">
				<BatteryShow :battery="batteryInfo.level"/>
			</div>
			<div class="header">
				<div class="header-left">
					<div class="room-title">{{$t('message.room')}}</div>
					<div class="room-number" @longpress="onSetting">{{roomData?.room?.room_name ?? 'A'}}</div>
				</div>
				<div class="header-right">
					<view class="change-language">
						<LanguageSelect @update="changeLang" />
					</view>
					<uni-icons type="gear" @click="settingViewShow=true" color="#ffffff" size="35"></uni-icons>
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
						<text class="meeting-detail-item-desc">{{(roomData?.now_entry)?meetTimeString:'-'}}</text>
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
		getTimestamp
	} from '../../utils/indexTimeTool.js'
	import LanguageSelect from '../../components/LanguageSelect.vue';
	import {
		timeZoneMapping,
		languageSetMapping
	} from '../../src/i18nMapping.js';
	import FastMeetingDialog from '../../components/FastMeetingDialog.vue'
	import SettingView from '../../views/SettingView.vue';
	import GuideView from '../../views/GuideView.vue'
	import BatteryShow from '../../components/BatteryShow.vue'
	import {
		quickMeetApi,
		quickMeetMessageMapping,
		syncRoomApi
	} from '../../api/api.js'
	
	// import {
	// 	quickMeetApi,
	// 	quickMeetMessageMapping,
	// 	syncRoomApi
	// } from '../../api/mockApi.js' // 模拟接口
	
	import { mapGetters, mapMutations } from 'vuex';
	
	export default {
		name: 'App',
		interval: null,
		batteryInterval: null,
		components: {
			FastMeetingDialog,
			GuideView,
			SettingView,
			LanguageSelect,
			BatteryShow
		},
		computed: {
		  ...mapGetters(['currentTheme'])
		},
		data() {
			return {
				needGuide: true, // 引导页面弹窗
				settingViewShow: false, // 设置页面弹窗
				meeting: false,
				timeRange: [],
				showSettingRoomNumber: false, // 内置码输入弹窗
				showQuickMeeting: false, // 快速会议弹窗
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
			let roomId = uni.getStorageSync("ROOM_ID")
			if (roomId) {
				this.roomId = Number(roomId)
				this._roomId = Number(roomId)
			}
			console.log("Room ID: ",roomId);
			const windowInfo = uni.getWindowInfo();
			this.largeScreenHeight = windowInfo.windowHeight;
			console.log('getWindowInfo windowHeight:', this.largeScreenHeight)

			// 获取设备的信息
			let localDeviceInfo = uni.getStorageSync("DEVICE_INFO")
			if (localDeviceInfo) {
				this.deviceInfo = localDeviceInfo
			} else {
				let deviceInfo = uni.getDeviceInfo();
				uni.setStorageSync("DEVICE_INFO", deviceInfo);
				this.deviceInfo = deviceInfo;
			}
			console.log('获取设备的信息deviceInfo:',this.deviceInfo);
			this.startSync();
			
			uni.getBatteryInfo({
				success: (res) => {
					console.log('获取电量信息res:',res);
					this.batteryInfo = res;
				}
			})
		},
		methods: {
			...mapMutations(['changeStatus']), //对象展开运算符直接拿到change
			// 获取会议时间
			nowMeetTime() {
				let start_time;
				let end_time;
				if (this.roomData && this.roomData.now_entry) {
					start_time = this.roomData.now_entry.start_time;
					end_time = this.roomData.now_entry.end_time;
				} else if (this.nextMeetData && this.nextMeetData.start_time) {
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
						console.log('获取电量信息res:',res);
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


			onSetting() {
				this.showSettingRoomNumber = true
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
				const now = new Date();
				const year = now.getFullYear();
				const month = now.getMonth() + 1;
				const day = now.getDate();
				// console.log('initTimeline 进入初始化配置');
				
				// 获取当前正在进行的会议
				if (data.now_entry) {
					console.log('initTimeline enter now_entry');
					this.currenMeetStart = data.now_entry['start_time'];
					this.currenMeetEnd = data.now_entry['end_time'];
					this.roomFree = false;
				} else {
					this.currenMeetStart = 0;
					this.currenMeetEnd = 0;
					this.roomFree = true;
				}
				
				let allMeetList = [];
				
				// 获取区域最早时间和最晚时间
				if (data && data.area) {
					this.meetStartTime = data.area.morningstarts
					this.meetStartMinute = data.area.morningstarts_minutes
					this.meetEndTime = data.area.eveningends
					this.meetEndMinute = data.area.eveningends_minutes
				} else {
					this.meetStartTime = 8;
					this.meetEndTime = 21;
				}
				
				let tempStartTime = Number(this.meetStartTime);
				let tempEndTime = Number(this.meetEndTime);
				let allTimeList = [];
				let isFirst = true;
				// console.log('initTimeline enter tempStartTime tempEndTime:',tempStartTime,tempEndTime); 
				while (tempStartTime <= tempEndTime) {
					
					// 解决小时浮点数转AM和PM
					let ap = 'AM'
					let pmTime = tempStartTime
					let timeTitle = '';
					if (tempStartTime >= 12) {
						ap = 'PM'
						pmTime = tempStartTime - 12
						timeTitle = pmTime.toString().padStart(2, '0') + ':00'
					} else {
						timeTitle = tempStartTime.toString().padStart(2, '0') + ':00'
					}
					let tempMinute = 0;
					if (timeTitle == '00:00') {
						timeTitle = '12:00';
					}
					timeTitle = timeTitle + ap;
					
					
					if (!isFirst) {
						let isfoundEntry = false
						let foundEntry = null;
						let isCurrentMeet = false;
						const timestampline = getTimestamp(year, month, day, tempStartTime - 1, 30);
						for (let meet of data.entries) {
							if (timestampline === meet['start_time']) {
								isfoundEntry = true;
								foundEntry = meet;
								break;
							}
						}
						if (foundEntry) {
							let meetStartRange = formatTime(foundEntry['start_time']);
							let meetEndRange = formatTime(foundEntry['end_time']);
							let meetRange = meetStartRange + '-' + meetEndRange;
							// 当前时间的会议
							if (foundEntry['start_time'] === this.currenMeetStart) {
								isCurrentMeet = true;
							} else {
								isCurrentMeet = false;
							}
							allTimeList.push({
								leftTitle: 'ㆍ',
								startTime: foundEntry['start_time'],
								endTime: foundEntry['end_time'],
								isCurrentMeet: isCurrentMeet,
								title: foundEntry['name'],
								meetRange: meetRange,
								meetHeight: (foundEntry['end_time'] - foundEntry['start_time']) / 1800 * this
									.itemHight
							})
						} else {
							allTimeList.push({
								leftTitle: 'ㆍ',
								startTime: 0,
								endTime: 0,
								isCurrentMeet: false,
								title: '',
								meetRange: '',
								meetHeight: 0
							})
						}
						isFirst = true;
					} else {
						let isAllFoundEntry = false
						let allFounfEntry = null;
						let currentMeet = false;
						const timestampline2 = getTimestamp(year, month, day, tempStartTime, 0);
						for (let meet of data.entries) {
							if (timestampline2 === meet['start_time']) {
								isAllFoundEntry = true;
								allFounfEntry = meet;
								break;
							}
						}

						if (isAllFoundEntry) {
							let startRange = formatTime(allFounfEntry['start_time']);
							let endRange = formatTime(allFounfEntry['end_time']);
							let meetTimeRange = startRange + '-' + endRange;
							// 当前时间的会议
							if (allFounfEntry['start_time'] === this.currenMeetStart) {
								currentMeet = true;
							} else {
								currentMeet = false;
							}
							allTimeList.push({
								leftTitle: timeTitle,
								startTime: allFounfEntry['start_time'],
								endTime: allFounfEntry['end_time'],
								isCurrentMeet: currentMeet,
								title: allFounfEntry['name'],
								meetRange: meetTimeRange,
								meetHeight: (allFounfEntry['end_time'] - allFounfEntry['start_time']) / 1800 * this
									.itemHight
							})
						} else {
							allTimeList.push({
								leftTitle: timeTitle,
								startTime: 0,
								endTime: 0,
								isCurrentMeet: false,
								title: '',
								meetRange: '',
								meetHeight: 0
							})
						}
						isFirst = false;
						tempStartTime += 1
					}
				}
				this.timeRange = allTimeList;
				//console.log('initTimeline拼接的会议数据allTimeList：', this.timeRange)
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
					this.foundNextMeet();
					this.dateDisplay();
					this.meetTimeString = this.nowMeetTime();
				}).catch(e => {
					console.error(e)
				})
			},

			prepareQuickMeet() {
				console.log('prepareQuickMeet');
				if (!this.roomFree) {
					const msg = this.$t('message.noFreeRoom');
					uni.showToast({
						title: msg,
						icon: 'none'
					})
					return;
				}
				this.quickMeet(0);
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

				quickMeetApi({
						room_id: this.roomId,
						confirm: confirm
					}, {
						'Content-type': 'application/json',
						'Accept-Language': this.languageSet
					}).then((res) => {
						
						console.log(res);
						let data = res.data.data;
						let code = res.data.code;

						// this.showQuickMeeting = true;
						console.log('quickMeet返回数据成功data:', data);


						if (confirm == 0 && code == 0) { // 准备阶段成功，直接进快速会议页面，不提示
							this.showQuickMeeting = true;
							return;
						}

						uni.showToast({
							title: this.$t(quickMeetMessageMapping[code + '']), //转成字符串
							icon: 'none'
						})


					})
					.catch((e) => {
						console.error(e)
					})
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
					padding-top: 10rpx;
				}

				.ext-scroll-view {
					width: 250rpx;
					height: 397rpx;
					padding-top: 10rpx;
				}

				.scroll-view-item {
					height: 30rpx;
					width: 250rpx;
					border: 1rpx solid #333333;
					display: flex;
					flex-direction: row;
					
					.scroll-item-left {
						width: 50rpx;
						height: 30rpx;
						
						.scroll-item-time {
							font-size: 9rpx;
							color: white;
							width: 50rpx;
							position: absolute;
							/* background-color: red; */
							left: 8rpx;
							font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
						}
					}
					
					.scroll-item-right {
						background-color: rgba(255, 255, 255, 0.12);
						
						.scroll-item-meeting {
							position: absolute;
							width: 160rpx;
							top: 2rpx;
							left: 8rpx;
							font-size: 9rpx;
							color: white;
							-webkit-line-clamp: 2;
							display: -webkit-box;
							overflow: hidden;
							text-overflow: ellipsis;
							word-wrap: break-word;
							-webkit-box-orient: vertical;
							font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
						}
						
						.scroll-item-meeting-more {
							position: absolute;
							width: 160rpx;
							top: 2rpx;
							left: 8rpx;
							color: rgb(255, 255, 255);
							font-size: 9rpx;
							-webkit-line-clamp: 3;
							display: -webkit-box;
							overflow: hidden;
							text-overflow: ellipsis;
							word-wrap: break-word;
							-webkit-box-orient: vertical;
							font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
						}
						
						.in-meeting-icon {
							position: absolute;
							top: 8rpx;
							right: 10rpx;
							width: 14rpx;
							height: 14rpx;
						}
					}
					.extention-height {
						margin-top: 5rpx;
						height: 60rpx;
						background-color: red;
						width: 172rpx;
						text-align: start;
						margin-left: 13rpx;
						background-color: rgba(255, 255, 255, 0.12);
						position: relative;
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
			
			&-dark{
				background-color: var(--dark-color-primary);
			}
			
			padding: 10rpx 20rpx 0 37rpx;
			box-sizing: border-box;
			text-align: left;
			color: #fff;
			font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
			
			.battery{
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
				
				.header-right{
					
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
		
		.right-meeting-info-busy{
			background-color: var(--color-danger);
			
			&-dark{
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
			
			.meeting-detail-item{
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 10rpx;
				
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