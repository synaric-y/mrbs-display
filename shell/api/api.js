import Request from '@/utils/request.js'
let request = new Request().http

    function quickMeetApi(data,header) {
        return request({
            url: "/web/appapi/api.php?act=book_fast_meeting",
            method: "POST", //请求方式
            data: data, //请求数据
			header: header // 请求头
        })
    }
	
	function syncRoomApi(data,header) {
	    return request({
	        url: "/web/appapi/api.php?act=sync_room",
	        method: "POST", //请求方式
	        data: data, //请求数据
			header: header, // 请求头
			hideLoading: true //隐藏加载
	    })
	}
	
	function getAllAreaApi(data) {
	    return request({
	        url: "/web/call.php?act=get_info%2Fget_all_area",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	function getAllRoomsApi(data) {
	    return request({
	        url: "/web/call.php?act=get_info%2Fget_all_rooms",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	function activateDeviceApi(data) {
	    return request({
	        url: "/web/appapi/api.php?act=activate_device",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	function changeBindApi(data) {
	    return request({
	        url: "/web/appapi/api.php?act=change_bind",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	function loginApi(data) {
	    return request({
	        url: "/web/appapi/api.php?act=login",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	function logoutApi() {
	    return request({
	        url: "/web/call.php?act=logout",
	        method: "POST", //请求方式
	    })
	}
	
	function getSettingApi(data) {
	    return request({
	        url: "/web/appapi/api.php?act=get_setting",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	function getDeviceInfoApi(data) {
	    return request({
	        url: "/web/call.php?act=device%2Fdevice_info",
	        method: "POST", //请求方式
	        data: data, //请求数据
	    })
	}
	
	const quickMeetMessageMapping = {
		'-1': 'message.noRoom',
		'-2': 'message.noFreeRoom',
		'0': 'message.createMeetSuccess'
	}

export {
    quickMeetApi,
	syncRoomApi,
	quickMeetMessageMapping,
	getAllAreaApi,
	getAllRoomsApi,
	activateDeviceApi,
	changeBindApi,
	getSettingApi,
	getDeviceInfoApi,
	loginApi,
	logoutApi
}