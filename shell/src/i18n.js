import { createI18n } from "vue-i18n";
const messages = {
	"zh": {
		"message": {
			"meeting": '会议室',
			"meeting_theme": '会议主题',
			"booker": '预定人',
			"in_meeting": '会 议 中',
			"no_meeting": '空 闲 中',
			"upcoming_meetings": '即将开始',
			"alert_code": '请输入内置码',
			"sure": '确定',
			"cancle": '取消',
			"confirm": '确定',
			"booked": '已预定',
			"over_meeting":'已结束',
			"small_in_meeting": '会议中',
			"alert_error_code": '请输入正确的内置码',
			"canBook": '可预定',
			"createRoomFail": '创建快速会议失败',
			"nextMeet": '下一次会议',
			"room": '会议室',
			"book": '预定',
			"quickMeeting": '预定30分钟快速会议',
			"language":'语言',
			"roomNumberError":'请选择正确的房间号',
			"noRoom": '没有可用的房间',
			"noFreeRoom": '当前时间已有会议',
			"createMeetSuccess": '创建快速会议成功',
			"netDataError": '接口返回数据异常',
		}
	},
	"en":{
		"message": {
			"meeting": 'Room',
			"meeting_theme": 'Conference Theme',
			"booker": 'Booker',
			"in_meeting": 'Meeting',
			"no_meeting": 'Free',
			"upcoming_meetings": 'Upcoming Meetings',
			"alert_code": 'Please enter the built-in code',
			"sure": 'Sure',
			"cancle": 'Cancle',
			"confirm": 'Confirm',
			"booked": 'Booked',
			"over_meeting":'Over',
			"small_in_meeting": 'Meeting',
			"alert_error_code": 'Please enter the correct built-in code',
			"canBook": 'Available',
			"nextMeet": 'Next meet',
			"room": 'Room',
			"book": 'Book',
			"quickMeeting": '30-minute quick meeting can be booked',
			"language":'English',
			"roomNumberError":'Please select the correct room number',
			"noRoom": 'No rooms available',
			"noFreeRoom": 'There is already a meeting at the current time',
			"createMeetSuccess": 'Create a quick meeting successfully',
			"netDataError": 'The interface returns abnormal data',
		}	
	},
	"ko": {
		"message": {
			"meeting": '회의실',
			"meeting_theme": '컨퍼런스 주제',
			"booker": '부커',
			"in_meeting": '회 의 중',
			"no_meeting": '여유있음',
			"upcoming_meetings": '곧 시작됩니다',
			"alert_code": '내장코드를 입력해주세요',
			"sure": '확인',
			"cancle": '취소',
			"confirm": '확인',
			"booked": '예약하다',
			"over_meeting":'종료됨',
			"small_in_meeting": '회의 중',
			"alert_error_code": '올바른 내장 코드를 입력하세요.',
			"canBook": '예약 가능',
			"nextMeet": '다음 회의',
			"room": '방',
			"book": '예약하다',
			"quickMeeting": '빠른 30분 회의 예약',
			"language":'한국인',
			"roomNumberError":'정확한 객실번호를 선택해주세요.',
			"noRoom": '이용 가능한 객실이 없습니다.',
			"noFreeRoom": '지금 시간에 회의가 있습니다',
			"createMeetSuccess": '빠른 회의가 성공적으로 생성되었습니다.',
			"netDataError": '인터페이스가 데이터 예외를 반환합니다.',
		}
	}
}
const i18n = createI18n({
	locale: 'zh',
	messages
})
export default i18n