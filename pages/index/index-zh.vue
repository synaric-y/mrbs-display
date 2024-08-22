<template>
	<view class="container" id="app">
		<image class="bg" src="/static/home_bg.png"></image>
		<view class="container-inner">
			<text class="now-time">{{this.currenHM}}
				<text class="now-time-tail">{{this.currenAM}}</text>
			</text>
			<text class="now-date">{{this.currenlanguageTime}}</text>
			<view class="divider-one"></view>
		
			<uni-data-select style="width: 49rpx;color:#4f4f4f" class="select-language" v-model="value" :localdata="datasource"
				@change="changeLang" :clear="false"></uni-data-select>
		
			<!-- <image class="room-icon-cir" src="/static/room_circle.png"></image> -->
			<image class="room-icon" v-if="syncData.room" :src="syncData.room.icon"></image>
			<text class="room-tail" @longpress="onSetting">{{this.$t('message.meeting')}}</text>

			<view class="content-container" v-if="syncData && syncData.current">
				<view :class="[this.meeting?'room-space':'no-room-space']"></view>
				<!-- <view class="room-space"></view> -->
				<view class="room-content-container">
					<text class="room-name">{{$t('message.meeting_theme')}}：<text
							style="font-size: 26rpx;">{{syncData.current.name}}</text></text>
					<text class="room-entry-duration">{{syncData.current.start_end}}</text>
					<text class="room-booker">{{$t('message.booker')}}：{{syncData.current.book_by}}</text>
				</view>
				<view class="room-status room-status-using">{{$t('message.in_meeting')}}</view>
			</view>
			<view class="content-container" v-else-if="foundNextEntry">
				<view :class="[this.meeting?'room-space':'no-room-space']"></view>
				<!-- <view class="room-space"></view> -->
				<view class="room-status room-status-idle">{{$t('message.no_meeting')}}</view>
				<view class="room-content-container" v-if="foundNextEntry && foundNextEntry.name">
					<text class="room-name">{{$t('message.upcoming_meetings')}}：<text
							style="font-size: 26rpx;">{{foundNextEntry.name}}</text></text>
					<text class="room-entry-duration">{{foundNextEntry.start_end}}</text>
					<!-- <text class="room-booker">{{ $t(' hello') }}：{{foundNextEntry.book_by}}</text> -->
					<text class="room-booker">{{ $t('message.booker') }}：{{foundNextEntry.book_by}}</text>
				</view>
			</view>
			<view class="content-container" v-else></view>


			<view class="divider-two"></view>

			<view class="timeline-container">
				<view class="time-span-container">
					<view style="width: 7rpx;"></view>
					<view :class="[item.type == 0 ? 'time-span-text' : 'time-span-dot']"
						v-for="(item, index) in spanList" :key="index">{{item.text}}</view>
					<view style="width: 7rpx;"></view>
				</view>

				<view class="timeline-line-container">
					<view class="timeline-line-item" v-for="(item, index) in timelineColorList" :key="index"
						:style="{background: item.bg, width: item.width + 'rpx', height: '100%', color: item.textColor}">
						{{item.text}}
					</view>
				</view>
				<view class="timeline-line-container" style="margin-top: 5rpx;">
					<view class="timeline-line-entry" :style="{width: item.width + 'rpx', height: '100%'}"
						v-for="(item, index) in timelineColorList" :key="index">
						<text class="timeline-line-item tl-item-ec">{{item.name}}</text>
					</view>
				</view>
				<view class="logo-container">
					<image class="logo" src="/static/logo.png"></image>
				</view>
			</view>
		</view>

		<view class="popup-setting" v-if="showSetting">
			<input class="popup-input" v-model="_roomId" :placeholder="$t('message.alert_code')" />
			<view class="popup-sure" @click="onSetRoomId">{{$t('message.sure')}}</view>
		</view>
	</view>
</template>

<script>
	import {
		HOST
	} from '@/modules/config.js'
	import moment from 'moment-timezone';
	export default {

		interval: null,
		name: 'App',
		data() {
			return {
				lineStartTime: 8,
				lineEndTime: 21,
				spanList: [],
				timelineInterval: 30 * 60, // 会议安排时间线的最小单位30分钟
				timelineColorList: [],
				syncData: {},
				foundNextEntry: {},
				showSetting: false,
				_roomId: 2,
				roomId: 2,
				value: 0,
				isEnglish: false,
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
				currenLanguageTime: '',
				tempData: null,
				currenAM: 'AM',
				currenHM: '',
				meeting: false,
			}
		},
		onLoad() {
			let roomId = uni.getStorageSync("ROOM_ID")
			if (roomId) {
				this.roomId = Number(roomId)
				this._roomId = Number(roomId)
			}
			this.startSync()
		},
		methods: {
			startSync() {
				if (this.interval) {
					clearInterval(this.interval)
					this.interval = null
				}

				this.syncRoom()
				this.interval = setInterval(() => {
					this.syncRoom()
				}, 5000)
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
				this.startSync()
			},
			syncRoom() {
				uni.request({
					url: `${HOST}/web/appapi/api.php?act=sync_room`,
					method: "POST",
					header: {
						'Content-type': 'application/x-www-form-urlencoded',
						'Accept-Language': 'zh-CN,zh;q=0.9'
						//根据要求来配置
					},
					data: {
						room_id: this.roomId
					},
					success: (res) => {
						let data = res.data.data
						console.log('返回数据', data)
						data.now_ap = data.now_time.slice(-2)
						data.now_time = data.now_time.slice(0, -2)
						if (data.entries) {
							for (let e of data.entries) {
								e.start_end = this.formatTime(e['start_time']) + '-' + this.formatTime(e[
									'end_time'])
							}
						}
						if (data.now_entry) {
							data.now_entry.start_end = this.formatTime(data.now_entry['start_time']) + '-' +
								this.formatTime(data.now_entry['end_time'])
						}
						// this.syncData = data
						this.initTimeLine(data)
						this.dateDisplay()
						this.displayHM(data.now_timestamp)

					},
					fail: (e) => {
						console.error(e)
					}
				})
			},
			initTimeLine(data) {
				this.tempData = data
				// 1.生成时间刻度
				let tempTime = this.lineStartTime
				let spanList = []
				let isFirst = true
				while (tempTime <= this.lineEndTime) {
					if (!isFirst) {
						spanList.push({
							text: '·',
							type: 1
						})
					}
					let span = tempTime.toString().padStart(2, '0') + ':00'
					spanList.push({
						text: span,
						type: 0
					})

					isFirst = false
					tempTime += 1
				}
				this.spanList = spanList

				// 寻找下一次会议
				let foundNextEntry = false
				let entryList = data.entries
				// 以服务器时间为准
				let nowTime = data.now_timestamp || (new Date().getTime() / 1000)
				for (let entry of entryList) {
					if (nowTime < entry['start_time']) {
						foundNextEntry = entry
						break
					}
				}
				if (foundNextEntry) {
					this.foundNextEntry = foundNextEntry
				}

				// 2.生成有色时间线
				let todayStart = this.getTimestampOfTodayStart()
				let timelineColorList = []
				let totalWidth = 750 - 37 - 37;
				let totalSeconds = (this.lineEndTime - this.lineStartTime + 1) * 60 * 60
				tempTime = this.lineStartTime * 60 * 60 + todayStart
				// 获取当前分钟数
				let idleStartTime = 0
				while (tempTime <= (this.lineEndTime + 1) * 60 * 60 + todayStart) {
					let found = false
					for (let entry of entryList) {
						if (tempTime >= entry['start_time'] && tempTime <= entry['end_time']) {
							if (idleStartTime != 0) {
								let w = (tempTime - idleStartTime) / totalSeconds * totalWidth

								if (w > 0) {
									if (tempTime > nowTime) {
										console.log('case 1')
										let booktext = this.$t('message.canBook')
										timelineColorList.push({
											text: this.hideTimelineText(tempTime - idleStartTime, booktext),
											textColor: 'white',
											bg: '#08D50A',
											width: (tempTime - idleStartTime) / totalSeconds * totalWidth
										})
									} else {
										console.log('case 2')
										timelineColorList.push({
											text: '',
											textColor: 'black',
											bg: '#9A9A9A',
											width: (tempTime - idleStartTime) / totalSeconds * totalWidth
										})
									}
								}
								idleStartTime = 0
							}

							let text = this.$t('message.booked')
							let bg = '#FF0000'
							let textColor = 'white'
							if (nowTime >= entry['start_time'] && nowTime <= entry['end_time']) {
								text = this.$t('message.small_in_meeting')
								bg = '#FFFF00'
								textColor = 'black'
								data.current = entry
								this.meeting = true
							} else if (nowTime > entry['end_time']) {
								text = this.$t('message.over_meeting')
								bg = '#585757'
								textColor = 'white'
								this.meeting = false
							}
							timelineColorList.push({
								text: this.hideTimelineText(entry['end_time'] - entry['start_time'], text),
								bg,
								name: entry['name'],
								textColor,
								width: (entry['end_time'] - entry['start_time']) / totalSeconds * totalWidth
							})
							found = true
							tempTime = entry['end_time']
							idleStartTime = entry['end_time']

							break
						}
					}

					if (!found) {
						if (idleStartTime == 0) {
							idleStartTime = tempTime
						} else {
							if (idleStartTime < nowTime && tempTime < nowTime && tempTime + this.timelineInterval >
								nowTime) {
								timelineColorList.push({
									text: '',
									textColor: 'black',
									bg: '#9A9A9A',
									width: (tempTime - idleStartTime) / totalSeconds * totalWidth
								})
								// 假设接下来有可预订的时间
								// 如果实际并没有，由于计算得出width == 0，因此假设不成立，可预订时间不会计入
								idleStartTime = tempTime
							}
						}
						tempTime += this.timelineInterval
					} else {
						entryList.shift()
					}

				}
				if (idleStartTime != 0) {
					if (tempTime < nowTime) {
						timelineColorList.push({
							text: '',
							textColor: 'black',
							bg: '#9A9A9A',
							width: (tempTime - idleStartTime) / totalSeconds * totalWidth
						})
					} else {
						timelineColorList.push({
							text: this.hideTimelineText(tempTime - idleStartTime - this.timelineInterval, this.$t(
								'message.canBook')),
							bg: '#08D50A',
							textColor: 'white',
							width: (tempTime - idleStartTime - this.timelineInterval) / totalSeconds * totalWidth
						})
					}
				}
				console.log(timelineColorList)
				this.timelineColorList = timelineColorList
				this.syncData = data
			},
			getTimestampOfTodayStart() {
				let today = new Date();
				today.setHours(0, 0, 0, 0);
				return today.getTime() / 1000;
			},
			hideTimelineText(width, text) {
				return width <= this.timelineInterval ? '' : text
			},
			
			displayHM(timestamp) {
				let dateFormat = 'hh:mm A';
				const koDate = this.formatDate(timestamp, 'Asia/Seoul', 'ko',dateFormat);
				const enDate = this.formatDate(timestamp, 'America/New_York', 'en',dateFormat);
				const zhDate = this.formatDate(timestamp, 'Asia/Shanghai', 'zh-cn',dateFormat);
				let parts = null;
				if (this.$i18n.locale == 'en') {
					parts = enDate.split(' ');
				} else if (this.$i18n.locale == 'ko') {
					parts = koDate.split(' ');
				} else {
					parts = zhDate.split(' ');
				}
				// 提取星期几
				this.currenAM = parts[1];
				this.currenHM = parts[0];
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
			changeLang(index) {
				console.log('lang index', index)
				console.log('lang selected item', this.datasource[index])
				var lang = this.datasource[index].key
				if (lang == 'en') {
					this.isEnglish = true
				} else {
					this.isEnglish = false
				}
				console.log('lang selected lang', lang)
				this.$i18n.locale = lang
				this.dateDisplay()
				this.initTimeLine(this.tempData)
				this.syncRoom()
			},
			formatDate(timestamp, timeZone, locale,dateFormat) {
				return moment.unix(timestamp)
					.tz(timeZone)
					.locale(locale)
					.format(dateFormat);
			},
			dateDisplay() {
				// 2024年8月8日星期四、
				// 英文：Wednesday,September.7,2024
				// 韩文：2024년 8월 8일 목요일
				const timestamp = this.syncData.now_timestamp;
				// 格式化日期为中文、英文、韩文，并考虑时区
				let dateFormat = 'YYYY年MM月DD日 dddd';
				if (this.$i18n.locale == 'en') {
					dateFormat = 'dddd, MMMM D, YYYY';
				} else if (this.$i18n.locale == 'ko') {
					dateFormat = 'YYYY년MM월DD일 dddd';
				} else {
					dateFormat = 'YYYY年MM月DD日 dddd';
				}
				if(this.tempData) {
					this.displayHM(this.tempData.now_timestamp)
				}
				const koDate = this.formatDate(timestamp, 'Asia/Seoul', 'ko',dateFormat);
				const enDate = this.formatDate(timestamp, 'America/New_York', 'en',dateFormat);
				const zhDate = this.formatDate(timestamp, 'Asia/Shanghai', 'zh-cn',dateFormat);
				if (this.$i18n.locale == 'en') {
					// console.log('英文日期:', enDate); // 英文输出
					this.currenlanguageTime = enDate
				} else if (this.$i18n.locale == 'ko') {
					// console.log('韩文日期:', koDate); // 韩文输出
					// 使用 split 方法分隔字符串
					const parts = koDate.split(' ');
					// 提取星期几
					const dayOfWeek = parts[1];
					const tempday = this.translateDay(dayOfWeek);
					this.currenlanguageTime = parts[0] + ' ' + tempday;
				} else {
					// console.log('中文日期:', zhDate); // 中文输出
					const parts = zhDate.split(' ');
					const dayOfWeek = parts[1];
					const tempday = this.translateDay(dayOfWeek);
					this.currenlanguageTime = parts[0] + ' ' + tempday;
				}
			},

			translateDay(day) {
				const lang = this.$i18n.locale;
				const weekDays = {
					zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
					en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
					ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
				};
				const index = weekDays.en.indexOf(day);
				if (index !== -1) {
					return weekDays[lang][index];
				} else {
					throw new Error(`Day "${day}" not found in English weekDays.`);
				}
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
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.container-inner {
		width: 750rpx;
		height: 468rpx;
		position: relative;
		box-sizing: border-box;
		margin-top: -40rpx;
	}

	.bg {
		width: 750rpx;
		height: 100vh;
		position: absolute;
		top: 0;
		left: 0;
	}

	.now-time {
		position: absolute;
		left: 43rpx;
		top: 41rpx;
		height: 68rpx;
		line-height: 68rpx;
		font-size: 50rpx;
		color: white;
	}

	.now-time-tail {
		font-size: 28rpx;
		color: white;
		margin-left: -7rpx;
	}

	.now-date {
		position: absolute;
		left: 46rpx;
		top: 93rpx;
		height: 43rpx;
		line-height: 43rpx;
		font-size: 16rpx;
		color: white;
	}

	.divider-one {
		position: absolute;
		left: 0;
		top: 150rpx;
		width: 359rpx;
		height: 1rpx;
		background-color: rgba(255, 255, 255, 0.1);
	}
	
	.uni-select {
		border: none !important;
	}
	
	.uni-select__input-text {
		color: white !important;
		border: none !important;
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

	.select-language {
		border: none;
		position: absolute;
		top: 35rpx;
		right: 20rpx;
		width: 49rpx;
		height: 25rpx;
		text-align: center;
		line-height: 25rpx;
	}
	
	.arrow-down-icon {
		position: relative;
		left: 0;
		top: 0;
		width: 100rpx;
		height: 30rpx;
		background-color: red;
	}

	.room-icon-cir {
		position: absolute;
		top: 46rpx;
		right: 273rpx;
		width: 127rpx;
		height: 127rpx;
	}

	.room-icon {
		position: absolute;
		top: 30rpx;
		right: 270rpx;
		width: 140rpx;
		height: 182rpx;
	}

	.room-tail {
		position: absolute;
		top: 71rpx;
		right: 5rpx;
		width: 252rpx;
		height: 102rpx;
		line-height: 102rpx;
		font-size: 70rpx;
		color: white;
		text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.4)
	}

	.content-container {
		position: absolute;
		top: 150rpx;
		left: 0;
		width: 750rpx;
		height: 191rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.room-status {
		width: 396rpx;
		height: 168rpx;
		line-height: 168rpx;
		font-size: 100rpx;
		text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.4);
		margin-top: 42rpx;
	}

	.room-status-using {
		color: #FFFF00;
	}

	.room-status-idle {
		color: #00FF02;
		text-align: center;
	}

	.room-content-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.room-space {
		width: 46rpx;
		height: 100rpx;
	}
	
	.no-room-space {
		/* width: 46rpx;
		height: 100rpx; */
	}

	.room-name {
		width: 100%;
		height: 43rpx;
		margin-top: 14rpx;
		line-height: 43rpx;
		font-size: 18rpx;
		color: white;
		-webkit-line-clamp: 1;
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
		word-wrap: break-word;
		-webkit-box-orient: vertical;
	}

	.room-entry-duration {
		height: 47rpx;
		margin-top: 11rpx;
		line-height: 47rpx;
		font-size: 48rpx;
		color: white;
		text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.4)
	}

	.room-booker {
		height: 43rpx;
		margin-top: 11rpx;
		line-height: 43rpx;
		font-size: 18rpx;
		color: white;
	}

	.divider-two {
		position: absolute;
		left: 0;
		top: 342rpx;
		width: 750rpx;
		height: 1rpx;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.timeline-container {
		position: absolute;
		left: 37rpx;
		right: 37rpx;
		top: 354rpx;
	}

	.time-span-container {
		width: 100%;
		height: 30rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.time-span-text {
		font-size: 12rpx;
		color: white;
		flex: 1;
		text-align: center;
	}

	.time-span-dot {
		width: 14rpx;
		font-size: 12rpx;
		color: white;
		text-align: center;
	}

	.timeline-line-container {
		width: 100%;
		height: 22rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.timeline-line-entry {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.timeline-line-item {
		text-align: center;
		line-height: 22rpx;
		font-size: 12rpx;
		color: white;
	}

	.tl-item-ec {
		max-width: 100%;
		height: 22rpx;
		-webkit-line-clamp: 1;
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
		word-wrap: break-word;
		-webkit-box-orient: vertical;
	}

	.logo-container {
		width: 100%;
		height: 14rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 14rpx;
	}

	.logo {
		width: 177rpx;
		height: 18.7rpx;
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
		top: 100rpx;
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
</style>