/** 
 * @constant
 * @type {Number}
 * @default
 * @description 每小时的秒数
*/ 
const SEC_PER_HOUR = 3600

/** 
 * @constant
 * @type {Number}
 * @default
 * @description 每分钟的秒数
*/ 
const SEC_PER_MINUTE = 60

/** 
 * @constant
 * @type {String}
 * @default
 * @description 上海时区（UTC +08:00）
*/ 
const TIMEZONE_ZH = 'Asia/Shanghai'

/** 
 * @constant
 * @type {String}
 * @default
 * @description 韩国时区
*/ 
const TIMEZONE_KO = 'Asia/Seoul'

/** 
 * @constant
 * @type {String}
 * @default
 * @description 美国时区
*/ 
const TIMEZONE_EN = 'America/New_York'


/** 
 * @constant
 * @type {Object}
 * @default
 * @description 年月日格式表 key: locale，两位英文小写字母 value: 年月日格式
*/ 
const DATE_FORMAT_LIST = {
	'zh': 'YYYY年MM月DD日',
	'en': 'MMMM D, YYYY',
	'ko': 'YYYY년MM월DD일'
}


export {
	SEC_PER_HOUR,
	SEC_PER_MINUTE,
	TIMEZONE_ZH,
	TIMEZONE_KO,
	TIMEZONE_EN,
	DATE_FORMAT_LIST
}