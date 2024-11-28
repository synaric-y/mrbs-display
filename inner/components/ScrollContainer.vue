<script setup>
	import {
		onMounted,
		ref,
		watch
	} from "vue";

	import _ from 'lodash'
	import {
		Decimal
	} from "decimal.js";


	const props = defineProps(["initPos", "contentWidth"])
	const emits = defineEmits(["touchPos", "update:contentWidth","changing"]);


	
	
	const zoomIn = 400 // 放大倍率
	const zoomConstant = (zoomIn - 100) / zoomIn


	// ref DOM元素
	const refContent = ref(null) // 滚动区域
	const refContainer = ref(null) // 外部容器（一屏宽度）
	
	// 元素坐标值（需要动态查询）
	const contentWidth = ref(100) // 滚动区域总宽度（一般不变）
	const contentPositionLeft = ref(0) // 滚动区域距离屏幕左侧的位置
	const containerPositionLeft = ref(0) // 容器距离屏幕左侧的位置（一般不变）
	const containerPositionRight = ref(0) // 容器距离屏幕右侧的位置（一般不变）

	
	// 界限值（两ref需要动态查询）
	const fringe = 50 // 左右两边的安全区，单位px
	const minX = ref(fringe) // 最小的left（负数，-(2/3个content的宽度+20)+containerPositionLeft，2/3和倍率有关）
	const maxX = ref(fringe) // 最大的left（正数，20+containerPositionLeft）
	
	onMounted(() => {
	
		// 查询容器
		uni.createSelectorQuery().select('#my-container').boundingClientRect(rect => {
			containerPositionLeft.value = rect.left
			containerPositionRight.value = rect.right
			console.log(rect);
		}).exec()
	
		// 查询内部滚动区域
		uni.createSelectorQuery().select('#my-content').boundingClientRect(rect => {
			contentWidth.value = rect.width
			
			emits("update:contentWidth",contentWidth.value)
			
			contentPositionLeft.value = rect.left
			minX.value = -(zoomConstant * contentWidth.value + fringe) + containerPositionLeft.value
			maxX.value = fringe + containerPositionLeft.value

			contentPositionLeft.value = _.clamp((- props.initPos * contentWidth.value)+(contentWidth.value/(zoomIn/100))/2+fringe,minX.value,maxX.value)
			
			// console.log(rect);
		}).exec()
	
	
	})


	
	var startX = 0
	var startY = 0
	var startPosition = 0 // 起始的滚动区域位置
	var isMove = false
	

	
	const barTapStart = (event) => {
		emits('changing')
		
		event.stopPropagation();
		event.preventDefault();
	
		startX = (event.changedTouches?.[0].clientX) ?? event.clientX
		startY = (event.changedTouches?.[0].clientY) ?? event.clientY
	
		// 异步获取内部滚动元素（content）相对窗口左边缘的位置
		uni.createSelectorQuery().select('#my-content').boundingClientRect(rect => {
	
			startPosition = contentPositionLeft.value = rect.left
	
		}).exec()
	
		isMove = false // 初始是没滚动的
	}
	
	const barTapMove = (event) => {
	
		const moveX = (event.changedTouches?.[0].clientX) ?? event.clientX
		const moveY = (event.changedTouches?.[0].clientY) ?? event.clientY
	
	
		if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) { // 滚动了
			isMove = true
	
			const deltaX = moveX - startX
	
			let tempLeft = Math.round(startPosition + deltaX) // 浮点数坐标会影响渲染速度
			
			console.log(tempLeft, minX.value, maxX.value);
	
			if (!_.inRange(tempLeft, minX.value, maxX.value)) return // 超出边界返回
	
			contentPositionLeft.value = tempLeft
	
		}
	
	
	}
	
	const barTapEnd = (event) => {
	
	
		if (!isMove) { // 不滚动就是点选
		
			const fl = (startX - startPosition) / contentWidth.value;
				
			emits('touchPos',fl)
		}
	
	}
	

</script>

<template>
	<div class="timeline">

		<div class="timeline-bar-container" ref="refContainer" id="my-container">

			<div :class="'timeline-content timeline-content'"
				ref="refContent"
				id="my-content"
				:style="{width:zoomIn+'%', left:(contentPositionLeft-containerPositionLeft)+'px'}"
				@touchstart="barTapStart" 
				@touchmove="barTapMove" 
				@touchend="barTapEnd">
				<div class="tags">
					<slot name="tags"></slot>
				</div>
				<div class="timeline-bar" ref="refTimeline">
					<slot name="timeline-bar"></slot>
				</div>
				<div class="timeline-scale">
					<slot name="timeline-scale"></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">

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
				}

				.timeline-bar {
					position: relative;
					background-color: var(--color-default);
					height: 60rpx;
					border-radius: 0.3rem;
					width: 100%;
					overflow: hidden;
				}

				.timeline-scale {
					height: 30rpx;
					padding-top: 10rpx;
					width: 100%;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
				}
			}

		}

	}
</style>