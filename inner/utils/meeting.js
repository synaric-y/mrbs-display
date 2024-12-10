

/**
 * @author Octene
 * @file 会议格式化
 */

/** @module MeetingFormat */

import _ from 'lodash'
import i18n from '@/src/i18n.js'
import {
	MEETING_TO_START,
	MEETING_IN_PROGRESS,
	MEETING_FINISHED,
	MEETING_EXPIRED
} from "@/constants/meeting.js"
import { SEC_PER_MINUTE } from '@/constants/time.js'

/**
 *
 * @typedef TimelineMeeting
 * @type {Object} 
 * @property {?Number} id 会议id
 * @property {Number} start_time 开始时间戳
 * @property {Number} end_time 结束时间戳
 * @property {0|1|2|3} status 会议状态：待开始|进行中|已结束|已过时（表示过去的时间）
 * @property {String} text 描述文字
 * @property {String} className 显示的类名
 */


/**
 * @function
 * @author Octene
 * @description 计算可供时间滚动选择器使用的会议列表
 * @param {Number} currentTime 当前时间戳
 * @param {Number} lb 时间下界（含），时间戳
 * @param {Number} ub 时间上界（含），时间戳
 * @param {Array} meetings 待格式化的会议列表
 * @returns {TimelineMeeting[]} 格式化之后的会议列表
*/
const formatMeetings = (currentTime,lb,ub,meetings) => {
	

	// 计算状态
	function getEntryStatus(entry) {
		if (_.inRange(currentTime, entry.start_time, entry.end_time)) return MEETING_IN_PROGRESS // 进行中
		if (currentTime > entry.end_time) return MEETING_FINISHED // 已结束
		return MEETING_TO_START // 待开始
	}

	// 计算文字
	function getEntryText(status) {
		switch(status){
			case MEETING_TO_START: return i18n.global.t('message.fast_meeting.to_start')
			case MEETING_IN_PROGRESS: return i18n.global.t('message.fast_meeting.in_progress')
			case MEETING_FINISHED: return i18n.global.t('message.fast_meeting.finished')
			default: return ''
		}
	}
	
	function getEntryClassName(status) {
		switch(status){
			case MEETING_TO_START: return 'to-start'
			case MEETING_IN_PROGRESS: return 'in-progress'
			case MEETING_FINISHED: return 'disabled'
			case MEETING_EXPIRED: return 'overdue'
			default: return ''
		}
	}
	
	const tempList = [] // 临时数组
	
	// 如果是今天，将先前的几个小时清掉
	tempList.push({
		start_time: lb,
		end_time: Math.min(currentTime, ub),
		status: MEETING_EXPIRED, // 已过去的时间
		text: '',
		className: getEntryClassName(MEETING_EXPIRED)
	})

	_.forEach(meetings, entry => {

		// 去除不在范围内的会议
		if (entry.start_time > ub) return
		if (entry.end_time < lb) return

		const status = getEntryStatus(entry)
		const text = (entry.end_time-entry.start_time>=SEC_PER_MINUTE*15)?getEntryText(status):'' // 大于等于15分钟展示文字
		const className = getEntryClassName(status)
		
		tempList.push({
			id: entry.id,
			start_time: Math.max(entry.start_time, lb), // 截断越界的部分
			end_time: Math.min(ub, entry.end_time),
			status: status, // 待开始，进行中，已结束
			text: text,
			className: className
		})

	})


	// 排序，按每个会议起始时间（防止乱序导致手柄初始化问题）
	const res = _.sortBy(tempList, ['start_time'])
	console.log(res);
	
	return res

}

export {
	formatMeetings
}