/**
 * @author Octene
 * @file 登录相关api
*/

/**@module Login*/

import Request from '@/utils/request.js'

let request = new Request().http

/**
 * @function
 * @author Octene
 * @description 管理员登录
 * @param {String} username 账号
 * @param {String} password 管理员密码
*/
function loginApi(username,password) {
	const query = {
			"username": username,
			"password": password
		}
		
	return request({
		url: "/web/appapi/api.php?act=login",
		data: query, //请求数据
	})
}


/**
 * @function
 * @author Octene
 * @description 登出
*/
function logoutApi() {
	return request({
		url: "/web/call.php?act=logout",
	})
}

export {
	loginApi,
	logoutApi
}