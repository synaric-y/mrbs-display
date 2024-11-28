<script setup>
	import {
		SEC_PER_HOUR,
		generateTsSequence,
		tsDiff,
		nextScaleTs,
		nearestScaleTs,
		SEC_PER_MINUTE,
		ceilScaleTs
	} from "@/utils/timestampTool.js";

	import {
		formatTime
	} from "@/utils/indexTimeTool.js";
	
	import {
		formatMeetings
	} from '@/utils/meeting.js'
	
	import {fullCheck,	findNextLargerTime,
	findPreviousSmallerTime} from '@/utils/arrayChecking.js'

	import {
		isBetween,
		clamp
	} from "@/utils/mathUtil";

	import {
		computed,
		onMounted,
		ref,
		watch
	} from "vue";

	import {
		Decimal
	} from 'decimal.js';
	
	import _ from 'lodash'; // lodash
	
	import i18n from '@/src/i18n.js'

	import store from '@/store/index.js' //需要引入store
	
	import ScrollContainer from "./ScrollContainer.vue";

	const props = defineProps(['lb', 'ub', 'areaLb', 'areaUb', 'meetings', 'leftHandle', 'rightHandle', 'currentTime',
		'disabled', 'isFirst',
		'scale',
		'avaliableHours'
	])
	const emits = defineEmits(["update:leftHandle", "update:rightHandle", "update:disabled","changing"]); // 有操作就抛出changing

	// 转换成ref变量
	const resolution = ref(props.scale * SEC_PER_MINUTE)
	const maxMeetingSec = ref(props.avaliableHours * SEC_PER_HOUR) // 1小时
	const timeTable = ref([]); // 内部时间表
	const span = ref(props.ub - props.lb)
	const hrArray = ref([])
	
	
	// 元素坐标值（需要动态查询）
	const contentWidth = ref(100) // 滚动区域总宽度（双向绑定

	// 两手柄css闪烁类
	const leftHandleBlink = ref('')
	const rightHandleBlink = ref('')
	
	const currentTheme = computed(() => {
		return store.getters.currentTheme
	})
	
	/**
	 * left: 左值 ts
	 * right: 右值 ts
	 */
	function wrappedFullCheck(left, right) {
		return fullCheck(left, right, timeTable.value, props.lb, props.ub, resolution.value)
	}


	onMounted(() => {
		
		// 初始化刻度
		hrArray.value = generateTsSequence(props.lb, props.ub, props.scale * 60)
		console.log(hrArray.value);

		// 初始化会议
		timeTable.value = formatMeetings(props.currentTime,props.lb, props.ub,props.meetings)
		console.log(timeTable.value);

		// 初始化手柄
		getInitialHandle()
	})

	

	
	//===================================初始时间========================================
	
	const getInitialHandle = () => {

		let left = props.lb
		let right = left + resolution.value

		if (wrappedFullCheck(left, right)) {
			emits('update:leftHandle', left)
			emits('update:rightHandle', right)
			return
		}

		
		for(let entry of timeTable.value){
			left = ceilScaleTs(entry.end_time, resolution.value) // 尝试从各个时间段的右边开始
			right = left + resolution.value
			
			if (wrappedFullCheck(left, right)) {
				emits('update:leftHandle', left)
				emits('update:rightHandle', right)
				return
			}
		}


		// 还是找不到，就报错
		emits("update:disabled", true)
	}
	
	//===================================点新时间========================================
	
	const changeLeft = (fl) => {
		
		function getNearestPercentScale(per){
		  const currentTs = Number(new Decimal(per).times(span.value).plus(props.lb))
		  return nearestScaleTs(currentTs, props.lb, props.ub, resolution.value)
		}
		
		const tempLeftHandle = getNearestPercentScale(fl)
		const tempRightHandle = tempLeftHandle + resolution.value
		
		if(!wrappedFullCheck(tempLeftHandle,tempRightHandle)) return
		
		// 改值
		emits('update:leftHandle', tempLeftHandle)
		emits('update:rightHandle', tempRightHandle)
	}


	// ========================================样式计算============================================

	// 根据真实值计算左侧定位百分比
	const handlePosition = (val) => {
		return Number(new Decimal(val).minus(props.lb).dividedBy(span.value).times(100)) + '%'
	}
	
	// 根据真实值计算左侧定位百分比（浮点数）
	const handlePositionFloat = (val) => {
		return Number(new Decimal(val).minus(props.lb).dividedBy(span.value))
	}

	// 根据真实值计算宽度
	const handleWidth = (leftVal, rightVal) => {
		return Number(new Decimal(rightVal).minus(leftVal).dividedBy(span.value).times(100)) + '%'
	}

	

	//===================================整体平移========================================
	
	const selectionStartX = ref(0)
	const selectionStartLeftHr = ref(0)
	const selectionStartRightHr = ref(0)
	const selectionTranslationStart = (event) => {
		emits('changing')

		console.log(290);

		selectionStartX.value = event.changedTouches?.[0].clientX ?? event.clientX
		selectionStartLeftHr.value = props.leftHandle
		selectionStartRightHr.value = props.rightHandle

	}

	const selectionTranslationMove = (event) => {
		
		const currentX = event.changedTouches?.[0].clientX ?? event.clientX
		const diff = currentX - selectionStartX.value
		
		const slice = Number(new Decimal(resolution.value).dividedBy(span.value).times(contentWidth.value)) // 半点
		const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数
		
		
		let tempLeftHandle = selectionStartLeftHr.value + sliceCnt * resolution.value // 临时变量，新的左右值
		const nearestSec = nearestScaleTs(tempLeftHandle, props.lb, props.ub, resolution.value) // 向后取整
		tempLeftHandle = nearestSec
		
		const tempRightHandle = selectionStartRightHr.value + sliceCnt * resolution.value
		
		
		if (!wrappedFullCheck(tempLeftHandle, tempRightHandle)) { // 两手柄条件错误则返回
			if (diff < 0) { // 向左
				leftHandleBlink.value = 'handle-blink'
			} else { // 向右
				rightHandleBlink.value = 'handle-blink'
			}
			return
		}
		
		// 改值
		emits('update:leftHandle', tempLeftHandle)
		emits('update:rightHandle', tempRightHandle)
		
	}

	const selectionTranslationEnd = (event) => {
		leftHandleBlink.value = ''
		rightHandleBlink.value = ''
	}

	//===================================手柄拖动========================================
	
	// 左值渲染坐标(%)
	const positionLeft = computed(()=>{
		return handlePosition(props.leftHandle)
	})
	
	// 右值渲染坐标(%)
	const positionRight = computed(()=>{
		return handlePosition(props.rightHandle)
	})

	const handleStartX = ref(0) // 开始拖动时，鼠标的初始位置 (x)
	const handleStartHr = ref(0) // 左手柄初始时间戳 (ts)
	const handleDragging = ref(false) // 是否正在拖动 (boolean)
	
	// 计算停下地方的最近的整秒
	const stopSec = (stopX)=>{
		const finalSec = (Number)
			(new Decimal(stopX - handleStartX.value)
				.dividedBy(contentWidth.value)
				.times(span.value)
				.plus(handleStartHr.value).floor()) // 当前停下的地方的秒数
				
		const nearestSec = nearestScaleTs(finalSec, props.lb, props.ub, resolution.value)
		
		return nearestSec
	}
	
	// 处理左手柄拖动结果
	const leftHandleStop = (stopX)=>{
		
		let tempHandle = stopSec(stopX)
		
		// console.log(tempHandle);
		
		const lastEndSec = findPreviousSmallerTime(timeTable.value, props.leftHandle, props.lb, props.ub)
		const rightEndSec = props.rightHandle - maxMeetingSec.value
		
		let minVal = Math.max(lastEndSec,rightEndSec) // 可以接受的最小值
		const maxVal = props.rightHandle - resolution.value // 可以接受的最大值
		
		if(rightEndSec-lastEndSec<resolution.value){  // 比较近
			minVal = lastEndSec
		}
		
		leftHandleBlink.value = '' // 只有在非法的时候闪烁
		
		if (tempHandle < minVal) {
			if (props.leftHandle <= minVal) { // 已经是最小值了
				leftHandleBlink.value = 'handle-blink'
				return
			} else { // 还能设为最小值
				tempHandle = minVal
			}
		}
		
		if (tempHandle > maxVal) {
			if (props.leftHandle >= maxVal) { // 已经是最大值了
				leftHandleBlink.value = 'handle-blink'
				return
			} else { // 还能设为最大值
				tempHandle = maxVal
			}
		}
		
		emits('update:leftHandle', tempHandle)
	}
	
	// 处理右手柄拖动结果
	const rightHandleStop = (stopX)=>{
		
		let tempHandle = stopSec(stopX)
		
		const minVal = ceilScaleTs(props.leftHandle + resolution.value, resolution.value) // 可以接受的最小值
		const maxVal = Math.min(findNextLargerTime(timeTable.value, props.rightHandle, props.lb, props.ub), (ceilScaleTs(props.leftHandle, resolution.value) + maxMeetingSec.value)) // 可以接受的最大值
		
		rightHandleBlink.value = '' // 只有在非法的时候闪烁
		
		if (tempHandle < minVal) {
			if (props.rightHandle <= minVal) { // 已经是最小值了
				rightHandleBlink.value = 'handle-blink'
				return
			} else { // 还能设为最小值
				tempHandle = minVal
			}
		}
		
		if (tempHandle > maxVal) {
			if (props.rightHandle >= maxVal) { // 已经是最大值了
				rightHandleBlink.value = 'handle-blink'
				return
			} else { // 还能设为最大值
				tempHandle = maxVal
			}
		}
		
		emits('update:rightHandle', tempHandle)
	}
	
	//===================================左手柄========================================

	const handleStartLeft = (event) => {
		emits('changing')
		
		event.stopPropagation();
		event.preventDefault();
		handleDragging.value = true

		handleStartX.value = (event.changedTouches?.[0].clientX) ?? event.clientX
		handleStartHr.value = props.leftHandle
	}
	
	const handleMoveLeft = (event) => {
		event.stopPropagation();
		event.preventDefault();
	
		if (!handleDragging.value) return
			
		const currentX = (event.changedTouches?.[0].clientX) ?? event.clientX
		leftHandleStop(currentX)
	}
	
	const handleEndLeft = (event) => {
		leftHandleBlink.value = '' // 停止拖动，不闪烁
		handleDragging.value = false
	}
	
	//===================================右手柄========================================

	const handleStartRight = (event) => {
		emits('changing')
		
		event.stopPropagation();
		event.preventDefault();
		handleDragging.value = true

		handleStartX.value = (event.changedTouches?.[0].clientX) ?? event.clientX
		handleStartHr.value = props.rightHandle
	}

	const handleMoveRight = (event) => {
		event.stopPropagation();
		event.preventDefault();

		if (!handleDragging) return
		
		const currentX = (event.changedTouches?.[0].clientX) ?? event.clientX
		rightHandleStop(currentX)
	}


	const handleEndRight = (event) => {
		rightHandleBlink.value = ''
		handleDragging.value = false
	}
	
	// ========================================加减号============================================

	const addHalf = (e) => {
		
		emits('changing')
		
		const minVal = ceilScaleTs(props.leftHandle + resolution.value, resolution.value) // 可以接受的最小值
		const maxVal = Math.min(findNextLargerTime(timeTable.value, props.rightHandle, props.lb, props.ub), (ceilScaleTs(props.leftHandle, resolution.value) + maxMeetingSec.value)) // 可以接受的最大值
		
		
		const rightHr = props.rightHandle + resolution.value
		if (rightHr<minVal || rightHr>maxVal) {
			rightHandleBlink.value = ''
			setTimeout(() => {
				rightHandleBlink.value = 'handle-blink-temp'
			}, 100); // 0.1s后刷新动画
			return
		}
	
	
		emits('update:rightHandle', rightHr)
	}

	const minusHalf = (e) => {
		
		emits('changing')
		
		const minVal = ceilScaleTs(props.leftHandle + resolution.value, resolution.value) // 可以接受的最小值
		const maxVal = Math.min(findNextLargerTime(timeTable.value, props.rightHandle, props.lb, props.ub), (ceilScaleTs(props.leftHandle, resolution.value) + maxMeetingSec.value)) // 可以接受的最大值
		
		
		const rightHr = props.rightHandle - resolution.value
		if (rightHr<minVal || rightHr>maxVal) {
			rightHandleBlink.value = ''
			setTimeout(() => {
				rightHandleBlink.value = 'handle-blink-temp'
			}, 100); // 0.1s后刷新动画
	
			return
		}
	
		emits('update:rightHandle', rightHr)
	}
</script>

<template>
	<div :class="{
		'outer-wrapper':true,
		'outer-wrapper-dark': currentTheme=='dark'
	}">
		<ScrollContainer :initPos="handlePositionFloat(leftHandle)" v-model:contentWidth="contentWidth" @changing="$emit('changing')" @touchPos="changeLeft">
			
			<template #tags>
				<div class="tag tag-left" :style="'left:'+((leftHandle-lb)/span)*100+'%;'" v-if="!disabled">
					<div class="tag-text no-select">{{formatTime(leftHandle)}}</div>
					<div class="triangle"></div>
				</div>
				<div class="tag tag-right" :style="'left:'+((rightHandle-lb)/span)*100+'%;'" v-if="!disabled">
					<div class="tag-text no-select">{{formatTime(rightHandle)}}</div>
					<div class="triangle"></div>
				</div>
			</template>
			
			<template #timeline-bar>
				<div :class="{
					'period':true,
					'invalid': item.status===3,
					'to-start':item.status===0,
					'in-progress':item.status===1,
					'disabled':item.status===2
				  }" v-for="(item,i) in timeTable" :key="i" :style="{
				   left:handlePosition(item.start_time),
				   width:handleWidth(item.start_time,item.end_time)
				 }">{{item.text}}</div>
				<div id="my-period" class="period selecting-period" :style="{
						left:handlePosition(leftHandle),
						width:handleWidth(leftHandle,rightHandle)
					}" v-if="!disabled" @touchstart.stop="selectionTranslationStart" @touchmove.stop="selectionTranslationMove"
					@touchend.stop="selectionTranslationEnd" />
				<div id="my-handle-left" :class="'handle handle-left ' + leftHandleBlink" :style="{left:positionLeft}"
					v-if="!disabled" @touchstart.stop="handleStartLeft" @touchmove.stop="handleMoveLeft"
					@touchend.stop="handleEndLeft" />
				<div id="my-handle-right" :class="'handle handle-right ' + rightHandleBlink" :style="{left:positionRight}"
					v-if="!disabled" @touchstart.stop="handleStartRight" @touchmove.stop="handleMoveRight"
					@touchend.stop="handleEndRight" />
			</template>
			
			<template #timeline-scale>
				<div class="number no-select" v-for="(item,i) in hrArray" :key="item">
					{{(item%SEC_PER_HOUR===0)?(new Date(item*1000).getHours()):'.'}}
				</div>
			</template>
			
		</ScrollContainer>
		
		<div class="time-stepper">
			<uni-icons type="minus" size="30" @click="minusHalf" v-if="!disabled"></uni-icons>

			<div class="title" v-if="!disabled">
				{{formatTime(leftHandle)}}-{{formatTime(rightHandle)}},&nbsp;{{tsDiff(leftHandle,rightHandle)}}
			</div>
			<div class="title" v-else>
				{{$t('time.not_available')}}
			</div>


			<uni-icons type="plus" size="30" @click="addHalf" v-if="!disabled"></uni-icons>

		</div>
	</div>
</template>

<style scoped lang="scss">
	:root {
		--time-stepper-font-size: 16rpx;
	}

	.no-select {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	
	.outer-wrapper{
		&-dark {
			.tag-text {
				background-color: var(--dark-color-primary) !important;
			}
		
			.triangle {
				border-top: 0.4rem solid var(--dark-color-primary) !important;
			}
		
			.to-start {
				background-color: var(--dark-color-primary-light) !important;
			}
		
			.in-progress {
				background-color: var(--dark-color-danger-light) !important;
			}
		
			.selecting-period {
				background-color: var(--dark-color-primary) !important;
			}
		
			.handle {
				border: 3rpx solid var(--dark-color-primary) !important;
			}
		}
	}


	.timeline {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 0;
		overflow: hidden;


		.timeline-bar-container {
			width: 100%;
			position: relative;

			.timeline-content {
				width: 100%;
				position: relative;

				.tags {
					position: relative;
					width: 100%;
					padding-bottom: 0.3rem;
					height: 1.3rem;

					.tag {
						position: absolute;
						top: 0;
						left: 0;
						display: flex;
						flex-direction: column;
						align-items: center;
						transform: translateX(-50%);

						.tag-text {
							background-color: var(--color-primary);
							border-radius: 4rpx;
							color: #fff;
							font-size: var(--time-stepper-font-size);
							padding: 0 5rpx;
							height: 20rpx;
							line-height: 20rpx;
						}

						.triangle {
							width: 0;
							height: 0;
							border-left: 0.25rem solid transparent;
							border-right: 0.25rem solid transparent;
							border-top: 0.4rem solid var(--color-primary);
						}
					}
				}

				.timeline-bar {
					position: relative;
					background-color: var(--color-default);
					height: 60rpx;
					border-radius: 0.3rem;
					width: 100%;
					overflow: hidden;

					.period {
						position: absolute;
						z-index: 10;
						top: 0;
						left: 0;
						height: 100%;
						border-radius: 0.3rem;
						text-align: center;
						color: #fff;
						font-size: 10rpx;
						line-height: 60rpx;
					}

					.to-start {
						background-color: var(--color-primary-light);
					}

					.disabled {
						background-color: var(--color-disabled-1); /*稍微深一点*/
						
					}
					
					.invalid {
						background-color: var(--color-disabled);
						z-index: 9; /*下层*/
					}

					.in-progress {
						background-color: var(--color-danger-light);
					}

					.selecting-period {
						background-color: var(--color-primary);
						border-radius: 0;
						z-index: 11;
					}

					.handle {
						box-sizing: border-box;
						border-radius: 6rpx;
						border: 3rpx solid var(--color-primary);
						background-color: #fff;
						position: absolute;
						top: 0;
						left: 0;
						height: 100%;
						width: 22rpx;
						transform: translateX(-50%);
						z-index: 12;
					}

					.handle-blink {
						animation: blink 0.3s infinite ease-in-out;
					}
					
					.handle-blink-temp {
						animation: blink 0.3s 3 ease-in-out;
					}

					@keyframes blink {
						50% {
							background-color: var(--color-danger-light);
						}
					}

				}



				.timeline-scale {
					height: 30rpx;
					padding-top: 10rpx;
					width: 100%;
					display: flex;
					flex-direction: row;
					justify-content: space-between;

					.number {

						font-size: var(--time-stepper-font-size);
						//font-weight: 700;
						color: var(--color-secondary-text);
						transform: translateX(50%);
					}

					.number:first-of-type,
					.number:last-of-type {
						transform: none;
					}

				}
			}

		}

	}

	.time-stepper {
		height: 50rpx;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
		color: #333;

		.title {
			font-size: 14rpx;
			font-weight: 500;
		}
	}
</style>