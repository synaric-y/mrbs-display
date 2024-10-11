import Request from '@/utils/request.js'
let request = new Request().http

    function getQuickMeet(data,header) {
        return request({
            url: "/web/appapi/api.php?act=book_fast_meeting", //请求头
            method: "POST", //请求方式
            data: data, //请求数据
			header: header // 请求头
        })
    }
	
	const quickMeetMessageMapping = {
		'-1': 'message.noRoom',
		'-2': 'message.noFreeRoom',
		'0': 'message.createMeetSuccess'
	}

export {
    getQuickMeet,
	quickMeetMessageMapping
}