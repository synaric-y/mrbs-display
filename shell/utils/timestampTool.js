// 处理时间戳的函数
// Author: Octene Wang
// 本页面传入的所有时间戳都是10位时间戳(s)

import i18n from '@/src/i18n.js';
import {Decimal} from 'decimal.js';
import {formatDate} from '@/utils/indexTimeTool.js'

const SEC_PER_HOUR = 3600
const SEC_PER_MINUTE = 60

/**
 * param: ts,scale(900,1800，单位：秒)
 * return: 最近的下一个能被scale整除的时间戳
 * 似乎有浮点误差问题，稍微转一下
*/
const nextScaleTs=(ts,scale)=>{
	
	let res = new Decimal(ts).dividedBy(scale).floor().times(scale).plus(scale);
	
	console.log(res);
	
	return Number(res)
}

/**
 * param: begTs,endTs,scale(秒)
 * return: 一个闭区间数组，间隔为scale
*/
const generateTsSequence=(begTs,endTs,scale)=>{
	console.log(begTs,endTs,scale);
	let res = []
	for(let ts=begTs;ts<=endTs;ts+=scale) res.push(ts)
	return res
	
	return []
}

/**
 * param: begTs,endTs
 * return: 两时间戳之差（国际化字符串，小时+分钟）
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
 * param: ts,lb,ub,scale(秒)
 * return: 离ts最近的能被scale整除的时间戳，且在上下界内
 * */
const nearestScaleTs = (ts,lb,ub,scale)=>{
	
	if(ts<=lb) return lb
	if(ts>=ub) return ub
	
	const nextScaleTs = Number(new Decimal(ts).dividedBy(scale).floor().times(scale).plus(scale));
	const previousScaleTs = nextScaleTs - scale
	
	if(Math.abs(ts - nextScaleTs) <= Math.abs(ts - previousScaleTs)) return nextScaleTs
	return previousScaleTs
}


function hourDisplay(begHr,endHr,is12){
	
	// console.log(begHr,endHr,is12);
	
	const now = new Date();
	
	let todayStartTs = new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate()).getTime()/1000; // s
	
	let todayBegTs = new Decimal(todayStartTs).plus(begHr * SEC_PER_HOUR)
	
	let todayEndTs = new Decimal(todayStartTs).plus(endHr * SEC_PER_HOUR)
	
	// console.log(now,todayStartTs,todayBegTs,todayEndTs);
	
	let res = []
	
	
	while(Number(todayBegTs) <= Number(todayEndTs)){
		
		let text = '.' 
		
		if(todayBegTs.mod(SEC_PER_HOUR / 2)==0) // 能被半小时整除，则格式化成小时-分钟
			text = formatDate(Number(todayBegTs), 'Asia/Shanghai', 'zh-cn', is12?'hh:mm A':'hh:mm')
			
			
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
	hourDisplay
}