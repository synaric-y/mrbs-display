

/**
 * @author Octene
 * @file 时间戳查找、差值转换
 */

/** @module DateTime */

import i18n from '@/src/i18n.js';
import {Decimal} from 'decimal.js';
import { SEC_PER_HOUR, SEC_PER_MINUTE } from '@/constants/time';


/**
 * @function
 * @author Octene
 * @description 寻找下一个整点(正好是0、15、30、45分钟的时间戳)
 * @param {Number} ts 当前点位
 * @param {Number} resolution 最小会议间隔，秒
 * @return {Number} 下一个整点时间戳（向上取整）
 * */
const nextScaleTs=(ts,scale)=>{
	
	let res = new Decimal(ts).dividedBy(scale).floor().times(scale).plus(scale);
	
	// console.log(res);
	
	return Number(res)
}

/**
 * @function
 * @author Octene
 * @description 寻找下一个整点(正好是0、15、30、45分钟的时间戳)
 * @param {Number} ts 当前点位
 * @param {Number} resolution 最小会议间隔，秒
 * @return {Number} 下一个整点时间戳（向上取整），如果现在正好是整点则返回
 * */
const ceilScaleTs=(ts,scale)=>{
	
	if((Number)(new Decimal(ts).mod(scale))==0) return ts

    let res = new Decimal(ts).dividedBy(scale).floor().times(scale).plus(scale);

    // console.log(res);

    return Number(res)
}

/**
 * @function
 * @author Octene
 * @description 寻找当前点位附近最近的整点，超出边界的则返回边界
 * @param {Number} ts 当前点位
 * @param {Number} lb 时间下界（含）
 * @param {Number} ub 时间上界（含）
 * @param {Number} resolution 最小会议间隔，秒
 * @return {Number} 最近的整点时间戳
 * */
const nearestScaleTs = (ts,lb,ub,scale)=>{
	
	if(ts<=lb) return lb
	if(ts>=ub) return ub
	
	const nextScaleTs = Number(new Decimal(ts).dividedBy(scale).floor().times(scale).plus(scale));
	const previousScaleTs = nextScaleTs - scale
	
	if(Math.abs(ts - nextScaleTs) <= Math.abs(ts - previousScaleTs)) return nextScaleTs
	return previousScaleTs
}


/**
 * @function
 * @author Octene
 * @description 计算两个时间戳的差值，并将差值转换为可读的字符串
 * @param {Number} begTs 较小的时间戳
 * @param {Number} endTs 较大的时间戳
 * @return {String} 最小单位为分钟的字符串，如“1小时23分”
 * */
const tsDiff=(begTs,endTs)=>{

	const tsDiff = Math.abs(endTs - begTs)
	
	
	const hr = Number(new Decimal(tsDiff).dividedBy(SEC_PER_HOUR).floor())
	const min = Number(new Decimal(tsDiff).minus(hr * SEC_PER_HOUR).dividedBy(SEC_PER_MINUTE).floor())
	const sec = Number(new Decimal(tsDiff).minus(hr * SEC_PER_HOUR).minus(min * SEC_PER_MINUTE).floor())
	
	// console.log(hr,min,tsDiff);
	
	let res = ''
	if (hr > 0) res += hr + (hr > 1 ? i18n.global.t('message.time.hours') : i18n.global.t('message.time.hour'))
	if (min > 0) res += min + (min > 1 ? i18n.global.t('message.time.minutes'):i18n.global.t('message.time.minute'))
	if (sec > 0) res += sec + (sec > 1 ? i18n.global.t('message.time.seconds'):i18n.global.t('message.time.second'))
	
	return res
}




export {
	tsDiff,
	nextScaleTs,
	nearestScaleTs,
	ceilScaleTs
}