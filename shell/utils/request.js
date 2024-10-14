import {
	HOST
} from '@/modules/config.js'


export default class Request {
    http(param) {
        // 请求参数
        var url = param.url,
            method = param.method,
            header = {},
            data = param.data || {},
            token = param.token || "",
			header = param.header || {'content-type': "application/json"},
            hideLoading = param.hideLoading || false;

        //拼接完整请求地址
        var requestUrl = HOST + url;
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

        //加载圈
        if (!hideLoading) {
            uni.showLoading({
                title: '加载中...'
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
                        title: "请求失败" + e.msg,
                        icon: 'none'
                    });
                    reject(e);
                },
                //请求完成
                complete() {
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