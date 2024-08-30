<template>
	<view class="container" id="app">
		<view class="popup-setting" v-if="showSetting">
			<input class="popup-input" v-model="_roomId" :placeholder="$t('message.alert_code')" />
			<view class="popup-sure" @click="onSetRoomId">{{$t('message.sure')}}</view>
		</view>
		<!-- 快速会议弹窗 -->
		<view class="popup-quick-meeting" v-if="showQuickMeeting">
			<text class="quick-meeting-msg">{{quickMeetingMsg}}</text>
			<view :class="[isEnglish == true?'quick-meeting-btns-en':'quick-meeting-btns']">
				<view class="quick-cancle-btn" @click="cancleQuickMeet">{{$t('message.cancle')}}</view>
				<view class="quick-sure-btn" @click="sureQuickMeet">{{$t('message.confirm')}}</view>
			</view>
		</view>
		<!-- 会议部分 -->
		<view class="left-time-view">
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
											<text
												class="scroll-item-meeting-more">{{item.meetRange}}\n{{item.title}}</text>
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
				<view class="reserve-title">{{$t('message.quickMeeting')}}</view>
				<view :class="[roomData.now_entry != null?'reserve-button':'reserve-button-free']"
					@click="prepareQuickMeet">
					{{$t('message.book')}}
				</view>
			</view>
		</view>
		<!-- 会议基本信息 -->
		<view :class="[(roomData && roomData.now_entry)?'right-in-meeting-bg':'right-meeting-info']">
			<!-- 房间 时间 切换语言 -->
			<view class="right-meeting-top">
				<view>
					<view class="room-group" v-if="roomData && roomData.room">
						<text class="room-title">{{$t('message.room')}}</text>
						<text class="room-number" @longpress="onSetting">{{roomData.room.room_name}}</text>
					</view>
					<view class="room-group" v-else>
						<text class="room-title">{{$t('message.room')}}</text>
						<text class="room-number" @longpress="onSetting">A</text>
					</view>
					<view class="change-language">
						<!-- language -->
						<uni-data-select style="width: 49rpx;color:#4f4f4f" class="select-language"
							:placeholder="$t('message.language')" :localdata="datasource" @change="changeLang"
							:clear="false"></uni-data-select>
					</view>
				</view>
				<!-- 分割线 -->
				<view class="room-devide-line"></view>
				<!-- 当前时间 -->
				<view class="curren-time">{{this.nowlanguageTime}}</view>
			</view>
			<!-- 会议详情 -->
			<view class="right-meeting-detail">
				<template v-if="roomData && roomData.now_entry">
					<view class="meeting-status">
						{{$t('message.in_meeting')}}
					</view>
				</template>
				<template v-else>
					<view class="meeting-status">
						{{$t('message.no_meeting')}}
					</view>
				</template>
				<template v-if="roomData && roomData.now_entry">
					<view class="placehold-view"></view>
					<view class="meeting-title-type" v-if="roomData && roomData.now_entry">
						<image class="meeting-msg-icon" src="@/static/meeting-msg.png" mode=""></image>
						<text class="meeting-msg-title reverse-title">{{roomData.now_entry.name}}</text>
						<!-- <text class="meeting-msg-title reverse-title">临时会议临时会议临时会议临临时会议临时会议时会议临时会议临时会议</text> -->
					</view>
					<view class="meeting-title-type">
						<image class="meeting-msg-icon" src="@/static/reverse-time.png" mode=""></image>
						<text v-if="roomData && roomData.now_entry"
							class="meeting-msg-title reverse-time">{{this.meetTimeString}}</text>
						<text v-else class="meeting-msg-title reverse-time">{{$t('message.no_meeting')}}</text>
					</view>
					<view class="meeting-title-type" v-if="roomData && roomData.now_entry">
						<image class="meeting-msg-icon" src="@/static/reverse-person.png" mode=""></image>
						<text class="meeting-msg-title reverse-person">{{roomData.now_entry.book_by}}</text>
					</view>
				</template>

				<template v-else>
					<view class="nextMeet">
						{{$t('message.nextMeet')}}
					</view>
					<view class="placehold-view"></view>
					<view class="meeting-title-type">
						<image class="meeting-msg-icon" src="@/static/meeting-msg.png" mode=""></image>
						<text class="meeting-msg-title reverse-title">{{nextMeetData.name}}</text>
					</view>
					<view class="meeting-title-type">
						<image class="meeting-msg-icon" src="@/static/reverse-time.png" mode=""></image>
						<text v-if="nextMeetData" class="meeting-msg-title reverse-time">{{this.meetTimeString}}</text>
						<text v-else class="meeting-msg-title reverse-time"></text>
					</view>
					<view class="meeting-title-type">
						<image class="meeting-msg-icon" src="@/static/reverse-person.png" mode=""></image>
						<text class="meeting-msg-title reverse-person">{{nextMeetData.book_by}}</text>
					</view>
				</template>
			</view>
			<view class="right-meeting-logo">
				<image class="company-logo" src="@/static/bcc-logo-en.png" mode="aspectFit"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		HOST
	} from '@/modules/config.js'
	import moment from 'moment-timezone';
	export default {
		name: 'App',
		interval: null,
		batteryInterval: null,
		data() {
			return {
				meeting: false,
				timeRange: [],
				showSetting: false,
				showQuickMeeting: false,
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
				datasource: [{
					value: 0,
					text: '中文',
					key: 'zh'
				}, {
					value: 1,
					text: 'English',
					key: 'en'
				}, {
					value: 2,
					text: '한국인',
					key: 'ko'
				}],
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
				isEnglish: false,
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
			const windowInfo = uni.getWindowInfo();
			this.startSync();
			this.largeScreenHeight = windowInfo.windowHeight;
			console.log('getWindowInfo windowHeight:', this.largeScreenHeight)
			
			// 获取设备的信息
			let localDeviceInfo = uni.getStorageSync("DEVICE_INFO")
			if(localDeviceInfo) {
				this.deviceInfo = localDeviceInfo
			} else {
				let deviceInfo = uni.getDeviceInfo();
				uni.setStorageSync("DEVICE_INFO", deviceInfo);
				this.deviceInfo = deviceInfo;
			}
			console.log('获取设备的信息deviceInfo:',deviceInfo);
		},
		methods: {
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
				const startTime = this.formatDate(start_time, 'Asia/Shanghai', 'zh-cn', dateFormat);
				const endTime = this.formatDate(end_time, 'Asia/Shanghai', 'zh-cn', dateFormat);
				let stampStr = startTime + '-' + endTime;
				console.log('nowMeetTime startTime endTime', startTime, endTime);
				return stampStr;
			},

			startSync() {
				if (this.interval) {
					clearInterval(this.interval)
					this.interval = null
				}
				this.syncRoom()
				this.interval = setInterval(() => {
					this.syncRoom()
				}, 5000)
				
				// 5分钟获取一次电量信息
				if (this.batteryInterval) {
					clearInterval(this.batteryInterval)
					this.batteryInterval = null
				}
				this.batteryInterval = setInterval(() => {
					uni.getBatteryInfo({
					  success: (res) => {
					    console.log('获取电量信息res:',res);
						this.batteryInfo = res;
					  }
					})
				},1000*300)
			},

			dateDisplay() {
				const timestamp = this.roomData.now_timestamp;
				console.log('dateDisplay now_timestamp', timestamp);
				let dateFormat = 'YYYY年MM月DD日';
				if (this.$i18n.locale == 'en') {
					dateFormat = 'MMMM D, YYYY';
				} else if (this.$i18n.locale == 'ko') {
					dateFormat = 'YYYY년MM월DD일';
				} else {
					dateFormat = 'YYYY年MM月DD日';
				}
				const displayAP = this.displayHM(timestamp);
				const koDate = this.formatDate(timestamp, 'Asia/Seoul', 'ko', dateFormat);
				const enDate = this.formatDate(timestamp, 'America/New_York', 'en', dateFormat);
				const zhDate = this.formatDate(timestamp, 'Asia/Shanghai', 'zh-cn', dateFormat);
				if (this.$i18n.locale == 'en') {
					this.nowlanguageTime = displayAP + '  ' + enDate;
				} else if (this.$i18n.locale == 'ko') {
					this.nowlanguageTime = displayAP + '  ' + koDate;
				} else {
					this.nowlanguageTime = displayAP + '  ' + zhDate;
				}
				// console.log('dateDisplay now_timestamp currenlanguageTime', this.nowlanguageTime);
			},

			displayHM(timestamp) {
				let dateFormat = 'hh:mm A';
				const koDate = this.formatDate(timestamp, 'Asia/Seoul', 'ko', dateFormat);
				const enDate = this.formatDate(timestamp, 'America/New_York', 'en', dateFormat);
				const zhDate = this.formatDate(timestamp, 'Asia/Shanghai', 'zh-cn', dateFormat);
				let parts = null;
				if (this.$i18n.locale == 'en') {
					parts = enDate.split(' ');
				} else if (this.$i18n.locale == 'ko') {
					parts = koDate.split(' ');
				} else {
					parts = zhDate.split(' ');
				}
				console.log('displayHM am pm :', parts);
				const timeMinute = parts[0];
				const ap = parts[1];
				return timeMinute + ' ' + ap;
			},

			onSetting() {
				this.showSetting = true
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
				this.showSetting = false
				uni.setStorageSync("ROOM_ID", this.roomId)
				this.syncRoom()
			},

			formatDate(timestamp, timeZone, locale, dateFormat) {
				return moment.unix(timestamp)
					.tz(timeZone)
					.locale(locale)
					.format(dateFormat);
			},

			formatTime(timestamp) {
				// 将10位时间戳转换为Date对象
				var date = new Date(timestamp * 1000);
				// 获取小时和分钟
				var hours = date.getHours().toString().padStart(2, '0');
				var minutes = date.getMinutes().toString().padStart(2, '0');
				// 返回格式化的时间字符串
				return hours + ':' + minutes;
			},

			getTimestamp(year, month, day, hour, minute) {
				// 注意：JavaScript 中的月份从 0 开始，所以需要减 1
				const date = new Date(year, month - 1, day, hour, minute, 0, 0); // 秒和毫秒设置为0
				return Math.floor(date.getTime() / 1000); // 将毫秒转为秒
			},

			foundNextMeet() {
				// this.nextMeetData = null;
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
				} else {
					this.nextMeetData = {
						"start_time": 0,
						"end_time": 0,
						"entry_type": 0,
						"repeat_id": null,
						"room_id": this.roomId,
						"timestamp": "",
						"create_by": "",
						"modified_by": "",
						"name": "",
						"type": "I",
						"description": "",
						"book_by": "",
					};
				}
			},

			initTimeline(data) {
				const now = new Date();
				const year = now.getFullYear();
				const month = now.getMonth() + 1;
				const day = now.getDate();
				// console.log('initTimeline 进入初始化配置');
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
					if(timeTitle == '00:00') {
						timeTitle = '12:00';
					}
					timeTitle = timeTitle + ap;
					if (!isFirst) {
						let isfoundEntry = false
						let foundEntry = null;
						let isCurrentMeet = false;
						const timestampline = this.getTimestamp(year, month, day, tempStartTime - 1, 30);
						for (let meet of data.entries) {
							if (timestampline === meet['start_time']) {
								isfoundEntry = true;
								foundEntry = meet;
								break;
							}
						}
						if (foundEntry) {
							let meetStartRange = this.formatTime(foundEntry['start_time']);
							let meetEndRange = this.formatTime(foundEntry['end_time']);
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
								meetHeight: (foundEntry['end_time'] - foundEntry['start_time']) / 1800 * this.itemHight
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
						const timestampline2 = this.getTimestamp(year, month, day, tempStartTime, 0);
						for (let meet of data.entries) {
							if (timestampline2 === meet['start_time']) {
								isAllFoundEntry = true;
								allFounfEntry = meet;
								break;
							}
						}

						if (isAllFoundEntry) {
							let startRange = this.formatTime(allFounfEntry['start_time']);
							let endRange = this.formatTime(allFounfEntry['end_time']);
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
								meetHeight: (allFounfEntry['end_time'] - allFounfEntry['start_time']) / 1800 * this.itemHight
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
				// console.log('initTimeline拼接的会议数据allTimeList：', this.timeRange)
			},

			changeLang(index) {
				console.log('lang index', index)
				console.log('lang selected item', this.datasource[index])
				var lang = this.datasource[index].key
				if (lang == 'en') {
					this.isEnglish = true
					this.timezore = 'America/New_York'
					this.languageSet = 'en-US,en;q=0.9'
				} else if (lang == 'ko') {
					this.isEnglish = false
					this.timezore = 'Asia/Seoul'
					this.languageSet = 'ko-KR,ko;q=0.9'
				} else {
					this.isEnglish = false
					this.timezore = 'Asia/Shanghai'
					this.languageSet = 'zh-CN,zh;q=0.9'
				}
				console.log('lang selected lang', lang)
				this.$i18n.locale = lang
				this.dateDisplay()
				this.syncRoom()
			},

			syncRoom() {
				console.log('syncRoom batteryInfo',this.batteryInfo);
				console.log('syncRoom deviceInfo',this.deviceInfo);
				uni.request({
					url: `${HOST}/web/appapi/api.php?act=sync_room`,
					method: "POST",
					header: {
						'Content-type': 'application/json',
						'Accept-Language': this.languageSet
					},
					data: {
						room_id: this.roomId,
						timezone: this.timezore,
						device_id: this.deviceInfo.deviceId,
						battery_level: this.batteryInfo.level,
						battery_charge: this.batteryInfo.isCharging,
						device_info: this.deviceInfo,
					},
					success: (res) => {
						let data = res.data.data;
						if (data == null) {
							uni.showToast({
								title: this.$t('message.netDataError'),
								icon: 'none'
							})
							return;
						}
						console.log('syncRoom返回数据成功data:', data);
						this.roomData = data;
						this.initTimeline(data);
						this.foundNextMeet();
						this.dateDisplay();
						this.meetTimeString = this.nowMeetTime();
					},
					fail: (e) => {
						console.error(e)
					}
				})
			},

			prepareQuickMeet() {
				console.log('prepareQuickMeet');
				if(this.roomFree == false) {
					const msg = this.$t('message.noFreeRoom');
					uni.showToast({
						title: msg,
						icon: 'none'
					})
					return;
				}
				this.quickMeet(0);
			},
			
			cancleQuickMeet() {
				this.showQuickMeeting = false;
			},
			
			sureQuickMeet() {
				this.showQuickMeeting = false;
				this.quickMeet(1);
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
				uni.request({
					url: `${HOST}/web/appapi/api.php?act=book_fast_meeting`,
					method: "POST",
					header: {
						'Content-type': 'application/json',
						'Accept-Language': this.languageSet
					},
					data: {
						room_id: this.roomId,
						confirm: confirm
					},
					success: (res) => {
						let data = res.data;
						console.log('quickMeet返回数据成功data:', data);
						if(confirm == 0 && data && data.data) {
							this.showQuickMeeting = true;
							this.quickMeetingMsg = data.data.time;
							return;
						} 
						let msg = '';
						if (data.code == -1) {
							msg = this.$t('message.noRoom');
						} else if (data.code == -2) {
							msg = this.$t('message.noFreeRoom');
						} else if (data.code == 0) {
							msg = this.$t('message.createMeetSuccess');
						}
						uni.showToast({
							title: msg,
							icon: 'none'
						})
					},
					fail: (e) => {
						console.error(e)
					}
				})
			},
		},
		
		onUnload() {
			// 清除定时器
			if(this.interval) {
				clearInterval(this.interval)
				this.interval = null
			}
			if(this.batteryInterval) {
				clearInterval(this.batteryInterval)
				this.batteryInterval = null
			}
		}
	}
</script>

<style>
	.container {
		width: 750rpx;
		height: 100vh;
		display: flex;
		flex-direction: row;
	}

	.left-time-view {
		display: flex;
		margin: 0;
		padding: 0;
		width: 250rpx;
		background-color: #333333;
	}

	.meeting-time {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 250rpx;
		height: 100%;
		position: relative;
	}

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
	}

	.scroll-item-left {
		width: 50rpx;
		height: 30rpx;
	}

	.scroll-item-time {
		font-size: 9rpx;
		color: white;
		width: 50rpx;
		position: absolute;
		/* background-color: red; */
		left: 8rpx;
		font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
	}

	.scroll-item-right {
		background-color: rgba(255, 255, 255, 0.12);
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

	.scroll-item-meeting {
		position: absolute;
		width: 160rpx;
		top: 2rpx;
		left: 8rpx;
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

	.scroll-item-meeting {
		font-size: 9rpx;
		color: white;
	}

	.reserve-meeting {
		display: flex;
		flex-direction: column;
		height: 63rpx;
		width: 250rpx;
		border-top: 1rpx solid rgba(230, 241, 252, 0.25);
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
		position: absolute;
		left: 0;
		bottom: 0;
	}

	.reserve-title {
		margin-top: 2rpx;
		width: 250rpx;
		height: 17rpx;
		font-size: 10rpx;
		text-align: center;
		color: white;
	}

	.reserve-button {
		width: 187rpx;
		height: 32rpx;
		line-height: 32rpx;
		border-radius: 4rpx 4rpx 4rpx 4rpx;
		margin-left: 32rpx;
		background-color: rgba(230, 241, 252, 0.25);
		color: white;
		font-size: 14rpx;
		text-align: center;
		box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.4);
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
	}

	.reserve-button-free {
		width: 187rpx;
		height: 32rpx;
		line-height: 32rpx;
		border-radius: 4rpx 4rpx 4rpx 4rpx;
		margin-left: 32rpx;
		background-color: rgba(129, 179, 55, 1);
		color: white;
		font-size: 14rpx;
		text-align: center;
		box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.4);
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
	}

	.right-meeting-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100vh;
		background-color: #591BB7;
	}

	.right-in-meeting-bg {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100vh;
		background-color: #BD3124;
	}

	.right-meeting-top {
		width: 100%;
		height: 92rpx;
		display: flex;
		flex-direction: column;
	}

	.room-group {
		margin-left: 37rpx;
		margin-top: 10rpx;
	}

	.room-title {
		font-size: 20rpx;
		color: white;
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
	}

	.room-number {
		margin-left: 8rpx;
		font-size: 38rpx;
		color: white;
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
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
	}

	.select-language {
		position: absolute;
		top: -1rpx;
		left: 6rpx;
		right: 0rpx;
		bottom: 0rpx;
		width: 100%;
		background-color: clean;
	}

	.uni-select {
		border: none !important;
	}

	.uni-select__input-text {
		color: white !important;
		border: none !important;
	}

	.uni-select__input-placeholder {
		color: white !important;
		font-size: 11rpx !important;
	}

	.uni-select-item {
		color: #4f4f4f;
		border: none !important;
	}

	.uni-select__selector-item {
		line-height: 28rpx !important;
	}

	.uni-select-menu {
		background-color: #fff;
		border: 1px solid #ccc;
	}

	.room-devide-line {
		display: flex;
		margin-left: 37rpx;
		width: 100%;
		height: 1rpx;
		background-color: rgba(255, 255, 255, 0.12);
	}

	.curren-time {
		margin-top: 5rpx;
		margin-left: 37rpx;
		font-size: 18rpx;
		text-align: left;
		width: 100%;
		height: 40rpx;
		font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
		color: white;
	}

	.right-meeting-detail {
		padding: 0;
		margin: 0;
		flex: 1;
		flex-direction: column;
	}

	.meeting-status {
		width: 423rpx;
		height: 108rpx;
		margin-top: 26rpx;
		margin-left: 37rpx;
		font-size: 80rpx;
		text-align: left;
		color: white;
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
	}

	.nextMeet {
		margin-left: 37rpx;
		line-height: 20px;
		color: rgb(255, 255, 255);
		font-size: 14px;
		text-align: left;
		font-style: italic;
		font-family: Helvetica Neue-thin;
	}

	.meeting-title-type {
		margin-left: 37rpx;
		height: 37rpx;
	}

	.placehold-view {
		margin-top: 10rpx !important;
	}

	.reverse-title {
		line-height: 30rpx;
		color: rgb(255, 255, 255);
		font-size: 28rpx;
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
		margin-top: -33rpx;
		padding-left: 20rpx;
		width: 400rpx;
		-webkit-line-clamp: 1;
		display: -webkit-box;
		overflow: hidden;
		text-align: left;
		text-overflow: ellipsis;
		word-wrap: break-word;
		-webkit-box-orient: vertical;
	}

	.reverse-time {
		margin-left: 37rpx;
		height: 47rpx;
		line-height: 23rpx;
		color: white;
		font-size: 18rpx;
		text-align: left;
		font-style: italic;
		font-family: 'Noto Sans CJK SC ExtraLight', 'Source Han Sans CN ExtraLight', 'Droid Sans Fallback', sans-serif;
	}

	.reverse-person {
		height: 47rpx;
		line-height: 23rpx;
		color: rgb(255, 255, 255);
		font-size: 18rpx;
		text-align: left;
		font-style: italic;
		font-family: 'Noto Sans CJK SC ExtraLight', 'Source Han Sans CN ExtraLight', 'Droid Sans Fallback', sans-serif;
	}

	.meeting-msg-icon {
		width: 17rpx;
		height: 17rpx;
	}

	.meeting-msg-title {
		margin-left: 17rpx;
	}

	.right-meeting-logo {
		width: 100%;
		height: 50rpx;
	}

	.company-logo {
		margin-left: 37rpx;
		width: 150rpx;
		height: 17rpx;
	}

	.popup-setting {
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
	}
	
	.popup-quick-meeting {
		width: 250rpx;
		height: 130rpx;
		background-color: #FCCA00;
		border-radius: 5rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 1000;
		position: fixed;
		left: 250rpx;
		top: 150rpx;
	}

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
	
	.quick-meeting-msg {
		padding-left: 20rpx;
		padding-right: 20rpx;
		margin-top: 15rpx;
		line-height: 19rpx;
		color: rgba(51,51,51,1);
		font-size: 13rpx;
		text-align: center;
		font-family: PingFangSC-medium;
	}
	
	.quick-meeting-btns {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		width: 100%;
		margin-top: 30rpx;
	}
	
	.quick-meeting-btns-en {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		height: 75rpx;
		width: 100%;
		margin-top: 10rpx;
	}
	
	.quick-cancle-btn {
		height: 32rpx;
		width: 72rpx;
		line-height: 32rpx;
		border-radius: 4rpx 4rpx 4rpx 4rpx;
		background-color: #FCCA00;
		color: rgba(0,0,0,1);
		font-size: 14rpx;
		text-align: center;
		box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0,0,0,0.4);
		font-family: Roboto;
	}
	
	.quick-sure-btn {
		height: 32rpx;
		width: 72rpx;
		line-height: 32rpx;
		border-radius: 4rpx 4rpx 4rpx 4rpx;
		background-color: #FCCA00;
		color: rgba(0,0,0,1);
		font-size: 14rpx;
		text-align: center;
		box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0,0,0,0.4);
		font-family: Roboto;
	}
	
</style>