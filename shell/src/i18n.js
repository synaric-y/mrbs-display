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
				"verify_success":'请求地址验证成功！',
				"verify_fail":'请求地址验证失败！',
				"verify_duplicate":'此设备已激活！'
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
					"normal":'正常',
					"offline":'离线'
				},
				"right":{
					"setting":'设置',
					"brightness":'亮度',
					"volume":'音量',
					"area":'区域',
					"meeting_room":'会议室',
					"request_url":'请求地址',
					"time_format":'时间格式',
					"12hour_format":'12小时制',
					"24hour_format":'24小时制',
					"theme_color":'主题颜色',
					"submit":'提交',
					"cancel":'取消',
					"confirm":'确定',
					"notice":'通知',
					"restart":'请求地址变更需重启应用，是否重启？',
					"setting_success":'设置修改成功'
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
				"success": '会议预订成功！',
				"fail": '会议预订失败!',
				"theme_too_long":'会议主题不应超过50字',
				"booker_too_long":'预订人名称不应超过30字',
			},
			"index":{
				"left":{
					"book": '创建快速会议',
					"no_free": '当前时段会议室已约满',
					"default_name": 'xx会议'
				},
				"right":{
					"meeting": '会议室',
					"language":'语言',
					"in_meeting": '会 议 中',
					"no_meeting": '空 闲 中',
					"next_meeting": '即将开始的会议',
					"default_name": 'xx会议',
					"default_booker": 'xx预定'
				}
			},
			"time":{
				"minute": '分钟',
				"hour":'小时',
				"minutes": '分钟',
				"hours":'小时',
				"not_available": '不可用'
			},
			"netDataError": '接口返回数据异常',
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
					"normal":'Normal',
					"offline":'Offline'
				},
				"right":{
					"setting":'Settings',
					"brightness":'Brightness',
					"volume":'Volume',
					"area":'Area',
					"meeting_room":'Meeting Room',
					"request_url":'Request URL',
					"time_format":'Time Format',
					"12hour_format":'12 Hour Format',
					"24hour_format":'24 Hour Format',
					"theme_color":'Theme Color',
					"submit":'Submit',
					"cancel":'Cancel',
					"confirm":'Confirm',
					"notice":'Notice',
					"restart":'Request URL change requires restarting the application. Do you want to restart it?',
					"setting_success":'Setting modified successfully'
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
				"success": 'Fast meeting is successfully reserved',
				"fail": 'Reservation failed!',
				"theme_too_long":'Theme should not exceed 50 words',
				"booker_too_long":'Booker name should not exceed 30 words',
			},
			"index":{
				"left":{
					"book": 'Create Fast Meeting',
					"no_free": 'There is no free room at the current time',
					"default_name": 'xx Meeting'
				},
				"right":{
					"meeting": 'Room',
					"language":'Language',
					"in_meeting": 'Meeting',
					"no_meeting": 'Free',
					"next_meeting": 'Upcoming Meetings',
					"default_name": 'xx Meeting',
					"default_booker": 'xx'
				}
			},
			"time":{
				"minute": 'min',
				"hour":'h',
				"minutes": 'min',
				"hours":'h',
				"not_available": 'Not Available'
			},
			"netDataError": 'The interface returns abnormal data',
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
					"normal":'정상',
					"offline": "오프라인"
				},
				"right":{
					"setting":'설정',
					"brightness": "밝기",
					"volume": "볼륨",
					"area": "지역",
					"meeting_room":'회의실',
					"request_url":'요청 주소',
					"time_format":'시간 형식',
					"12hour_format":'12시간제',
					"24hour_format":'24시간제',
					"theme_color":'주제 색상',
					"submit":'제출',
					"cancel": "취소",
					"confirm": "확인",
					"notice":'알림',
					"restart": "주소 변경 요청은 애플리케이션을 재부팅해야 합니다. 재부팅하시겠습니까?",
					"setting_success":'설정 수정 성공'
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
				"success": "회의 예약 성공!",
				"fail": "회의 예약 실패!",
				"theme_too_long":'회의 주제는 50자를 초과해서는 안 됩니다',
				"booker_too_long":'예약자 이름은 30자를 초과해서는 안 됩니다',
			},
			"index":{
				"left":{
					"book": "빠른 모임 만들기",
					"no_free":'현재 시간대 회의실이 가득 찼습니다',
					"default_name": 'xx',
				},
				"right":{
					"meeting": "회의실",
					"language":'언어',
					"in_meeting":'회의 중',
					"no_meeting":'유휴 중',
					"next_meeting":'곧 시작될 회의',
					"default_name": 'xx',
					"default_booker": 'xx'
				}
			},
			"time":{
				"minute": "분",
				"hour":'시간',
				"minutes": "분",
				"hours":'시간',
				"not_available": '사용 불가능'
			},
			"netDataError": '인터페이스가 데이터 예외를 반환합니다.',
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