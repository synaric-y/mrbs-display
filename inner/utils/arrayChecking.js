import _ from 'lodash'

/**
 * @author Octene
 * @description 传入一些具有起始结束时间的数组和两个手柄，判断手柄是否和这些数组冲突
*/

/*
Entry 类型定义
{
	start_time: ts,
	end_time: ts
}

*/

/**
 * @description 检查左值是否合法
 * @return boolean
 * @param left 左值 ts
 * @param arr 待检查的数组 Entry[]
 * @param lb 下界 ts
*/
const isLeftHandleValid = (left,arr,lb) => {
  if (left < lb) return false // 检查是否越界
  
  return _.every(arr, (item)=>{return !(left >= item.start_time && left < item.end_time)});
}

/**
 * @description 检查右值是否合法
 * @return boolean
 * @param right 右值 ts
 * @param arr 待检查的数组 Entry[]
 * @param ub 上界 ts
*/
const isRightHandleValid = (right,arr,ub) => {
  if (right > ub) return false // 检查是否越界
  
  return _.every(arr, (item)=>{return !(right > item.start_time && right <= item.end_time)});
}

/**
 * @description 检查两手柄之间是否有会议
 * @return boolean
 * @param left 左值 ts
 * @param right 右值 ts
 * @param arr 待检查的数组 Entry[]
*/
const isBothValid = (left, right, arr) => {
  return _.every(arr, (item)=>{return !(left <= item.start_time && right >= item.end_time)});
}


/**
 * @description 检查两手柄之间的关系
 * @return boolean
 * @param left 左值 ts
 * @param right 右值 ts
 * @param resolution 最小间隔 ts
*/
const isCorrectOrder = (left, right, resolution) => {
  return (right > left) && (right - left >= resolution)
}


/**
 * @description 全部检查
 * @return boolean
 * @param left 左值 ts
 * @param right 右值 ts
 * @param arr 待检查的数组 Entry[]
 * @param lb 下界 ts
 * @param ub 上界 ts
 * @param resolution 最小间隔 ts
*/
const fullCheck = (left, right, arr, lb, ub, resolution) => {
  return isLeftHandleValid(left,arr,lb) &&
      isRightHandleValid(right,arr,ub) &&
      isBothValid(left, right, arr) &&
      isCorrectOrder(left, right, resolution)
}

const findNextLargerTime=(arr,target,lb,ub)=>{
	for(let i=0;i<arr.length;i++){
		if(arr[i].start_time>=target) return arr[i].start_time
	}
	return ub
}

const findPreviousSmallerTime=(arr,target,lb,ub)=>{
	
	// 排序，按每个会议结束时间（防止找到错误的最小值）
	const tempArr = _.sortBy(arr,['end_time'])
	
	// console.log(arr);
	for(let i = tempArr.length-1;i>=0;i--){
		if(arr[i].end_time<=target) return tempArr[i].end_time
	}
	return lb
}

export {
	isLeftHandleValid,
	isRightHandleValid,
	isBothValid,
	isCorrectOrder,
	fullCheck,
	findNextLargerTime,
	findPreviousSmallerTime
}