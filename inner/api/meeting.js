/**
 * @author Octene
 * @file 会议相关api
*/

/**@module Meeting*/

import Request from '@/utils/request.js'
import store from '../store/index.js';
import i18n from '@/src/i18n.js';

let request = new Request().http


/**
 * @private
 * @function
 * @author Octene
 * @description 新版快速预约，获取二维码
*/
function wxOauth2Url(data) {
    return request({
        url: '/web/wxwork_login_url.php',
		data: {
			...data
		}
    })
}


/**
 * @deprecated
 * @private
 * @function
 * @author Octene
 * @description 旧版快速预约
*/
function quickMeetingApi(data) {
	return request({
		url: "/web/appapi/api.php?act=book_fast_meeting",
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charge": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		}
	})
}

/**
 * @private
 * @function
 * @author Octene
 * @description 取消会议
*/
function cancelMeetingApi(data) {
	return request({
		url: "/web/appapi/api.php?act=cancel_fast_meeting",
		data: {
			...data
		}
	})
}

/**
 * @private
 * @function
 * @author Octene
 * @description 提前结束会议
*/
function forceEndMeetingApi(data) {
    return request({
        url: '/web/call.php?act=entry%2Fforce_end_entry',
		data: {
			...data
		}
    })
}


// ==================================包装函数====================================

/**
 * @function
 * @author Octene
 * @description 获取新版预约二维码
 * @param {Number} area_id 区域id
 * @param {Number} room_id 房间id
*/
function wrappedGetQRCode(area_id,room_id){
	const query = {
		"area_id": area_id,
		"room_id": room_id,
	}
	
	return new Promise((resolve,reject)=>{
		wxOauth2Url(query)
			.then((res)=>{
				resolve(res)
			})
			.catch((e)=>{
				reject(e)
			})
	})
}

/**
 * @deprecated 平板端现需使用企业微信扫码认证才能预约会议
 * @function
 * @author Octene
 * @description 根据起止时间、主题、预订人预约快速会议（旧版）
 * @param {Number} begin_time 开始时间，s
 * @param {Number} end_time 结束时间，s
 * @param {String} booker 预订人
 * @param {String} theme 会议主题
*/
function wrappedQuickMeeting(begin_time,end_time,booker,theme){
	function testNumber(val){ // 判断是否为纯数字
		const str = /^[0-9]+$/
		const reg = new RegExp(str)
		return reg.test(val)
	}
	
	const query = {
		"begin_time": begin_time,
		"end_time": end_time,
		"booker": testNumber(booker)?('"'+booker+'"'):booker,
		"theme": testNumber(theme)?('"'+theme+'"'):theme
	}
	
	return new Promise((resolve,reject)=>{
		quickMeetingApi(query)
			.then((res)=>{
				resolve(res)
			})
			.catch((e)=>{
				reject(e)
			})
	})
}

/**
 * @function
 * @author Octene
 * @description 取消特定id的会议，注意只能取消平板端预约的快速会议
 * @param {Number} meeting_id 会议id
*/
function wrappedCancelMeetingApi(meeting_id){
	const query = {
		"meeting_id": meeting_id,
	}
	
	return new Promise((resolve,reject)=>{
		cancelMeetingApi(query)
			.then(res => {
				console.log(res)
				uni.showToast({
					title: i18n.global.t('message.index.left.success'),
					icon: 'none'
				})
				resolve()
			})
			.catch((e) => {
				console.log(e);
				uni.showToast({
					title:i18n.global.t('message.index.left.fail'),
					icon: 'none'
				})
				reject()
			})
	})
}

/**
 * @function
 * @author Octene
 * @description 提前结束特定id的会议，注意只能提前结束平板端预约的快速会议
 * @param {Number} id 会议id
*/
function wrappedForceEndMeetingApi(id){
	const query = {
		"id": id,
	}
	
	return new Promise((resolve,reject)=>{
		forceEndMeetingApi(query)
			.then(res => {
				console.log(res)
				uni.showToast({
					title: i18n.global.t('message.index.left.success'),
					icon: 'none'
				})
				resolve()
			})
			.catch((e) => {
				console.log(e);
				uni.showToast({
					title: i18n.global.t('message.index.left.fail'),
					icon: 'none'
				})
				reject()
			})
	})
}

export {
	wrappedGetQRCode,
	wrappedQuickMeeting,
	wrappedCancelMeetingApi,
	wrappedForceEndMeetingApi
}