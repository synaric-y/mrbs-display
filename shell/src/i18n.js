import { createI18n } from "vue-i18n";
const messages = {
	"zh": {
		"message": {
			"activate":{ // 页面单独分开，防止命名冲突
				"welcome":'欢迎使用xxx会议系统',
				"request_url":'请求地址',
				"placeholder":'扫描web端的二维码即可自动填写服务地址',
				"verify":'验证',
				"belong_to_area":'所属区域',
				"please_select":'请选择',
				"belong_to_meeting_room":'所属会议室',
				"finish":'完成',
				"activate_success":"设备激活成功！",
				"activate_fail":"设备激活失败！",
			},
			"login":{
				"title":'请输入管理员密码',
				"account_number":'请输入账号',
				"password":'请输入密码',
				"confirm":'确定',
				"previous":'返回',
				"login_fail":'用户名或密码错误',
				"login_success":"登录成功"
			},
			"setting":{
				"left":{
					"basic_info":'基本信息',
					"unique_id":'设备唯一ID',
					"equipment_type":'设备型号',
					"battery":'电量',
					"room_area":'所属房间&区域',
					"online_status":'在线状态',
					"about_us":'关于我们',
				},
				"right":{
					"setting":'设置',
					"brightness":'亮度',
					"volume":'音量',
					"area":'区域',
					"meeting_room":'会议室',
					"request_url":'请求地址',
					"time_format":'时间格式',
					"theme_color":'主题颜色',
					"submit":'提交',
					"cancel":'取消',
				},

			},
			"fast_meeting":{
				"title": '快速会议',
				"tip_left":'可预定当前', // 有变量，只能分开写，测试发现大括号传参不生效
				"tip_right":'小时内的空闲时间',
				"reserved": '已预定',
				"theme":'请输入会议名称',
				"name":'预约人姓名',
				"cancel": '取消',
				"confirm": '确定',
			},
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
			"nextMeet": '即将开始的会议',
			"room": '会议室',
			"book": '创建快速会议',
			"language":'语言',
			"roomNumberError":'请选择正确的房间号',
			"noRoom": '没有可用的房间',
			"noFreeRoom": '当前时间已有会议',
			"createMeetSuccess": '创建快速会议成功',
			"netDataError": '接口返回数据异常',
			"time":{
				"minute": '分钟',
				"hour":'小时',
				"minutes": '分钟',
				"hours":'小时'
			}
		}
	},
	"en":{
		"message": {
			"activate":{
				"welcome":'Welcome to xxx Meeting Reservation System',
				"request_url":'Request URL',
				"placeholder":'Scan the QRCode from the Web platform to fill the blank automatically',
				"verify":'Verify',
				"belong_to_area":'Area',
				"please_select":'Please Select',
				"belong_to_meeting_room":'Room',
				"finish":'Finish',
			},
			"login":{
				"title":'Please enter the administrator password',
				"account_number":'Account',
				"password":'Password',
				"confirm":'Confirm',
				"previous":'Previous'
			},
			"setting":{
				"left":{
					"basic_info":'Basic Infomation',
					"unique_id":'Device Unique ID',
					"equipment_type":'Equipment Type',
					"battery":'Battery',
					"room_area":'Room & Area',
					"online_status":'Online Status',
					"about_us":'About',
				},
				"right":{
					"setting":'Settings',
					"brightness":'Brightness',
					"volume":'Volume',
					"area":'Area',
					"meeting_room":'Meeting Room',
					"request_url":'Request URL',
					"time_format":'Time Format',
					"theme_color":'Theme Color',
					"submit":'Submit',
					"cancel":'Cancel',
				}
			},
			"fast_meeting":{
				"title": 'Fast Meetings',
				"tip_left":'Can reserve spare time in ',
				"tip_right":' h',
				"reserved": 'Reserved',
				"theme":'Meeting Theme',
				"name":'Booker Name',
				"cancel": 'Cancel',
				"confirm": 'Confirm',
			},
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
			"book": 'Create Fast Meeting',
			"quickMeeting": '30-minute quick meeting can be booked',
			"language":'English',
			"roomNumberError":'Please select the correct room number',
			"noRoom": 'No rooms available',
			"noFreeRoom": 'There is already a meeting at the current time',
			"createMeetSuccess": 'Create a quick meeting successfully',
			"netDataError": 'The interface returns abnormal data',
			"time":{
				"minute": 'min',
				"hour":'h',
				"minutes": 'min',
				"hours":'h'
			}
		}
	},
	"ko": {
		"message": {
			"activate":{
				"welcome": "xxx 회의 예약 시스템에 오신 것을 환영합니다",
				"request_url": "요청 URL",
				"placeholder":'웹 페이지의 QR코드를 스캔하면 자동으로 서비스 주소를 기입할 수 있다',
				"verify": "검증",
				"belong_to_area": "지역",
				"please_select":'선택하십시오',
				"belong_to_meeting_room": "회의실",
				"finish": "완료"
			},
			"login":{
				"title":'관리자 암호를 입력하십시오',
				"account_number":'계정',
				"password":'암호',
				"confirm":'확인',
				"previous":'반환'
			},
			"setting":{
				"left":{
					"basic_info":'프로파일',
					"unique_id":'장치 고유 일련번호',
					"equipment_type":'장치 모델',
					"battery":'전력',
					"room_area":'소속 공간 및 영역',
					"online_status":'온라인 상태',
					"about_us":'우리에 대해',
				},
				"right":{
					"setting":'설정',
					"brightness": "밝기",
					"volume": "볼륨",
					"area": "지역",
					"meeting_room":'회의실',
					"request_url":'요청 주소',
					"time_format":'시간 형식',
					"theme_color":'주제 색상',
					"submit":'제출',
					"cancel": "취소",
				}
			},
			"fast_meeting":{
				"title": '빠른 회의',
				"tip_left":'현재 5',
				"tip_right":'시간 동안의 유휴 시간 예약 가능',
				"reserved":'예정됨',
				"theme": "회의 이름을 입력하십시오",
				"name":'예약자 이름',
				"cancel": "취소",
				"confirm": "확인",
			},
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
			"book": '빠른 모임 만들기',
			"quickMeeting": '빠른 30분 회의 예약',
			"language":'한국인',
			"roomNumberError":'정확한 객실번호를 선택해주세요.',
			"noRoom": '이용 가능한 객실이 없습니다.',
			"noFreeRoom": '지금 시간에 회의가 있습니다',
			"createMeetSuccess": '빠른 회의가 성공적으로 생성되었습니다.',
			"netDataError": '인터페이스가 데이터 예외를 반환합니다.',
			"time":{
				"minute": "분",
				"hour":'시간',
				"minutes": "분",
				"hours":'시간'
			}
		}
		
	}
}
const i18n = createI18n({
	legacy: false, // 解决vue2兼容问题
	locale: uni.getStorageSync('lang') || 'zh', // 先从本地缓存拿，没有就是中文
	globalInjection: true, // 解决vue2兼容问题
	messages
})
export default i18n