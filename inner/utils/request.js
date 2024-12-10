// import {
// 	HOST
// } from '@/modules/config.js'

import store from '@/store/index.js'
import i18n from '@/src/i18n.js';
import RequestManager from '@/utils/requestManager.js' 
const manager = new RequestManager() //创建请求管理表


export default class Request {
	/**
	 * @class
	 * @classdesc 创建一个请求实例，并发送uni请求
	 * @param {Object} param 构造参数
	 * @param {String} [param.host=store.state.baseURL] 请求地址前缀，如无，默认使用vue-store里面存储的请求地址
	 * @param {String} param.url 请求的具体接口
	 * @param {String} [param.method=POST] 请求方法，GET|POST，默认为POST
	 * @param {Object} [param.data={}] POST携带的body对象，默认为空
	 * @param {String} [param.token=''] token，默认为空
	 * @param {Object} [param.header={}] 请求头, 默认为空（最后会默认添加一项 'content-type': "application/json"）
	 * @param {Boolean} [param.hideLoading=false] 隐藏加载圈，默认为false，即不隐藏
	*/
    http(param) {
        // 请求参数
        var host = param.host || store.state.baseURL,
			url = param.url,
            method = param.method || "POST",
            data = param.data || {},
            token = param.token || "",
			header = {'content-type': "application/json", ...param.header},
            hideLoading = param.hideLoading || false;

		// console.log(param.url);
		// console.log(param.data);
        //拼接完整请求地址
        var requestUrl = host + url;
       //拼接完整请求地址（根据环境切换）
       // var requestUrl = operate.api() + url;

        // 请求方式:GET或POST
        // if (method) {
        //     method = method.toUpperCase(); //小写改为大写
        //     if (method == "POST") {
        //         header = {
        //             'content-type': "application/x-www-form-urlencoded"
        //         };
        //     } else {
        //         header = {
        //             'content-type': "application/json"
        //         };
        //     }
        // }
		
		let requestId = manager.generateId(method, url, data)
		if(!requestId) {
		  console.log('重复请求')
		  return false
		}

        //加载圈
        if (!hideLoading) {
            uni.showLoading({
                title: i18n.global.t('message.loading')
            });
        }

        // 返回promise
        return new Promise((resolve, reject) => {
            // 请求
            uni.request({
                url: requestUrl,
                data: data,
                method: method,
                header: header,
                success: (res) => {
                    // 将结果抛出
                    resolve(res)
                },
                //请求失败
                fail: (e) => {
                    uni.showToast({
                        title: "请求失败",
                        icon: 'none'
                    });
                    reject(e);
                },
                //请求完成
                complete() {
					// 请求完成，清除当前请求的唯一ID
					manager.deleteById(requestId)
                    //隐藏加载
                    if (!hideLoading) {
                        uni.hideLoading();
                    }
                    resolve();
                    return;
                }
            })
        })
    }
}