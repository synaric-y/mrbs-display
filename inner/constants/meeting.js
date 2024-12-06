/**
 * @author Octene
 * @file 会议相关的常量
*/

/** 
 * @constant
 * @type {Number}
 * @default
 * @description 平板端快速会议
*/ 
const PAD_QUICK_MEETING_TYPE = 99

/** 
 * @constant
 * @type {Number}
 * @default
 * @description 不开启快速会议，不显示会议按钮
*/ 
const TEMPORARY_MEETING_NONE = 0
/** 
 * @constant
 * @type {Number}
 * @default
 * @description 开启不记名快速会议（旧版）
*/ 
const TEMPORARY_MEETING_LEGACY = 1
/** 
 * @constant
 * @type {Number}
 * @default
 * @description 需扫码预约（新版）
*/ 
const TEMPORARY_MEETING_VERIFIED = 2


/** 
 * @constant
 * @type {Number}
 * @default
 * @description 会议状态：待开始
*/ 
const MEETING_TO_START = 0
/** 
 * @constant
 * @type {Number}
 * @default
 * @description 会议状态：进行中
*/ 
const MEETING_IN_PROGRESS = 1
/** 
 * @constant
 * @type {Number}
 * @default
 * @description 会议状态：已结束
*/ 
const MEETING_FINISHED = 2
/** 
 * @constant
 * @type {Number}
 * @default
 * @description 会议状态：已过时，仅lb到servertime的时间条使用
*/ 
const MEETING_EXPIRED = 3

export {
	PAD_QUICK_MEETING_TYPE,
	TEMPORARY_MEETING_NONE,
	TEMPORARY_MEETING_LEGACY,
	TEMPORARY_MEETING_VERIFIED,
	MEETING_TO_START,
	MEETING_IN_PROGRESS,
	MEETING_FINISHED,
	MEETING_EXPIRED
}