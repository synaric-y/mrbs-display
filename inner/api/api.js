/**
 * @author Octene
 * @file 通用api
*/

/**@module Common*/

import Request from '@/utils/request.js'
import store from '../store/index.js';

let request = new Request().http


/**
 * @function
 * @author Octene
 * @description 测试连通性
 * @param {String} requestURL 被请求的地址前缀，如https://meeting-manage-test.businessconnectchina.com:12443
*/
function testBaseUrl(requestURL){
	return request({
		host: requestURL,
		url: "/web/call.php?act=get_info%2Fget_all_area",
		data: {
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}

/**
 * @function
 * @author Octene
 * @description 数据同步（心跳包），包括区域、房间、全局设置、时间戳等所有信息
 * @param {String} languageSet 语言集，例如zh-CN,zh;q=0.9
 * @example <caption>未激活的回复</caption>
 * {
	"code": -59,
	"msg": "not_activate",
	"data": null
 }
 * @example <caption>激活的回复</caption>
 * 	{
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
 * @example <caption>重复激活</caption>
 * {
	    "code": -49,
	    "msg": "Device has been activated",
	    "data": null
	}
*/
function syncRoomApi(languageSet) {
	return request({
		url: "/web/appapi/api.php?act=sync_room",
		data: {
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		header: {
			'Accept-Language': languageSet
		},
		hideLoading: true //隐藏加载
	})
}


/**
 * @function
 * @author Octene
 * @description 获取所有区域
 * @returns 区域列表
*/
async function getAllAreaApi() {
	return request({
		url: "/web/call.php?act=get_info%2Fget_all_area",
		data: {
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}


/**
 * @function
 * @author Octene
 * @description 获取某个区域下的所有房间
 * @returns 房间列表
*/
function getAllRoomsApi(area_id) {
	
	const query = {
		"type": "area",
		"id": area_id,
	}
	
	return request({
		url: "/web/call.php?act=get_info%2Fget_all_rooms",
		data: {
			...query,
			"is_charge": store.state.batteryInfo.isCharging?1:0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}


export {
	testBaseUrl,
	syncRoomApi,
	getAllAreaApi,
	getAllRoomsApi,
}