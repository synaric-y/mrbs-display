/**
 * @author Octene
 * @file 设备操作相关api
 */

/**@module Device*/

import Request from '@/utils/request.js'
import store from '../store/index.js';

let request = new Request().http

/**
 * @function
 * @author Octene
 * @description 激活设备
 * @param {Number} screenWidth 屏幕宽度，像素
 * @param {Number} screenHeight 屏幕高度，像素
 * @param {Number} room_id 房间id
 */
function activateDeviceApi(screenWidth,screenHeight,room_id) {

	const query = {
		// "version": "1.0.0", //设备使用的软件版本？激活时是否直接使用全局的软件版本，还是由前端传入
		"description": "", //设备信息
		"resolution": `${screenWidth}*${screenHeight}`, //分辨率
		"status": 1, //是否在线
		"is_set": 0, //是否绑定
		"set_time": Math.trunc(new Date().getTime() / 1000), //绑定时间（时间戳）
		"room_id": room_id //绑定的房间号，数据库中的房间号
	}
	return request({
		url: "/web/appapi/api.php?act=activate_device",
		data: {
			...query,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charge": store.state.batteryInfo.isCharging ? 1 : 0,
			"battery_level": store.state.batteryInfo.level,
		},
	})
}

/**
 * @function
 * @author Octene
 * @description 设备换绑
 * @param {Number} room_id 房间id
 */
async function changeBindApi(room_id) {
	const query = {
		"room_id": room_id
	}
	return request({
		url: "/web/appapi/api.php?act=change_bind",
		data: {
			...query,
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging ? 1 : 0,
			"battery_level": store.state.batteryInfo.level,
		},
	})
}

/**
 * @function
 * @author Octene
 * @description 获取设置
 */
function getSettingApi() {
	return request({
		url: "/web/appapi/api.php?act=get_setting",
		data: {
			'device_id': store.state.deviceInfo.deviceId,
			"is_charging": store.state.batteryInfo.isCharging ? 1 : 0,
			"battery_level": store.state.batteryInfo.level,
		},
		hideLoading: true //隐藏加载
	})
}

export {
	activateDeviceApi,
	changeBindApi,
	getSettingApi
}