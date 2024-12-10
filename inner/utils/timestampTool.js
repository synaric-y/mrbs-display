// 处理时间戳的函数
// Author: Octene Wang
// 本页面传入的所有时间戳都是10位时间戳(s)

import i18n from '@/src/i18n.js';
import {Decimal} from 'decimal.js';
import {formatDate} from '@/utils/indexTimeTool.js'

const SEC_PER_HOUR = 3600
const SEC_PER_MINUTE = 60

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
 * @description 生成一个闭区间数组，间隔为scale
 * @param {Number} begTs 起始时间戳
 * @param {Number} endTs 结束时间戳
 * @param {Number} scale 最小会议间隔，秒
 * @return {Number[]} 时间戳数组
 * */
const generateTsSequence=(begTs,endTs,scale)=>{
	console.log(begTs,endTs,scale);
	let res = []
	for(let ts=begTs;ts<=endTs;ts+=scale) res.push(ts)
	return res
	
	return []
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
    const tsDiff = endTs - begTs

    const hr =  Number(new Decimal(tsDiff).dividedBy(SEC_PER_HOUR).floor())
    const min = Number(new Decimal(tsDiff).minus(hr*SEC_PER_HOUR).dividedBy(SEC_PER_MINUTE).floor())
	
	// console.log(hr,min,tsDiff);

    let res = ''
    if(hr>0) res += hr + i18n.global.t(hr>1?'message.time.hours':'message.time.hour')
    if(min>0) res += min + i18n.global.t(min>1?'message.time.minutes':'message.time.minute')

    return res
}



/**
 * @function
 * @author Octene
 * @description 给定一个小时浮点数，将其转换为当天的时间戳
 * @param {Number} hr 小时浮点数
 * @return {Number} 时间戳
 * */
function hourToTimestamp(hr){
	
	const now = new Date();
	
	let todayStartTs = new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate()).getTime()/1000; // s
	
	const res = new Decimal(todayStartTs).plus(hr * SEC_PER_HOUR)
	
	return Number(res)
}


function hourDisplay(begTs,endTs,is12){
	
	
	let res = []
	
	let todayBegTs = new Decimal(begTs)
	let todayEndTs = new Decimal(endTs)
	
	while(Number(todayBegTs) <= Number(todayEndTs)){
		
		let text = '.' 
		
		if(todayBegTs.mod(SEC_PER_HOUR / 2)==0) // 能被半小时整除，则格式化成小时-分钟
			text = formatDate(Number(todayBegTs), 'Asia/Shanghai', 'zh-cn', is12?'hh:mm A':'HH:mm')
			
			
		res.push({
			ts: todayBegTs,
			text: text
		})
		
		todayBegTs = todayBegTs.plus(15 * SEC_PER_MINUTE)
		
	}
	
	return res
}


export {
	SEC_PER_HOUR,
	SEC_PER_MINUTE,
	generateTsSequence,
	tsDiff,
	nextScaleTs,
	nearestScaleTs,
	hourDisplay,
	hourToTimestamp,
	ceilScaleTs
}