<template>

	<div class="container" id="app">
		<ActivateView v-if="activateViewShow" @close="activateViewShow=false" @activateSuccess="startSync" />
		<LoginView v-if="loginViewShow" @close="loginViewShow=false"
			@success="()=>{loginViewShow=false;settingViewShow=true}" />
		<SettingView v-if="settingViewShow" @close="settingViewShow=false" />

		<div class="left-time-view">
			<!-- 会议时间列表 -->
			<view class="meeting-time">
				<view :class="temporary_meeting?'meeting-scroll-short':'meeting-scroll'">
					<scroll-view scroll-y="true" class="meeting-scroll-view">
						<div class="meeting-wrapper">
							<div class="left">
								<div class="hm" v-for="(item,index) in hourList" :key="index">
									{{ item.text }}
								</div>
							</div>
							<div class="right">
								<div class="meeting-item" :id="'meeting-'+item.id" v-for="(item,index) in meetingList"
									:key="item.id"
									:style="{top: calculateY(item.start_time)+'rpx', height: calculateHeight(item.start_time,item.end_time)+'rpx' }"
									@longpress="prepareCancelQuickMeet(item)"
									@touchmove="enableCancel=false"
									@touchend="enableCancel=true">
									<div :class="'meeting '+item.className">
										<text class="meeting-theme">
											{{ item.name || $t('message.index.left.default_name') }}
										</text>
										<text class="meeting-span">
											{{ tsHourMinuteFormat(item.start_time) +' - '+ tsHourMinuteFormat(item.end_time)}}
										</text>
									</div>
									<image @click="prepareForceEndEntry(item)" v-if="displayStatus=='in-progress'&&item.id==meetingInDisplay.id"
										class="in-meeting-icon" src="@/static/in-meeting.png" mode="aspectFit">
									</image>
								</div>
							</div>
						</div>
					</scroll-view>
				</view>
			</view>
			<!-- 预约会议按钮 -->
			<view class="reserve-meeting" v-if="temporary_meeting">
				<!-- <view class="reserve-title">{{$t('message.quickMeeting')}}</view> -->
				<div class="reserve-title"></div>
				<view :class="[hasTimeInCurrentAvaliable?'reserve-button reserve-button-free':'reserve-button']"
					@click="prepareQuickMeet(hasTimeInCurrentAvaliable)">
					{{$t('message.index.left.book')}}
				</view>
				<!-- 预约会议对话框 -->
				<FastMeetingDialog v-if="showQuickMeeting" @close="showQuickMeeting=false" @success="quickMeetingSuccess" @fail="quickMeetingFail"
					:currentTime="serverTime ?? Math.trunc(new Date().getTime()/1000)" :areaLb="lb" :areaUb="ub"
					:meetings="meetingList ?? []" :avaliableHours="avaliableHours" :scale="scale" />
			</view>
		</div>

		<!-- 右侧信息 -->
		<div
			:class="(displayStatus=='in-progress')?('right-meeting-info right-meeting-info-busy right-meeting-info-busy'+(currentTheme === 'dark' ? '-dark' : '' )):('right-meeting-info right-meeting-info'+(currentTheme === 'dark' ? '-dark' : '' ))">

			<!-- 电量  -->
			<div class="battery">
				<BatteryShow />
			</div>
			<!-- 会议室、时间、语言  -->
			<div class="header">
				<div class="header-left">
					<div class="room-title">{{$t('message.index.right.meeting')}}</div>
					<div class="room-number">
						{{roomName ?? 'A'}}
					</div>
				</div>
				<div class="header-right">
					<view class="change-language">
						<LanguageSelect @update="changeLang" />
					</view>
					<uni-icons type="gear" @click="prepareSetting" color="#ffffff" size="35"></uni-icons>
				</div>
			</div>
			<view class="current-time">{{nowlanguageTime}}</view>

			<!-- 会议信息 -->
			<view class="right-meeting-detail">

				<!-- 空闲中|会议中 -->
				<view class="meeting-status">
					{{displayStatus=='in-progress'?$t('message.index.right.in_meeting'):$t('message.index.right.no_meeting')}}
				</view>

				<!-- 即将开始的会议 -->
				<div class="nextMeet" v-if="displayStatus!='in-progress'">{{ $t('message.index.right.next_meeting') }}
				</div>


				<!-- 预订人、标题、时间 -->
				<view class="meeting-detail-item">
					<image class="meeting-detail-item-icon" src="@/static/meeting-msg.png" mode=""></image>
<!-- 					<div style="width: 70%;background-color: transparent;">
						<ocMarquee :class="{
								'meeting-title':true,
								'meeting-title-small':(show_meeting_name&&(!(meetingInDisplay?.name)))
							}" style="font-size: 22rpx; font-weight: 500;" v-if="!initializing" :marqueeId="1" :text="(show_meeting_name&&(meetingInDisplay?.name ?? '-')) || $t('message.index.right.default_name')" />
					</div> -->
					<text
						:class="{
							'meeting-title':true,
							'meeting-title-small':(show_meeting_name&&(!(meetingInDisplay?.name)))
						}">{{ (show_meeting_name&&(meetingInDisplay?.name ?? '-')) || $t('message.index.right.default_name') }}</text>
				</view>
				<view class="meeting-detail-item">
					<image class="meeting-detail-item-icon" src="@/static/reverse-time.png" mode=""></image>
					
					<text
						class="meeting-detail-item-desc">{{ meetingInDisplay ?(tsHourMinuteFormat(meetingInDisplay.start_time) +' - '+ tsHourMinuteFormat(meetingInDisplay.end_time)):'-'}}</text>
				</view>
				<view class="meeting-detail-item">
					<image class="meeting-detail-item-icon" src="@/static/reverse-person.png" mode=""></image>
<!-- 					<div style="width: 70%;background-color: transparent;">
						<ocMarquee style="font-size: 14rpx;font-weight: normal;" v-if="!initializing" :marqueeId="2" :text="(show_book&&(meetingInDisplay?.book_by ?? '-')) || $t('message.index.right.default_booker')" />
					</div> -->
					<text
						class="meeting-detail-item-desc">{{ (show_book&&(meetingInDisplay?.book_by ?? '-')) || $t('message.index.right.default_booker')}}</text>
				</view>
			</view>

			<!-- logo -->
			<view class="right-meeting-logo">
				<image class="company-logo" src="@/static/bcc-logo-en.png" mode="aspectFit"></image>
			</view>
		</div>
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog type="warn" :cancelText="$t('message.index.right.cancel')"
				:confirmText="$t('message.index.right.confirm')" :title="$t('message.index.right.notice')"
				:content="$t('message.index.right.update')" @confirm="restart" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popupUnbind" type="dialog">
			<uni-popup-dialog type="warn" :cancelText="$t('message.index.right.cancel')"
				:confirmText="$t('message.index.right.confirm')" :title="$t('message.index.right.notice')"
				:content="$t('message.index.right.unbind')" @confirm="unbindRestart()" @close="unbindClose()"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popupCancelQuickMeet" type="dialog">
			<uni-popup-dialog type="warn" :cancelText="$t('message.index.left.cancel')"
				:confirmText="$t('message.index.left.confirm')" :title="$t('message.index.left.notice')"
				:content="$t('message.index.left.cancel_tip')" @confirm="cancelQuickMeet()"
				@close="popupCancelQuickMeetClose()"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popupForceEndQuickMeet" type="dialog">
			<uni-popup-dialog type="warn" :cancelText="$t('message.index.left.cancel')"
				:confirmText="$t('message.index.left.confirm')" :title="$t('message.index.left.notice')"
				:content="$t('message.index.left.force_end_tip')" @confirm="forceEndQuickMeet()"
				@close="popupForceEndQuickMeetClose()"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popupQRCode">
			<div class="qrcode-container" @click="popupQRCodeClose()">
				<div class="qrcode-bg" @click.stop="()=>{}">
					<uni-icons class="icon" type="closeempty" size="30" color="#666" @click="popupQRCodeClose()"></uni-icons>

					<div style="width: 300px;height: 300px" id="qrcode"></div>
					<div class="text">{{ $t('message.scan_meeting.line1') }}</div>
					<div class="text">{{ $t('message.scan_meeting.line2') }}</div>
				</div>
			</div>
		</uni-popup>
	</div>

</template>


<script>
	import moment from 'moment-timezone';
	import AraleQRCode from 'arale-qrcode'
	import { datetimeFormatTzLocale,localHourToTs,localHourList,localTsToHour } from '@/utils/tzDateTimeFormat.js' 
	import {
		nextScaleTs,
	} from '@/utils/timestampTool.js'
	import { SEC_PER_MINUTE } from '@/constants/time.js';
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
	import ocMarquee from '../../components/oc-marquee.vue';
	import {
		syncRoomApi
	} from '@/api/api.js'
	import { wrappedCancelMeetingApi,wrappedGetQRCode,wrappedForceEndMeetingApi } from '@/api/meeting';
	import {
		Decimal
	} from 'decimal.js';
	import {
		PageMixin
	} from '@/mixin/index.js'
	import {
		PAD_QUICK_MEETING_TYPE,
		TEMPORARY_MEETING_NONE,
		TEMPORARY_MEETING_LEGACY,
		TEMPORARY_MEETING_VERIFIED
	} from '@/constants/meeting.js'

	import _ from 'lodash'; // lodash，用于数组运算

	const heightPerBlock = 30 // 每15分钟rpx


	export default {
		name: 'App',
		interval: null,
		mixins: [PageMixin],
		components: {
			FastMeetingDialog,
			SettingView,
			LanguageSelect,
			BatteryShow,
			LoginView,
			ActivateView,
			ocMarquee
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
		unmounted(){
			console.log('组件销毁');
			
			// 清空旧的定时器
			if(this.autoCloseTimer){ 
				clearTimeout(this.autoCloseTimer)
				this.autoCloseTimer = null
			}
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
					const min10 = SEC_PER_MINUTE * 10
					const min15 = SEC_PER_MINUTE * 15
					const min60 = SEC_PER_MINUTE * 60
					const min90 = SEC_PER_MINUTE * 90

					const diff = endTs - startTs

					let res = ''

					if (diff <= min10) res = 'none' // 小于10分钟，不显示任何东西
					else if (diff <= min15) res = 'min15'
					else if (diff <= min60) res = 'min60'
					else res = 'min90'

					// console.log(res);

					return res
				}
			},
			tsHourMinuteFormat() {
				return (ts) => {
					return localTsToHour(ts, this.timezone, this.currentTimeFormat == '12' ? true : false);
				}
			},
			hasTimeInCurrentAvaliable() { // 下一个15分钟(scale)在不在区域可用时间内
				// return true
				const next15 = nextScaleTs(this.serverTime, this.scale * SEC_PER_MINUTE)
				return (this.serverTime && (this.lb<=next15) && (next15<=this.ub))
			},
			nowlanguageTime() {
				return datetimeFormatTzLocale(this.serverTime, this.timezone, this.$i18n.locale, this.currentTimeFormat == '12' ? true : false)
			}
		},
		data() {
			return {
				initializing: true, // 正在初始化
				autoCloseTimer: null, // 自动关闭弹窗定时器
				
				activateViewShow: false, // 激活页面弹窗
				loginViewShow: false, // 登录页面弹窗
				settingViewShow: false, // 设置页面弹窗
				showQuickMeeting: false, // 快速会议弹窗

				popupCancelQuickMeet: false, // 取消会议对话框
				toCancelId: null, // 待取消会议的id
				enableCancel: true, // 能触发长按，如果滑动就不要触发长按了

				avaliableHours: 1, // 可预约一小时内的时间
				lb: 8, // 会议室开始时间
				ub: 21, // 会议室结束时间
				hourList: [], // 左侧会议列表时间轴
				meetingList: [], // 所有会议
				meetingInDisplay: null, // 正在显示的会议
				displayStatus: 'none', // 会议状态：none无会议 in-progress进行中 to-start待开始
				serverTime: new Date().getTime() / 1000, // 服务器时间（s）
				roomName: '', // 房间名
				
				area_id: '', // 区域id
				room_id: '', // 房间id

				timezone: 'Asia/Shanghai',
				languageSet: 'zh-CN,zh;q=0.9',

				show_book: false, // 显示预定人
				show_meeting_name: false, // 显示会议主题
				temporary_meeting: false, // 显示快速会议按钮
				
				temporary_meeting_verified: false, // 快速会议是否需要验证
				
				// resolution: 1800, // 最小预约间隔（s）
				scale: 15, // 最小预约间隔（min）
				inner_address: '', // 内核网页地址（默认）

				cancelUpdate: false, // 用户在这次运行中是否取消过更新
				cancelUnbindRestart: false // 用户在这次运行中是否取消过解绑的重启(为true时不弹出对话框，但是每2min会变为false，再弹)
			}
		},
		onLoad() {
			
			// 获取是否为第一次打开（无请求地址）
			if(!this.currentBaseURL){
				this.activateViewShow = true // 打开激活页面
				return
			}
			

			// 获取是否激活（尝试调一下syncRoom接口），需要等电量和设备信息传过来才行，等待5秒
			this.initializing = true
			uni.showLoading({
				title: this.$t('message.initializing')
			})
			setTimeout(() => {
				syncRoomApi(this.languageSet)
				.then(res => {
					console.log(JSON.stringify(res));
					let data = res.data.data;
					let code = res.data.code
					this.initializing = false
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
					this.initializing = false
					uni.hideLoading()
					console.error(JSON.stringify(e))
					// this.activateViewShow = true // 打开激活页面
					uni.showToast({
						title: this.$t('message.netDataError'),
						icon: 'none'
					})
				})
			}, 5000)

		},
		methods: {
			test() {
				console.log('ssss');
			},
			autoCloseRefresh(){
				
				console.log('刷新定时器');
				
				// 清空旧的定时器
				if(this.autoCloseTimer){ 
					clearTimeout(this.autoCloseTimer)
					this.autoCloseTimer = null
				}
				
				// 开启新的定时器
				this.autoCloseTimer = setTimeout(()=>{
					this.popupQRCodeClose() // 关闭扫码弹窗
				},30*1000) // 30s自动关闭
			},
			// 获取当前或下一次会议
			getNowOrNextMeeting(entries, ts) {

				const currentMeeting = _.find(entries, item => {
					return ts < item.end_time
				});

				if (currentMeeting == undefined) { // 找不到会议
					this.meetingInDisplay = null
					this.displayStatus = 'none'
				} else if (ts >= currentMeeting.start_time) { // 进行中
					this.meetingInDisplay = currentMeeting
					this.displayStatus = 'in-progress'
				} else { // 待开始
					this.meetingInDisplay = currentMeeting
					this.displayStatus = 'to-start'
				}

				// console.log(currentMeeting,ts,this.displayStatus);

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
			stopSync(){
				// 清除定时器
				this.interval && clearInterval(this.interval)
				this.interval = null
			},
			changeLang(index) { // 更改语言，时区不变
				const locale = this.$i18n.locale
				this.languageSet = languageSetMapping[locale]

				this.syncRoom()
			},

			syncRoom() {
				syncRoomApi(this.languageSet)
				.then(({data}) => {
					console.log(data);
					let {
						code,
						data:allData
					} = data;
					
					// 未激活
					if (code == -59){
						// 暂停同步
						this.stopSync()
						
						// 打开激活页面
						this.activateViewShow = true 
					}
					
					// 检查是否解绑
					if(code == -60){
						
						if(this.cancelUnbindRestart){ // 取消重启，只弹小提示
							uni.showToast({
								title: this.$t('message.index.right.unbind_error'),
								icon: 'none'
							})
						}
						else{ // 弹对话框
						
							// 暂停同步
							this.stopSync()
							
							// 确认弹窗
							this.$refs.popupUnbind.open()
						}
						
						
						return
					}


					// 离线
					if (allData == null) { 
						this.changeStatus('offline')
						uni.showToast({
							title: this.$t('message.netDataError'),
							icon: 'none'
						})
						return;
					}

					this.changeStatus('online') // 在线

					const {
						now_timestamp,
						area,
						room,
						entries,
						global_config
					} = allData
					
					const {
						timezone,
						resolution,
						morningstarts,
						eveningends
					} = area
					
					const {
						room_name,
						show_meeting_name,
						temporary_meeting,
						show_book
					} = room
					
					const {
						inner_address,
						time_type,
						theme_type
					} = global_config
					
					// console.log(area,room);

					this.room_id = room.id
					this.area_id = area.id
					
					this.timezone = timezone // 区域时区
					this.changeTimezone(timezone) // 全局缓存时区
					
					this.roomName = room_name // 房间名
					// this.resolution = area.resolution // 最小会议时间
					this.scale = resolution / SEC_PER_MINUTE // 最小会议时间
					this.serverTime = now_timestamp // 服务器时间(s)
					this.lb = localHourToTs(now_timestamp, timezone, morningstarts ?? 8) // 区域开始时间
					this.ub = localHourToTs(now_timestamp, timezone, eveningends ?? 21) // 区域结束时间
					this.show_book = (show_book == 1) ?? false // 预定人显示
					this.show_meeting_name = (show_meeting_name == 1) ?? false // 会议主题显示
					this.temporary_meeting = (temporary_meeting == TEMPORARY_MEETING_LEGACY || temporary_meeting == TEMPORARY_MEETING_VERIFIED) ?? false // 快速会议按钮显示
					this.temporary_meeting_verified = (temporary_meeting == TEMPORARY_MEETING_VERIFIED) ?? false // 快速会议是否验证
					
					this.changeTimeFormat(time_type == 12 ? "12" : "24") // 时间格式
					
					this.changeTheme(theme_type == 0 ? 'default' : 'dark' ) // 主题
					
					this.inner_address = inner_address ?? '' // 内核网页最新地址
					
					const regexStr = /[\d]+(\.[\d]+)+/
					const version = inner_address.match(regexStr)[0]
					console.log(version);
					
					this.changeVersion(version)

					// 检查更新
					if((!this.cancelUpdate) && (this.inner_address) && window.location.href != this.inner_address){ // 需要更新且用户没有取消过更新
						// 暂停同步
						this.stopSync()
						
						// 确认弹窗
						this.$refs.popup.open()
					}


					


					// 左侧时间轴同步
					this.hourList = localHourList(this.lb, this.ub, this.timezone, this.currentTimeFormat == '12' ? true : false);

					
					_.forEach(entries, item => {

						// 处理字符串
						const name = item.name + '' // 转字符串
						item.name = name.replace(/^"*|"*$/g, ''); // 替换双引号
						
						// 处理类名
						item.className = this.meetingClass(item.start_time,item.end_time)
					})
					
					

					// 寻找当前会议或下一次会议
					this.getNowOrNextMeeting(entries, this.serverTime)

					// 会议列表赋值
					this.meetingList = entries
					// console.log(this.meetingList);

				}).catch(e => {
					console.error(e)
				})
			},
			prepareSetting() { // 预先请求一下，成功则跳过登录
			
				this.loginViewShow = true
			},
			prepareQuickMeet(opt) {
				if (opt) {
					
					// this.pendingShowQRCode()
					// return
					
					if(this.temporary_meeting_verified){
						this.pendingShowQRCode()
					}else{
						this.showQuickMeeting = true;
					}
					
					
				} else {
					uni.showToast({
						title: this.$t('message.index.left.no_free'),
						icon: 'none'
					})
				}
			},
			pendingShowQRCode() {
				
			  this.autoCloseRefresh() // 开启定时器
			  console.log(this.autoCloseTimer);
				
			  this.$refs.popupQRCode.open()
			  
			  const that = this
			  
			  console.log(this.area_id,this.room_id);
			  
			  wrappedGetQRCode(this.area_id,this.room_id).then(({data})=>{
				  console.log(data);
				  
				  that.$nextTick(() => {
				    const codeFigure = new AraleQRCode({
				      "render": "svg", // 生成的类型 'svg' or 'table'
				      "text": data, // 需要生成二维码的链接
				      "size": 300 // 生成二维码大小
				    });
				    const qrcodeContainer = document.querySelector('#qrcode')
				    while (qrcodeContainer.firstChild) { // 移除所有子元素
				      qrcodeContainer.removeChild(qrcodeContainer.firstChild);
				    }
				    qrcodeContainer.appendChild(codeFigure); // 增加新的子元素
				  })
			  }).catch(e=>{
				  console.log(e);
				  uni.showToast({
				  	title: this.$t('message.netDataError'),
				  	icon: 'none'
				  })
			  })
			  

			},
			popupQRCodeClose(){
				this.$refs.popupQRCode.close()
			},
			quickMeetingSuccess(){
				uni.showToast({
					title: this.$t('message.fast_meeting.success'),
					icon: 'none',
					duration: 2000
				})
				this.showQuickMeeting = false;
			},
			quickMeetingFail(){
				uni.showToast({
					title: this.$t('message.fast_meeting.fail'),
					icon: 'none',
					duration: 2000
				})
				this.showQuickMeeting = false;
			},
			prepareCancelQuickMeet(item) {
				
				if(!this.enableCancel) return // 滑动则不要触发此事件
				
				const {
					id,
					entry_type:type,
					start_time,
					end_time
				} = item
				
				if(!(this.serverTime<start_time && this.serverTime<end_time)){
					uni.showToast({
						title: this.$t('message.index.left.invalid_time'),
						icon: 'none'
					})
					return
				}
				
				if (type != PAD_QUICK_MEETING_TYPE) {
					uni.showToast({
						title: this.$t('message.index.left.invalid_type'),
						icon: 'none'
					})
					return
				}

				this.toCancelId = id // 准备删除的会议id
				this.$refs.popupCancelQuickMeet.open()
			},
			cancelQuickMeet() {
				wrappedCancelMeetingApi(this.toCancelId)
				.finally(()=>{
					this.syncRoom() // 手动刷新
					this.popupCancelQuickMeetClose()
				})
			},
			prepareForceEndEntry(item){
				if(!this.enableCancel) return // 滑动则不要触发此事件
				
				const {
					id,
					entry_type:type,
					start_time,
					end_time
				} = item
				
				// 检查是否为进行中会议
				if(!(this.serverTime>=start_time && this.serverTime<end_time)){
					uni.showToast({
						title: this.$t('message.index.left.invalid_time'),
						icon: 'none'
					})
					return
				}
				
				// 检查是否为平板端快速会议
				if (type != PAD_QUICK_MEETING_TYPE) {
					uni.showToast({
						title: this.$t('message.index.left.invalid_type'),
						icon: 'none'
					})
					return
				}
				
				
				this.toCancelId = id // 准备删除的会议id
				this.$refs.popupForceEndQuickMeet.open()
				
			},
			forceEndQuickMeet(){
				wrappedForceEndMeetingApi(this.toCancelId)
				.finally(()=>{
					this.syncRoom() // 手动刷新
					this.popupForceEndQuickMeetClose()
				})
			},
			popupForceEndQuickMeetClose(){
				this.$refs.popupForceEndQuickMeet.close()
			},
			popupCancelQuickMeetClose(){
				this.$refs.popupCancelQuickMeet.close()
			},
			dialogClose() { // 用户取消更新，打标记，再次启动定时器
				console.log(487);
				this.$refs.popup.close()
				this.cancelUpdate = true
				this.startSync()
				console.log(490);
			},
			unbindClose(){ // 用户取消重启，打标记，再次启动定时器
				console.log('取消重启');
				this.$refs.popupUnbind.close()
				
				this.cancelUnbindRestart=true
				this.startSync()
				
				const that = this
				setTimeout(()=>{
					that.cancelUnbindRestart=false
				},2*60*1000); // 2分钟后这个变为false，对话框又会弹出来
			},
			unbindRestart(){ // 用户确认重启
				this.$refs.popupUnbind.close()
				console.log('确认重启');
				uni.webView.postMessage({
					data: {
						type: 'restart'
					}
				}, '*');
			},
			restart() { // 用户确认更新，刷新内核的localStorage，发送重启指令
				console.log(494);
				// this.changeInnerAddress(this.inner_address)
				this.$refs.popup.close()

				console.log(495);
				uni.webView.postMessage({
					data: {
						type: 'updateWvURL',
						value: this.inner_address
					}
				}, '*');
			},
		},
		onUnload() {
			this.stopSync()
		}
	}
</script>

<style lang="scss" scoped>
	/*去除scroll-view默认的滚动条，但是还能滚动*/
	::v-deep .uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
		display: none;
	}
	
	/* 对话框按钮主颜色 */
	::v-deep .uni-button-color{
		color: var(--color-primary);
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
			flex-direction: column;
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
					height: 100vh;
					// height: 470rpx;
				}

				.meeting-scroll-short {
					width: 250rpx;
					height: calc(100vh - 63rpx);
				}

				.meeting-scroll-view {
					width: 250rpx;
					height: 100%;
					// height: 377rpx;


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

							.meeting-item {
								position: absolute;
								top: 0;
								left: 0;
								height: 60rpx;
								width: 100%;
								padding: 4rpx 8rpx;
								// background-color: rgba(255, 255, 255, 0.12);
								background-color: #4c4c4c;
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

									.meeting-theme,
									.meeting-span {
										line-height: 1.5;
									}
								}
								
								.none{
									.meeting-theme {
										display: none;
									}
									
									.meeting-span {
										display: none;
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
				flex-shrink: 0;
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
				line-height: 3;
				font-size: 14rpx;
				font-style: italic;
			}



			.meeting-detail-item {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 10rpx;
				margin-bottom: 10rpx;
				font-style: italic;
				height: 28rpx;

				.meeting-detail-item-icon {
					width: 17rpx;
					height: 17rpx;
				}

				.meeting-detail-item-desc,
				
				.meeting-title {
					padding-right: 5rpx;
					text-align: left;
					word-break: break-all;
					display: -webkit-box;
					overflow: hidden;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
					text-overflow: ellipsis;
				}

				.meeting-detail-item-desc {
					font-size: 14rpx;
					width: 75%;
				}

				.meeting-title {
					font-size: 22rpx;
					// width: 75%;
					font-weight: 500;
				}
				
				.meeting-title-small{
					font-size: 14rpx!important;
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
	
	.qrcode-container{
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.qrcode-bg{
			width: 80%;
			height: 80%;
			background-color: #fff;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			border-radius: 8rpx;
			box-shadow: 0 4rpx 10rpx 2rpx rgba(0, 0, 0, 0.15);
			position: relative;
			
			.icon{
				position: absolute;
				top: 5rpx;
				right: 10rpx;
			}
			
			#qrcode{
				margin-bottom: 30rpx;
			}
			
			.text{
				font-size: 14rpx;
				line-height: 2;
			}
		}
	}
	
</style>