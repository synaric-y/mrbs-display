<template>
	<div :id="'scroll-outer'+marqueeId" class="scroll__outer">
		<div class="scroll__inner" :id="'scroll-inner'+marqueeId" :style="'transform: translateX(-'+currentX+'px)'">
			<p class="scroll__text">{{text}}</p>
			<p :class="showText2?'scroll__text':'scroll__text scroll__text2'" v-if="needScroll">{{text}}</p>
		</div>
	</div>
</template>

<script setup>
	import {
		onMounted,
		ref,watch,nextTick 
	} from 'vue';

	const props = defineProps(['text','marqueeId'])


	const scrollTimer = ref(null)
	const outerWidth = ref(0)
	const innerWidth = ref(0)
	const padding = 20
	

	const needScroll = ref(true)
	const showText2 = ref(true)
	const currentX = ref(0)
	
	// 监听标题变化
	watch(() => props.text, (first, second) => {
	      checkScroll()
	    });

	async function checkScroll(){
		
		if(scrollTimer.value){ // 清除定时器
			clearInterval(scrollTimer.value)
			scrollTimer.value = null
		}
		needScroll.value = true // 恢复两次，用于计算宽度
		showText2.value = false // 隐藏显示
		currentX.value = 0 // 恢复初始位置
		
		// DOM is not updated yet
		
		await nextTick()
		
		// DOM is now updated
		
		// 查询容器
		uni.createSelectorQuery().select('#scroll-outer'+props.marqueeId).boundingClientRect(rect => {
			outerWidth.value = rect.width
			console.log(rect.width);
		}).exec()
		
		uni.createSelectorQuery().select('#scroll-inner'+props.marqueeId).boundingClientRect(rect => {
			innerWidth.value = rect.width
			console.log(rect.width);
		}).exec()
		
		// 等待查询结果
		setTimeout(()=>{
			console.log(outerWidth.value, innerWidth.value);
			
			const middle = innerWidth.value / 2
			
			console.log(middle, outerWidth.value);
			
			if (middle - padding > outerWidth.value) { // 需要开启滚动
				showText2.value = true // 这时显示第二段文字
				scrollTimer.value = setInterval(() => {
					currentX.value = (currentX.value >= middle) ? 1 : (currentX.value + 1)
				}, 50)
			} else {
				needScroll.value = false
			}
		},500)


		

	}
</script>

<style lang="scss" scoped>
	.scroll__outer {
		position: relative;
		overflow: hidden;
		color: #000;
		width: 100%;
		height: 48px;

		.scroll__inner {
			position: absolute;
			left: 0;
			top: 0;
			height: 48px;
			display: flex;
			flex-direction: row;

			.scroll__text {
				height: 48px;
				line-height: 48px;
				padding-right: 20px;
				white-space: nowrap;
				color: #fff;
			}
			
			.scroll__text2{
				opacity: 0;
			}

		}

	}
</style>