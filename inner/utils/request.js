// import {
// 	HOST
// } from '@/modules/config.js'

import store from '@/store/index.js'
import i18n from '@/src/i18n.js';
import RequestManager from '@/utils/requestManager.js' 
const manager = new RequestManager() //创建请求管理表


export default class Request {
    http(param) {
        // 请求参数
        var host = param.host,
			url = param.url,
            method = param.method,
            header = {},
            data = param.data || {},
            token = param.token || "",
			header = param.header || {'content-type': "application/json"},
            hideLoading = param.hideLoading || false;

		// console.log(param.url);
		// console.log(param.data);
        //拼接完整请求地址
        var requestUrl = host + url;
       //拼接完整请求地址（根据环境切换）
       // var requestUrl = operate.api() + url;

        //请求方式:GET或POST(POST需配置
        // header: {'content-type' : "application/x-www-form-urlencoded"},)
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