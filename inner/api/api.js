import Request from '@/utils/request.js'
import store from '../store/index.js';
let request = new Request().http

function quickMeetApi(host, data, header) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=book_fast_meeting",
		method: "POST", //请求方式
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charge": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		header: header // 请求头
	})
}

function cancelMeetingApi(host, data, header) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=cancel_fast_meeting",
		method: "POST", //请求方式
		data: {
			...data
		},
		header: header // 请求头
	})
}

function forceEndMeetingApi(host, data) {
    return request({
		host: host,
        url: '/web/call.php?act=entry%2Fforce_end_entry',
		method: "POST",
		data: {
			...data
		}
    })
}

function wxOauth2Url(host, data) {
    return request({
		host: host,
        url: '/web/wxwork_login_url.php',
        method: 'POST',
		data: {
			...data
		}
    })
}


/**
 *  心跳包
 * 
 *  未激活的回复：
 *  {
		"code": -59,
		"msg": "not_activate",
		"data": null
	}
	激活的回复：
	{
	    "code": 0,
	    "msg": "success",
	    "data": {
	        "now_time": "01:17PM",
	        "now_timestamp": 1729142270,
	        "display_day": "Thursday, October 17, 2024",
	        "area": null,
	        "now_entry": null,
	        "entries": [],
	        "room": null
	    }
	}
	重复激活：
	{
	    "code": -49,
	    "msg": "Device has been activated",
	    "data": null
	}
 */
function syncRoomApi(host, data, header) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=sync_room",
		method: "POST", //请求方式
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		header: header, // 请求头
		hideLoading: true //隐藏加载
	})
}

async function getAllAreaApi(host, data) {
	return request({
		host: host,
		url: "/web/call.php?act=get_info%2Fget_all_area",
		method: "POST", //请求方式
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}

function getAllRoomsApi(host, data) {
	return request({
		host: host,
		url: "/web/call.php?act=get_info%2Fget_all_rooms",
		method: "POST", //请求方式
		data: {
			...data,
			"is_charge": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}

function activateDeviceApi(host, data) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=activate_device",
		method: "POST", //请求方式
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charge": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
	})
}

async function changeBindApi(host, data) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=change_bind",
		method: "POST", //请求方式
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
	})
}

function loginApi(host, data) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=login",
		method: "POST", //请求方式
		data: data, //请求数据
	})
}

function logoutApi(host) {
	return request({
		host: host,
		url: "/web/call.php?act=logout",
		method: "POST", //请求方式
	})
}

/**
 * {
    "code": 0,
    "msg": "success",
    "data": {
        "room": "TestB",
        "area": "shanghai",
        "is_set": "0"
    }
}
 * 
*/
function getSettingApi(host, data) {
	return request({
		host: host,
		url: "/web/appapi/api.php?act=get_setting",
		method: "POST", //请求方式
		data: {
			...data,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}

const quickMeetMessageMapping = {
	'-1': 'message.noRoom',
	'-2': 'message.noFreeRoom',
	'0': 'message.createMeetSuccess'
}

export {
	quickMeetApi,
	cancelMeetingApi,
	forceEndMeetingApi,
	wxOauth2Url,
	syncRoomApi,
	quickMeetMessageMapping,
	getAllAreaApi,
	getAllRoomsApi,
	activateDeviceApi,
	changeBindApi,
	getSettingApi,
	loginApi,
	logoutApi
}