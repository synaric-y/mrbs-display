import Request from '@/utils/request.js'
import {bookFastMeeting0Data,syncRoomData} from '@/api/mockData.js'

let request = new Request().http

    function quickMeetApi(data,header) {
        return new Promise(resolve=>{
			resolve({data: bookFastMeeting0Data})
		})
    }
	
	function syncRoomApi(data,header) {
	    return new Promise(resolve=>{
	    	resolve({data: syncRoomData})
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
	quickMeetMessageMapping
}