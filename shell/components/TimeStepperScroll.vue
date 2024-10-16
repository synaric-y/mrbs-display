<script setup>
	import {
		SEC_PER_HOUR,
		generateTsSequence,
		tsDiff,
		nextScaleTs,
		nearestScaleTs
	} from "@/utils/timestampTool.js";

	import {
		formatTime
	} from "@/utils/indexTimeTool.js";

	import {
		computed,
		onMounted,
		ref,
		watch
	} from "vue";

	import {
		Decimal
	} from 'decimal.js';
	
	import store from '@/store/index.js'//需要引入store

	const fringe = 20 // 左右两边的安全区

	const props = defineProps(['lb', 'ub', 'meetings', 'leftHandle', 'rightHandle', 'currentTime', 'disabled', 'isFirst',
		'scale'
	])
	const emits = defineEmits(["update:leftHandle", "update:rightHandle", "update:disabled"]);

	// 转换成ref变量
	const scaleFloat = ref(props.scale / 60) // 30分钟-》0.5 15分钟-》0.25
	const timeTable = ref([]); // 保持响应式连接
	const refTimeline = ref(null) // 时间轴dom对象
	const span = ref(props.ub - props.lb)
	const hrArray = ref([])
	const contentWidth = ref(100)
	const contentPositionLeft = ref(0)
	const zoomIn = 100
	const zoomConstant = -(zoomIn / 100 - 1) / (zoomIn / 100)

	onMounted(() => {

		console.log(props.currentTime);
		console.log(props.ub);

		uni.createSelectorQuery().select('#my-content').boundingClientRect(rect => {
			contentWidth.value = rect.width
			contentPositionLeft.value = rect.left
			console.log(contentWidth.value,contentPositionLeft.value);
		}).exec()

		console.log(props.meetings)

		// 初始化刻度
		hrArray.value = generateTsSequence(props.lb, props.ub, props.scale * 60)

		console.log(hrArray.value);

		// 如果是今天，将先前的几个小时清掉
		invalidatePast()
		
		formatMeetings()
		
		console.log(timeTable.value);

		// 初始化手柄
		getInitialHandle()
	})
	
	const currentTheme = computed(()=>{
		return store.getters.currentTheme
	})

	function isInteger(obj) {
		return typeof obj === 'number' && obj % 1 === 0
	}



	/*================先前时间失效==================*/
	const invalidatePast = () => {
		const endTs = nextScaleTs(props.currentTime, props.scale * 60)


		timeTable.value.unshift({
			start_time: props.lb,
			end_time: endTs,
			status: 2
		})
		timeTable.value.unshift({
			start_time: props.ub - SEC_PER_HOUR,
			end_time: props.ub,
			status: 2
		})
		
		console.log(timeTable.value);
	}
	
	/*==================格式化==================*/
	const formatMeetings=()=>{
		for(let entry of props.meetings){
			
			// 去除不在范围内的会议
			if(entry.start_time>props.ub) continue
			if(entry.end_time<props.lb) continue
			
		    timeTable.value.push({
			    id: entry.id,
			    start_time: Math.max(entry.start_time,props.lb), // 截断越界的部分
			    end_time: Math.min(props.ub,entry.end_time),
			    status: entry.entry_type==99?2:entry.entry_type
		    })
		}
	}

	/*================初始化手柄==================*/
	const getInitialHandle = () => {


		let left = props.lb
		let right = left + props.scale * 60

		console.log(left, right);


		// 不能简单套用fullCheck，因为手柄未初始化
		if (isRightHandleValid(right) && isBothValid(left, right) && isCorrectOrder(left, right)) {
			emits('update:leftHandle', left)
			emits('update:rightHandle', right)
			return
		}


		for (let i = 0; i < timeTable.value.length; i++) {
			left = timeTable.value[i].end_time // 尝试从各个时间段的右边开始
			right = left + props.scale * 60

			// 不能简单套用fullCheck，因为手柄未初始化
			if (isRightHandleValid(right) && isBothValid(left, right) && isCorrectOrder(left, right)) {
				emits('update:leftHandle', left)
				emits('update:rightHandle', right)
				return
			}
		}

		// 还是找不到，就报错
		// showToast(i18n.global.t('room.notify.full'));
		emits("update:disabled", true)
	}



	/*==============样式计算函数============*/

	// 根据真实值计算左侧定位百分比
	const handlePosition = (val) => {
		return Number(new Decimal(val).minus(props.lb).dividedBy(span.value).times(100)) + '%'
	}

	// 根据真实值计算宽度
	const handleWidth = (leftVal, rightVal) => {
		return Number(new Decimal(rightVal).minus(leftVal).dividedBy(span.value).times(100)) + '%'
	}


	// 0.37 -> 最近的时间戳
	const getNearestPercentScale = (per) => {
		const currentValue = Number(new Decimal(per).times(span.value).plus(props.lb))
		console.log(currentValue)
		return nearestScaleTs(currentValue, props.lb, props.ub, props.scale * 60)
	}

	/*==============手柄逻辑函数============*/
	// 检查左值是否非法
	const isLeftHandleValid = (left) => {
		if (left < props.lb) return false // 检查是否越界

		for (let i = 0; i < timeTable.value.length; i++) {
			if (left >= timeTable.value[i].start_time && left < timeTable.value[i].end_time) return false
		}

		return true
	}

	// 检查右值是否非法
	const isRightHandleValid = (right) => {
		if (right > props.ub) return false // 检查是否越界

		for (let i = 0; i < timeTable.value.length; i++) {
			if (right > timeTable.value[i].start_time && right <= timeTable.value[i].end_time) return false
		}

		return true
	}

	// 检查是否包含某已有的时间
	const isBothValid = (left, right) => {
		for (let i = 0; i < timeTable.value.length; i++) {
			if (left <= timeTable.value[i].start_time && right >= timeTable.value[i].end_time) return false
		}

		return true
	}

	// 检查两手柄关系
	const isCorrectOrder = (left, right) => {
		return left < right // 严格小于
	}

	const fullCheckLeft = (left) => {
		if (!isLeftHandleValid(left)) return false // 开始时间非法
		if (!isBothValid(left, props.rightHandle)) return false // 产生非法的范围
		if (!isCorrectOrder(left, props.rightHandle)) return false // 错误顺序
		return true
	}

	const fullCheckRight = (right) => {
		if (!isRightHandleValid(right)) return false // 结束时间非法
		if (!isBothValid(props.leftHandle, right)) return false // 产生非法的范围
		if (!isCorrectOrder(props.leftHandle, right)) return false // 错误顺序
		return true
	}

	// 综合测试，两手柄都是新的
	const fullCheck = (left, right) => {
		return isLeftHandleValid(left) &&
			isRightHandleValid(right) &&
			isBothValid(left, right) &&
			isCorrectOrder(left, right)
	}


	/*============================拖动事件：左值===========================*/
	const positionLeft = ref(handlePosition(props.leftHandle))

	// 监听左值变化，改变绝对定位
	watch(() => props.leftHandle, (newValue, oldValue) => {
		positionLeft.value = handlePosition(newValue)
	}, {
		immediate: true
	})

	/*================================拖动事件：右值================================*/
	const positionRight = ref(handlePosition(props.rightHandle))

	// 监听右值变化，改变绝对定位
	watch(() => props.rightHandle, (newValue, oldValue) => {
		positionRight.value = handlePosition(newValue)
	}, {
		immediate: true
	})


	// ref DOM元素
	const refContent = ref(null)
	const refContainer = ref(null)


	/**
	 * 点选新时间事件
	 * 中层
	 * 不冒泡
	 * 阻止左滑刷新
	 * */
	var startX = 0
	var startY = 0
	var startPosition = 0
	var isMove = false
	const barTapStart = (event) => {
		event.stopPropagation();
		event.preventDefault();

		startX = (event.changedTouches?.[0].clientX) ?? event.clientX
		startY = (event.changedTouches?.[0].clientY) ?? event.clientY
		startPosition = contentPositionLeft.value
		isMove = false // 初始是没滚动的

		startX = (event.changedTouches?.[0].clientX) ?? event.clientX

	}

	const barTapMove = (event) => {

		const moveX = (event.changedTouches?.[0].clientX) ?? event.clientX
		const moveY = (event.changedTouches?.[0].clientY) ?? event.clientY


		if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) { // 滚动了
			isMove = true
		}

	}

	const barTapEnd = (event) => {



		if (!isMove) { // 不滚动就是点选
		

			console.log(contentWidth.value);

			const fl = (startX - startPosition) / contentWidth.value; // 由于style的问题，这个数值偏大了0.01
			console.log(fl)

			const tempLeftHandle = getNearestPercentScale(fl)
			const tempRightHandle = tempLeftHandle + (SEC_PER_HOUR * (props.scale/60))

			console.log(tempLeftHandle)

			if (!fullCheck(tempLeftHandle, tempRightHandle)) return

			// 改值
			emits('update:leftHandle', tempLeftHandle)
			emits('update:rightHandle', tempRightHandle)

		}
	}

	/**
	 * 选区整体左右平移事件
	 * 上层
	 * 不冒泡
	 * 阻止左滑刷新
	 * */
	const selectionStartX = ref(0)
	const selectionStartLeftHr = ref(0)
	const selectionStartRightHr = ref(0)
	const selectionTranslationStart = (event) => {

		console.log(290);

		selectionStartX.value = event.changedTouches?.[0].clientX ?? event.clientX
		selectionStartLeftHr.value = props.leftHandle
		selectionStartRightHr.value = props.rightHandle

	}

	const selectionTranslationMove = (event) => {


		const slice = Number(new Decimal(props.scale).times(60).dividedBy(span.value).times(contentWidth.value)) // 半点
		const currentX = event.changedTouches?.[0].clientX ?? event.clientX
		const diff = currentX - selectionStartX.value


		const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数
		const tempLeftHandle = selectionStartLeftHr.value + sliceCnt * props.scale * 60 // 临时变量，新的左右值
		const tempRightHandle = selectionStartRightHr.value + sliceCnt * props.scale * 60

		if (!fullCheck(tempLeftHandle, tempRightHandle)) return // 两手柄条件错误则返回

		// 改值
		emits('update:leftHandle', tempLeftHandle)
		emits('update:rightHandle', tempRightHandle)
	}

	const selectionTranslationEnd = (event) => {


	}


	const handleStartX = ref(0)
	const handleStartHr = ref(0)
	let handleDragging = false

	const handleStartLeft = (event) => {
		event.stopPropagation();
		event.preventDefault();
		handleDragging = true


		handleStartX.value = (event.changedTouches?.[0].clientX) ?? event.clientX
		handleStartHr.value = props.leftHandle

	}

	const handleStartRight = (event) => {
		event.stopPropagation();
		event.preventDefault();
		handleDragging = true

		handleStartX.value = (event.changedTouches?.[0].clientX) ?? event.clientX
		handleStartHr.value = props.rightHandle

	}


	const handleMoveLeft = (event) => {
		event.stopPropagation();
		event.preventDefault();

		if (!handleDragging) return

		const slice = Number(new Decimal(props.scale).times(60).dividedBy(span.value).times(contentWidth.value)) // 半点
		const currentX = (event.changedTouches?.[0].clientX) ?? event.clientX
		const diff = currentX - handleStartX.value
		const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数

		const tempHandle = handleStartHr.value + sliceCnt * props.scale * 60 // 临时变量


		if (!fullCheckLeft(tempHandle)) return // 条件错误则返回
		emits('update:leftHandle', tempHandle)
	}

	const handleMoveRight = (event) => {
		event.stopPropagation();
		event.preventDefault();

		if (!handleDragging) return


		const slice = Number(new Decimal(props.scale).times(60).dividedBy(span.value).times(contentWidth.value)) // 半点
		const currentX = (event.changedTouches?.[0].clientX) ?? event.clientX
		const diff = currentX - handleStartX.value
		const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数

		const tempHandle = handleStartHr.value + sliceCnt * props.scale * 60 // 临时变量

		if (!fullCheckRight(tempHandle)) return // 条件错误则返回
		emits('update:rightHandle', tempHandle)
	}

	const handleEndLeft = (event) => {}

	const handleEndRight = (event) => {}

	const addHalf = (e) => {
		const rightHr = props.rightHandle + props.scale * 60
		if (!fullCheckRight(rightHr)) return

		emits('update:rightHandle', rightHr)
	}

	const minusHalf = (e) => {
		const rightHr = props.rightHandle - props.scale * 60
		if (!fullCheckRight(rightHr)) return

		emits('update:rightHandle', rightHr)
	}
</script>

<template>
	<div>
		<div class="timeline">

			<div class="timeline-bar-container" ref="refContainer">

				<div :class="'timeline-content timeline-content'+(currentTheme!='dark'?'':'-dark')" ref="refContent" id="my-content"
					:style="{width:zoomIn+'%'}">
					<div class="tags">
						<div class="tag tag-left" :style="'left:'+((leftHandle-lb)/span)*100+'%;'" v-if="!disabled">
							<div class="tag-text no-select">{{formatTime(leftHandle)}}</div>
							<div class="triangle"></div>
						</div>
						<div class="tag tag-right" :style="'left:'+((rightHandle-lb)/span)*100+'%;'" v-if="!disabled">
							<div class="tag-text no-select">{{formatTime(rightHandle)}}</div>
							<div class="triangle"></div>
						</div>
					</div>
					<div class="timeline-bar" ref="refTimeline" @touchstart="barTapStart" @touchmove="barTapMove"
						@touchend="barTapEnd">
						<div :class="{
							'period':true,
							'to-start':item.status===0,
							'in-progress':item.status===1,
							'disabled':item.status===2
						  }" v-for="(item,i) in timeTable" :key="i" :style="{
						   left:handlePosition(item.start_time),
						   width:handleWidth(item.start_time,item.end_time)
						 }">{{item.status!==2 ? $t('message.fast_meeting.reserved'):''}}</div>
						<div class="period selecting-period" 
							:style="{
								left:handlePosition(leftHandle),
								width:handleWidth(leftHandle,rightHandle)
							}" 
							v-if="!disabled" 
							@touchstart="selectionTranslationStart" 
							@touchmove="selectionTranslationMove"
							@touchend="selectionTranslationEnd" />
						<div class="handle handle-left" :style="{left:positionLeft}" v-if="!disabled"
							@touchstart="handleStartLeft" @touchmove="handleMoveLeft" @touchend="handleEndLeft" />
						<div class="handle handle-right" :style="{left:positionRight}" v-if="!disabled"
							@touchstart="handleStartRight" @touchmove="handleMoveRight" @touchend="handleEndRight" />
					</div>
					<div class="timeline-scale">
						<div class="number no-select" v-for="(item,i) in hrArray" :key="item">
							{{(item%SEC_PER_HOUR===0)?(new Date(item*1000).getHours()):'.'}}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="time-stepper">
			<uni-icons type="minus" size="30" @click="minusHalf" v-if="!disabled"></uni-icons>

			<div class="title" v-if="!disabled">
				{{formatTime(leftHandle)}}-{{formatTime(rightHandle)}},&nbsp;{{tsDiff(leftHandle,rightHandle)}}
			</div>
			<div class="title" v-else>
				{{$t('time.notAvailable')}}
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


	.timeline {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 0;



		.timeline-bar-container {
			width: 100%;
			position: relative;

			.timeline-content {
				width: 100%;
				position: relative;
				
				&-dark{
					.tag-text {
						background-color: var(--dark-color-primary)!important;
					}
					.triangle {
						border-top: 0.4rem solid var(--dark-color-primary)!important;
					}
					
					.to-start {
						background-color: var(--dark-color-primary-light)!important;
					}
					
					.in-progress {
						background-color: var(--dark-color-danger-light)!important;
					}
					
					.selecting-period {
						background-color: var(--dark-color-primary)!important;
					}
					
					.handle {
						border: 3rpx solid var(--dark-color-primary)!important;
					}
				}
				


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
						background-color: var(--color-disabled);
					}

					.in-progress {
						background-color: var(--color-danger-light);
					}

					.selecting-period {
						background-color: var(--color-primary);
						border-radius: 0;
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

						.handle-top {
							position: absolute;
							border-radius: 8rpx;
							top: 50%;
							left: 0.05rem;
							height: 60rpx;
							width: 100%;
							transform: translateY(-50%) translateX(-0.1rem);
							background-color: #fff;
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