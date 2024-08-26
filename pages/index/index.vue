<template>
	<view class="container" id="app">
		<view class="popup-setting" v-if="showSetting">
			<input class="popup-input" v-model="_roomId" :placeholder="$t('message.alert_code')" />
			<view class="popup-sure" @click="onSetRoomId">{{$t('message.sure')}}</view>
		</view>
		<!-- 会议部分 -->
		<view class="left-time-view">
			<!-- 会议时间 -->
			<view class="meeting-time">
				<view class="meeting-scroll">
					<scroll-view scroll-y="true" class="meeting-scroll-view" @scrolltolower="lower" @scroll="scroll">
						<template v-for="(item,index) in timeRange" :key="index">
							<view class="scroll-view-item">
								<view class="scroll-item-left">
									<text class="scroll-item-time">{{item.leftTitle}}</text>
								</view>
								<!-- 当前有会议 -->
								<template v-if="item.meetHeight > 0">
									<view class="scroll-item-right extention-height" :style="{height:item.height + 'rpx'}">
										<text class="scroll-item-meeting">{{item.meetRange}}\n{{item.title}}</text>
										<image class="in-meeting-icon" src="@/static/in-meeting.png"
											mode="aspectFit"></image>
									</view>
								</template>
								<!-- 当前无会议 -->
								<template v-else>
									<view class="scroll-item-right">
										<!-- <text class="scroll-item-meeting">Sales meeting</text> -->
									</view>
								</template>
							</view>
						</template>
					</scroll-view>
				</view>
			</view>
			<!-- 预约会议 -->
			<view class="reserve-meeting">
				<view class="reserve-title">30-minute quick meeting can be booked</view>
				<view class="reserve-button">Book</view>
			</view>
		</view>
		<!-- 会议基本信息 -->
		<view class="right-meeting-info">
			<!-- 房间 时间 切换语言 -->
			<view class="right-meeting-top">
				<view>
					<view class="room-group">
						<text class="room-title">Room</text>
						<text class="room-number" @longpress="onSetting">A</text>
					</view>
					<view class="change-language">
						language
					</view>
				</view>
				<!-- 分割线 -->
				<view class="room-devide-line"></view>
				<!-- 当前时间 -->
				<view class="curren-time">
					09:06AM August 23, 2024
				</view>
			</view>
			<!-- 会议详情 -->
			<view class="right-meeting-detail">
				<view class="meeting-status">
					In meeting
				</view>
				<view class="meeting-title-type">
					<image class="meeting-msg-icon" src="../../static/meeting-msg.png" mode=""></image>
					<text class="meeting-msg-title reverse-title">Sales meeting</text>
				</view>
				<view class="meeting-title-type">
					<image class="meeting-msg-icon" src="../../static/reverse-time.png" mode=""></image>
					<text class="meeting-msg-title reverse-time">09:00am -11:00am</text>
				</view>
				<view class="meeting-title-type">
					<image class="meeting-msg-icon" src="../../static/reverse-person.png" mode=""></image>
					<text class="meeting-msg-title reverse-person">April Ren</text>
				</view>
			</view>
			<view class="right-meeting-logo">
				<image class="company-logo" src="../../static/bcc-logo-en.png" mode="aspectFit"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		HOST
	} from '@/modules/config.js'
	export default {
		name: 'App',
		interval: null,
		data() {
			return {
				value: 0,
				meeting: false,
				timeRange:[],
				// timeRange: ['09:00am', 'ㆍ', '10:00am', 'ㆍ', '11:00am', 'ㆍ', '12:00pm', 'ㆍ', '01:00pm', 'ㆍ', '02:00pm', 'ㆍ',
				// 	'03:00pm', 'ㆍ', '04:00pm', 'ㆍ', '05:00pm', 'ㆍ', '06:00pm', 'ㆍ', '07:00pm', 'ㆍ'
				// ],
				showSetting: false,
				_roomId: 2,
				roomId: 2,
				meetStartTime: 8,
				meetStartMinute: 0,
				meetEndTime: 21,
				meetEndMinute: 30,
				meetArangeList: [],
				currenMeetStart: 0,
				currenMeetEnd: 0,
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
				// this.interval = setInterval(() => {
				// 	this.syncRoom()
				// }, 5000)
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
			// getUTCTimestamp(year, month, day, hour, minute) {
			//   const timestamp = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
			//   return Math.floor(timestamp / 1000); // 将毫秒转为秒
			// },

			initTimeline(data) {
				// 当前会议开始、结束时间
				const now = new Date();
				const year = now.getFullYear();
				const month = now.getMonth() + 1;
				const day = now.getDate();
				// console.log('initTimeline 进入初始化配置');
				if (data.now_entry) {
					console.log('initTimeline enter now_entry');
					this.currenMeetStart = data.now_entry['start_time'];
					this.currenMeetEnd = data.now_entry['end_time'];
				} else {
					this.currenMeetStart = 0;
					this.currenMeetEnd = 0;
				}
				let allMeetList = [];
				if (data.area && data.area.morningstarts) {
					this.meetStartTime = data.area.morningstarts
					this.meetStartMinute = data.area.morningstarts_minutes
					this.meetEndTime = data.area.eveningends
					this.meetEndMinute = data.area.eveningends_minutes
				}
				let tempStartTime = Number(this.meetStartTime);
				let tempEndTime = Number(data.area.eveningends);
				let allTimeList = [];
				let isFirst = true;
				// console.log('initTimeline enter tempStartTime tempEndTime:',tempStartTime,tempEndTime); 
				while (tempStartTime <= tempEndTime) {
					// 判断当前时间是am还是pm
					let ap = 'am'
					let pmTime = tempStartTime
					let timeTitle = '';
					if (tempStartTime >= 12) {
						ap = 'pm'
						pmTime = tempStartTime - 12
						timeTitle = pmTime.toString().padStart(2, '0') + ':00'
					} else {
						timeTitle = tempStartTime.toString().padStart(2, '0') + ':00'
					}
					let tempMinute = 0;
					timeTitle = timeTitle + ap;
					if (!isFirst) {
						const timestampline = this.getTimestamp(year, month, day, tempStartTime, 30);
						// 判断当前是否时间是否有会议
						if (data.entries && data.entries.length > 0) {
							for (let meet of data.entries) {
								let currentMeet = false;
								let height = 0;
								let meetStartRange = this.formatTime(meet['start_time']);
								let meetEndRange = this.formatTime(meet['end_time']);
								let meetRange = meetStartRange + '-' + meetEndRange;
								// console.log('initTimeline currenMeetStart: start_time:', this.currenMeetStart,meet['start_time']);
								console.log('initTimeline-1 当天会议 timestampline:', timestampline);
								// 当前时间的会议信息
								if (this.currenMeetStart === meet['start_time'] && timestampline === meet['start_time']) {
									currentMeet = true;
									// 计算会议时长是30分钟的几倍
									const diftimestamp = meet['end_time'] - meet['start_time'];
									height = diftimestamp / 1800 * 50;
									allTimeList.push({
										leftTitle: 'ㆍ',
										startTime: meet['start_time'],
										endTime: meet['end_time'],
										isCurrentMeet: true,
										title: meet['name'],
										meetRange: meetRange,
										meetHeight: height,
									})
									isFirst = true;
									break;
									// 时间线绘制	
								} else if (timestampline === meet['start_time']) {
									currentMeet = false;
									const diftimestamp = meet['end_time'] - meet['start_time'];
									height = diftimestamp / 1800 * 50;
									allTimeList.push({
										leftTitle: 'ㆍ',
										startTime: meet['start_time'],
										endTime: meet['end_time'],
										isCurrentMeet: false,
										title: meet['name'],
										meetRange: meetRange,
										meetHeight: height,
									})
									isFirst = true;
									break;
									// 时间线上无会议
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
									isFirst = true;
									break;
								}
							}
							// 时间线上无会议信息
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
					}

					// 当天有会议信息
					if (data.entries && data.entries.length > 0) {
						for (let meet of data.entries) {
							let height = 0;
							let meetStartRange = '';
							meetStartRange = this.formatTime(meet['start_time']);
							let meetEndRange = '';
							meetEndRange = this.formatTime(meet['end_time']);
							let meetRange = meetStartRange + '-' + meetEndRange;
							// console.log('initTimeline 当天会议 currenMeetStart start_time:', this.currenMeetStart, meet[
							// 'start_time']);
							// console.log('initTimeline-2 获取当前时间的timeTitle: 时间戳:', timeTitle, timestampline)
							const timestampline2 = this.getTimestamp(year, month, day, tempStartTime, 0);
							// console.log('timestampline2:',timestampline2);
							// 当前时间上有会议
							if (this.currenMeetStart === meet['start_time'] && timestampline2 === meet['start_time']) {
								currentMeet = true;
								// 计算会议时长是30分钟的几倍 
								const diftimestamp = meet['end_time'] - meet['start_time'];
								height = diftimestamp / 1800 * 50;
								allTimeList.push({
									leftTitle: timeTitle,
									startTime: meet['start_time'],
									endTime: meet['end_time'],
									isCurrentMeet: true,
									title: meet['name'],
									meetRange: meetRange,
									meetHeight: height
								})
								// break;
							}
							// 时间线上会议信息
							else if (timestampline2 === meet['start_time']) {
								const diftimestamp = meet['end_time'] - meet['start_time'];
								height = diftimestamp / 1800 * 50;
								allTimeList.push({
									leftTitle: timeTitle,
									startTime: meet['start_time'],
									endTime: meet['end_time'],
									isCurrentMeet: false,
									title: meet['name'],
									meetRange: meetRange,
									meetHeight: height
								})
								// break;
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
							break;
						}
					}
					// 当天无会议信息
					else {
						console.log('initTimeline当前无会议信息');
						allTimeList.push({
							leftTitle: timeTitle,
							startTime: 0,
							endTime: 0,
							isCurrentMeet: false,
							title: '',
							meetRange: '',
							meetHeight: 0
						})
						isFirst = false;
					}
					tempStartTime += 1
				}
				this.timeRange = allTimeList;
				console.log('initTimeline拼接的会议数据allTimeList：', this.timeRange)
			},

			syncRoom() {
				console.log('syncRoom 进入同步接口');
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
						let data = res.data.data;
						console.log('syncRoom返回数据成功data:', data);
						this.initTimeline(data);
					},
					fail: (e) => {
						console.error(e)
					}
				})
			},
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
		/* position: relative; */
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
		/* height: calc(100%-64rpx); */
		height: 470rpx;
	}

	.meeting-scroll-view {
		width: 250rpx;
		height: 397rpx;
		padding-top: 10rpx;
		/* height: calc(100vw-65rpx); */
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
		/* background-color: red; */
		/* text-align: center;
		line-height: 30rpx; */
	}

	.scroll-item-time {
		font-size: 9rpx;
		color: white;
		width: 50rpx;
		position: absolute;
		left: 8rpx;
		/* font-family: PingFangSC-light; */
		font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
	}

	.scroll-item-right {
		background-color: rgba(255, 255, 255, 0.12);
	}

	.extention-height {
		height: 60rpx;
		width: 172rpx;
		text-align: start;
		margin-left: 13rpx;
		background-color: rgba(255, 255, 255, 0.12);
		position: relative;
	}

	.scroll-item-meeting {
		position: absolute;
		top: 0;
		left: 8rpx;
		/* font-family: PingFangSC-light; */
		font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
	}

	.in-meeting-icon {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		width: 14rpx;
		height: 14rpx;
	}

	.scroll-item-meeting {
		font-size: 9rpx;
		color: white;
		/* text-align: center; */
	}

	.reserve-meeting {
		display: flex;
		flex-direction: column;
		height: 63rpx;
		width: 250rpx;
		border-top: 1rpx solid rgba(230, 241, 252, 0.25);
		/* font-family: PingFangSC-regular; */
		/* background-color: bisque; */
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
		/* background-color: aqua; */
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
		/* font-family: PingFangSC-regular; */
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
	}

	.right-meeting-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100vh;
		background-color: #591BB7;
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
		/* font-family: PingFangSC-regular; */
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;

	}

	.room-number {
		margin-left: 8rpx;
		font-size: 38rpx;
		color: white;
		/* font-family: PingFangSC-regular; */
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;
	}

	.change-language {
		position: fixed;
		top: 14rpx;
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
		/* font-family: PingFangSC-light; */
		font-family: 'Noto Sans CJK SC Light', 'Source Han Sans CN Light', 'Droid Sans Fallback', sans-serif;
		color: white;
	}

	.right-meeting-detail {
		padding: 0;
		margin: 0;
		/* width: 100%; */
		flex: 1;
		flex-direction: column;
		/* background-color: aqua; */
	}

	.meeting-status {
		width: 423rpx;
		/* width: auto; */
		height: 108rpx;
		margin-top: 26rpx;
		margin-left: 37rpx;
		font-size: 80rpx;
		text-align: left;
		color: white;
		/* font-family: PingFangSC-medium; */
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;

		/* box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0,0,0,0.4); */
	}

	.meeting-title-type {
		margin-left: 37rpx;
		height: 37rpx;
	}

	.reverse-title {
		line-height: 23rpx;
		color: rgb(255, 255, 255);
		font-size: 28rpx;
		text-align: left;
		/* font-family: PingFangSC-regular; */
		font-family: 'Noto Sans CJK SC', 'Source Han Sans CN', 'Droid Sans', sans-serif;

	}

	.reverse-time {
		margin-left: 37rpx;
		height: 47rpx;
		line-height: 23rpx;
		color: white;
		font-size: 18rpx;
		text-align: left;
		/* box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0,0,0,0.4); */
		/* font-family: PingFangSC-extraLight; */
		font-family: 'Noto Sans CJK SC ExtraLight', 'Source Han Sans CN ExtraLight', 'Droid Sans Fallback', sans-serif;

	}

	.reverse-person {
		height: 47rpx;
		line-height: 23rpx;
		color: rgb(255, 255, 255);
		font-size: 18rpx;
		text-align: left;
		/* box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0,0,0,0.4); */
		/* font-family: PingFangSC-extraLight; */
		font-family: 'Noto Sans CJK SC ExtraLight', 'Source Han Sans CN ExtraLight', 'Droid Sans Fallback', sans-serif;

	}

	.meeting-msg-icon {
		width: 17rpx;
		height: 17rpx;
	}

	.meeting-msg-title {
		margin-left: 17rpx;
		/* height: 47rpx;
		line-height: 23rpx;
		color: rgb(255,255,255);
		font-size: 28rpx;
		text-align: left;
		font-family: PingFangSC-regular; */
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