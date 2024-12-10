

/**
 * @author Octene
 * @file 特定时区的时间与unix时间戳互转
 */

/** @module DateTime */

import {
	DATE_FORMAT_LIST
} from '@/constants/time.js'

import moment from 'moment-timezone';
import {Decimal} from 'decimal.js';
import { SEC_PER_HOUR,SEC_PER_MINUTE } from '@/constants/time.js';

/**
 * @private
 * @function
 * @author Joy Cheng
 * @description 根据语言、时区、unix时间戳显示格式化字符串
 * @param {Number} timestamp unix时间戳
 * @param {String} timezone 区域所在的时区
 * @param {String} dateFormat 格式化字符串
 * @returns {String} 格式化结果
*/
function formatUnixTs(timestamp, timezone, dateFormat) {
	return moment.unix(timestamp).tz(timezone).format(dateFormat);
}

/**
 * @function
 * @author Octene
 * @description 根据语言、时区、unix时间戳显示格式化字符串
 * @param {Number} serverTime 服务器时间, unix时间戳
 * @param {String} timezone 区域所在的时区
 * @param {String} locale 当前的语言
 * @param {Boolean} is12 是否为12小时制
 * @returns {String} 格式化完成的字符串，年月日按locale显示，时、分按固定格式显示
*/
function datetimeFormatTzLocale(serverTime,timezone,locale,is12) {

	const fullFormat = (is12?'hh:mm A':'HH:mm') + ' ' + (DATE_FORMAT_LIST[locale]??DATE_FORMAT_LIST['zh'])
	
	return formatUnixTs(serverTime,timezone,fullFormat)
}

/**
 * @function
 * @author Octene
 * @description 计算在当地的某个小时的时间戳（例如纽约早上8:00和我们的早上8:00实际上是两个时间戳）
 * @param {Number} serverTime 服务器时间
 * @param {String} timezone 区域所在的时区
 * @param {Number} hr 当地小时
 * @returns {Number} 当地时间戳
*/
function localHourToTs(serverTime,timezone,hr){
	const localDateTime = moment.unix(serverTime).tz(timezone).startOf('d').add(hr,'h')
	
	return localDateTime.unix()
}

/**
 * @function
 * @author Octene
 * @description 计算当地时间戳的小时和分钟
 * @param {Number} localTs 当地时间戳
 * @param {String} timezone 区域所在的时区
 * @param {Boolean} is12 是否为12小时制
 * @returns {String} 格式化字符串，12或24小时制
*/
function localTsToHour(localTs,timezone,is12){
	const localHourStr = moment.unix(localTs).tz(timezone).format(is12?'hh:mm A':'HH:mm');
	
	return localHourStr
}

/**
 * @function
 * @author Octene
 * @description 计算当地时间戳与当地显示时间的组合
 * @param {Number} begTs 当地区域开始时间戳
 * @param {Number} endTs 当地区域结束时间戳
 * @param {String} timezone 区域所在的时区
 * @param {Boolean} is12 是否为12小时制，否则是24小时
 * @returns {Array} 时间列表
*/
function localHourList(begTs,endTs,timezone,is12=true){
	
	
	let res = [] // 结果数组
	
	let todayBegTs = new Decimal(begTs)
	let todayEndTs = new Decimal(endTs)
	
	const slice = SEC_PER_HOUR / 2
	
	while(Number(todayBegTs) <= Number(todayEndTs)){
		
		let text = '.' 
		
		if(todayBegTs.mod(slice)==0) // 能被半小时整除，则格式化成小时-分钟
			text = localTsToHour(Number(todayBegTs), timezone, is12)
			
			
		res.push({
			ts: todayBegTs,
			text: text
		})
		
		todayBegTs = todayBegTs.plus(15 * SEC_PER_MINUTE)
		
	}
	
	return res
}

/**
 * @function
 * @author Octene
 * @description 计算当地显示时间
 * @param {Number} begTs 当地区域开始时间戳
 * @param {Number} endTs 当地区域结束时间戳
 * @param {String} timezone 区域所在的时区
 * @returns {Array} 时间列表
*/
function localHourListScroll(begTs,endTs,timezone){
	
	
	let res = [] // 结果数组
	
	let todayBegTs = new Decimal(begTs)
	let todayEndTs = new Decimal(endTs)
	
	const slice = SEC_PER_HOUR
	
	while(Number(todayBegTs) <= Number(todayEndTs)){
		
		let text = '.' 
		
		if(todayBegTs.mod(slice)==0) // 能被半小时整除
			text = moment.unix(todayBegTs).tz(timezone).hour()
			
			
		res.push(text)
		
		todayBegTs = todayBegTs.plus(15 * SEC_PER_MINUTE)
		
	}
	
	return res
}

export {
	datetimeFormatTzLocale,
	localHourToTs,
	localTsToHour,
	localHourList,
	localHourListScroll
}