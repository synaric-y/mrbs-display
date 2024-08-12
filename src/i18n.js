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
			"booked": '已预定',
			"over_meeting":'已结束',
			"small_in_meeting": '会议中',
			"alert_error_code": '请输入正确的内置码',
			"canBook": '可预定'
		}
	},
	"en":{
		"message": {
			"meeting": 'Room',
			"meeting_theme": 'Conference Theme',
			"booker": 'Booker',
			"in_meeting": 'Meeting',
			"no_meeting": 'IDLE',
			"upcoming_meetings": 'Upcoming Meetings',
			"alert_code": 'Please enter the built-in code',
			"sure": 'Sure',
			"booked": 'Booked',
			"over_meeting":'Over',
			"small_in_meeting": 'Meeting',
			"alert_error_code": 'Please enter the correct built-in code',
			"canBook": 'Available'
		}	
	},
	"ko": {
		"message": {
			"meeting": '회의실',
			"meeting_theme": '컨퍼런스 주제',
			"booker": '부커',
			"in_meeting": '회 의 중',
			"no_meeting": '여유 있음',
			"upcoming_meetings": '곧 시작됩니다',
			"alert_code": '내장코드를 입력해주세요',
			"sure": '확인',
			"booked": '이미 예약됨',
			"over_meeting":'종료됨',
			"small_in_meeting": '회의 중',
			"alert_error_code": '올바른 내장 코드를 입력하세요.',
			"canBook": '예약 가능'
		}
	}
}
const i18n = createI18n({
	locale: 'zh',
	// fallbackLocale: 'zh',
	messages
})
export default i18n