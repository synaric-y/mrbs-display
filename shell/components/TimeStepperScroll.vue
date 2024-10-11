<script setup>
import {
  begEndTime,
  generateTimeSequence,
  getNearestNextTime,
  hourFormat,
  hrDiff,
  twoDayDiff,
  getNearestScale
} from "@/utils/timeTool.js";
import {onMounted, ref, watch} from "vue";

const fringe = 20 // 左右两边的安全区

const props = defineProps(['lb','ub','meetings','leftHandle','rightHandle','currentDate','disabled','isFirst','scale'])
const emits = defineEmits(["update:leftHandle","update:rightHandle","update:disabled"]);

// 转换成ref变量
const scaleFloat = ref(props.scale / 60) // 30分钟-》0.5 15分钟-》0.25
const timeTable = ref(props.meetings); // 保持响应式连接
const refTimeline = ref(null) // 时间轴dom对象
const span = ref(props.ub-props.lb)
const hrArray = ref([])
const contentWidth = ref(100)
const contentPositionLeft = ref(0)
const zoomIn = 100
const zoomConstant = - (zoomIn/100-1)/(zoomIn/100)

onMounted(()=>{
	
	console.log(props.currentDate);
	
  uni.createSelectorQuery().select('#my-content').boundingClientRect(rect => {
	contentWidth.value = rect.width
	console.log(contentWidth.value);	
  }).exec()

  console.log(props.meetings)

  // 初始化刻度
  hrArray.value = generateTimeSequence(props.lb,props.ub,props.scale)
  
  

  // 处理每个会议的开始结束时间，转为24小时制
  for(let i =0; i<timeTable.value.length; i++){
    const temp = begEndTime(timeTable.value[i].duration)
    timeTable.value[i].leftHr = temp[0]
    timeTable.value[i].rightHr = temp[1]
  }

  // 如果是今天，将先前的几个小时清掉
  invalidatePast()

  // 初始化手柄
  getInitialHandle()
})

function isInteger(obj) {
    return typeof obj === 'number' && obj%1 === 0
}



/*================先前时间失效==================*/
const invalidatePast = ()=>{
  if(twoDayDiff(props.currentDate,new Date())===0){ // 当前日期是今天
    const endHr = getNearestNextTime(new Date(),props.scale)
    timeTable.value.unshift({
      leftHr: props.lb,
      rightHr: endHr,
      status: 2
    })
	timeTable.value.unshift({
	  leftHr: props.ub-1,
	  rightHr: props.ub,
	  status: 2
	})
  }
}

/*================初始化手柄==================*/
const getInitialHandle = ()=>{


  let leftHr = props.lb
  let rightHr = leftHr + scaleFloat.value
  
  console.log(leftHr,rightHr);


  // 不能简单套用fullCheck，因为手柄未初始化
  if(isRightHandleValid(rightHr)&&isBothValid(leftHr,rightHr)&&isCorrectOrder(leftHr,rightHr)){
    emits('update:leftHandle', leftHr)
    emits('update:rightHandle', rightHr)
    return
  }


  for(let i =0; i<timeTable.value.length; i++){
    leftHr = timeTable.value[i].rightHr // 尝试从各个时间段的右边开始
    rightHr = leftHr + scaleFloat.value
	
    // 不能简单套用fullCheck，因为手柄未初始化
    if(isRightHandleValid(rightHr)&&isBothValid(leftHr,rightHr)&&isCorrectOrder(leftHr,rightHr)){

      emits('update:leftHandle', leftHr)
      emits('update:rightHandle', rightHr)
      return
    }
  }

  // 还是找不到，就报错
  // showToast(i18n.global.t('room.notify.full'));
  emits("update:disabled",true)
}



/*==============样式计算函数============*/

// 根据真实值计算左侧定位百分比
const handlePosition = (val) => {
  return ((val - props.lb) / span.value * 100) + '%'
}

// 根据真实值计算宽度
const handleWidth = (leftVal,rightVal) => {
  return ((rightVal - leftVal) / span.value * 100) + '%'
}


// 计算离当前百分比对应的真实值最近的一个刻度（按实际刻度处理）
const getNearestPercentScale = (per) => {
  const currentValue = per * span.value + props.lb
  console.log(currentValue)
  return getNearestScale(currentValue,props.lb,props.ub,props.scale)
}

/*==============手柄逻辑函数============*/
// 检查左值是否非法
const isLeftHandleValid = (left)=>{
  for(let i =0; i<timeTable.value.length; i++){
    if (left >= timeTable.value[i].leftHr && left < timeTable.value[i].rightHr) return false
  }

  if(left < props.lb) return false // 检查是否越界

  return true
}

// 检查右值是否非法
const isRightHandleValid = (right)=>{
  for(let i =0; i<timeTable.value.length; i++){
    if (right > timeTable.value[i].leftHr && right <= timeTable.value[i].rightHr) return false
  }

  if(right > props.ub) return false // 检查是否越界

  return true
}

// 检查是否包含某已有的时间
const isBothValid = (left,right)=>{
  for(let i =0; i<timeTable.value.length; i++){
    if (left <= timeTable.value[i].leftHr && right >= timeTable.value[i].rightHr) return false
  }

  return true
}

// 检查两手柄关系
const isCorrectOrder = (left,right)=>{
  return left<right // 严格小于
}

const fullCheckLeft = (leftHr)=>{
  if(!isLeftHandleValid(leftHr)) return false // 开始时间非法
  if(!isBothValid(leftHr,props.rightHandle)) return false // 产生非法的范围
  if(!isCorrectOrder(leftHr,props.rightHandle)) return false // 错误顺序
  return true
}

const fullCheckRight = (rightHr) => {
  if(!isRightHandleValid(rightHr)) return false // 结束时间非法
  if(!isBothValid(props.leftHandle,rightHr)) return false // 产生非法的范围
  if(!isCorrectOrder(props.leftHandle,rightHr)) return false // 错误顺序
  return true
}

// 综合测试，两手柄都是新的
const fullCheck = (leftHr,rightHr)=>{
  return isLeftHandleValid(leftHr)
      && isRightHandleValid(rightHr)
      && isBothValid(leftHr,rightHr)
      && isCorrectOrder(leftHr,rightHr)
}


/*============================拖动事件：左值===========================*/
const positionLeft = ref(handlePosition(props.leftHandle))

// 监听左值变化，改变绝对定位
watch(() => props.leftHandle, (newValue, oldValue) => {
  positionLeft.value = handlePosition(newValue)
}, { immediate: true })

/*================================拖动事件：右值================================*/
const positionRight = ref(handlePosition(props.rightHandle))

// 监听右值变化，改变绝对定位
watch(() => props.rightHandle, (newValue, oldValue) => {
  positionRight.value = handlePosition(newValue)
}, { immediate: true })


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
const barTapStart = (event)=>{
  event.stopPropagation();
  event.preventDefault();

  startX = (event.changedTouches?.[0].clientX) ?? event.clientX
  startY = (event.changedTouches?.[0].clientY) ?? event.clientY
  startPosition = contentPositionLeft.value
  isMove = false // 初始是没滚动的

  startX = (event.changedTouches?.[0].clientX) ?? event.clientX

}

const barTapMove = (event)=>{

  const moveX = (event.changedTouches?.[0].clientX) ?? event.clientX
  const moveY = (event.changedTouches?.[0].clientY) ?? event.clientY


  if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) { // 滚动了
    isMove = true
  }

}

const barTapEnd = (event)=>{



  if(!isMove){ // 不滚动就是点选
  
    console.log(contentWidth.value);

    const fl = (startX-startPosition)/contentWidth.value-0.01; // 由于style的问题，这个数值偏大了0.01
    console.log(fl)

    const tempLeftHandle = getNearestPercentScale(fl)
    const tempRightHandle = tempLeftHandle + scaleFloat.value

    console.log(tempLeftHandle)

    if(!fullCheck(tempLeftHandle,tempRightHandle)) return

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
const selectionTranslationStart = (event)=>{

  console.log(290);

  selectionStartX.value = event.changedTouches?.[0].clientX ?? event.clientX
  selectionStartLeftHr.value = props.leftHandle
  selectionStartRightHr.value = props.rightHandle

}

const selectionTranslationMove = (event)=>{


  const slice = contentWidth.value / span.value * scaleFloat.value // 半点
  const currentX = event.changedTouches?.[0].clientX ?? event.clientX
  const diff = currentX-selectionStartX.value


  const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数
  const tempLeftHandle = selectionStartLeftHr.value + sliceCnt * scaleFloat.value // 临时变量，新的左右值
  const tempRightHandle = selectionStartRightHr.value + sliceCnt * scaleFloat.value

  if(!fullCheck(tempLeftHandle,tempRightHandle)) return // 两手柄条件错误则返回

  // 改值
  emits('update:leftHandle', tempLeftHandle)
  emits('update:rightHandle', tempRightHandle)
}

const selectionTranslationEnd = (event)=>{


}


const handleStartX = ref(0)
const handleStartHr = ref(0)
let handleDragging = false

const handleStartLeft = (event)=>{
  event.stopPropagation();
  event.preventDefault();
  handleDragging = true


  handleStartX.value = (event.changedTouches?.[0].clientX) ?? event.clientX
  handleStartHr.value = props.leftHandle

}

const handleStartRight = (event)=>{
  event.stopPropagation();
  event.preventDefault();
  handleDragging = true

  handleStartX.value = (event.changedTouches?.[0].clientX) ?? event.clientX
  handleStartHr.value = props.rightHandle

}


const handleMoveLeft = (event)=>{
  event.stopPropagation();
  event.preventDefault();

  if(!handleDragging) return

  const slice = contentWidth.value / span.value * scaleFloat.value // 半点
  const currentX = (event.changedTouches?.[0].clientX) ?? event.clientX
  const diff = currentX-handleStartX.value
  const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数

  const tempHandle = handleStartHr.value + sliceCnt*scaleFloat.value // 临时变量


  if(!fullCheckLeft(tempHandle)) return // 条件错误则返回
  emits('update:leftHandle', tempHandle)
}

const handleMoveRight = (event)=>{
  event.stopPropagation();
  event.preventDefault();

  if(!handleDragging) return

  const slice = contentWidth.value / span.value * scaleFloat.value // 半点
  const currentX = (event.changedTouches?.[0].clientX) ?? event.clientX
  const diff = currentX-handleStartX.value
  const sliceCnt = Math.trunc(diff / slice) // 平移的半小时个数

  const tempHandle = handleStartHr.value + sliceCnt*scaleFloat.value // 临时变量

  if(!fullCheckRight(tempHandle)) return // 条件错误则返回
  emits('update:rightHandle', tempHandle)
}

const handleEndLeft = (event)=>{
}

const handleEndRight = (event)=>{
}

</script>

<template>
  <div>
    <div class="timeline">

      <div class="timeline-bar-container" ref="refContainer">

        <div class="timeline-content"
             ref="refContent"
			 id="my-content"
             :style="{width:zoomIn+'%', left:contentPositionLeft+'px'}"
        >
          <div class="tags">
            <div class="tag tag-left" :style="'left:'+((leftHandle-lb)/span)*100+'%;'" v-if="!disabled">
              <div class="tag-text no-select">{{hourFormat(leftHandle)}}</div>
              <div class="triangle"></div>
            </div>
            <div class="tag tag-right" :style="'left:'+((rightHandle-lb)/span)*100+'%;'" v-if="!disabled">
              <div class="tag-text no-select">{{hourFormat(rightHandle)}}</div>
              <div class="triangle"></div>
            </div>
          </div>
          <div
              class="timeline-bar"
              ref="refTimeline"
              @touchstart="barTapStart"
              @touchmove="barTapMove"
              @touchend="barTapEnd"
          >
            <div :class="{
                    'period':true,
                    'to-start':item.status===0,
                    'in-progress':item.status===1,
                    'disabled':item.status===2
                  }"
                 v-for="(item,i) in timeTable"
                 :key="i"
                 :style="{
                   left:handlePosition(item.leftHr),
                   width:handleWidth(item.leftHr,item.rightHr)
                 }"
            />
            <div class="period selecting-period"
                 :style="{
                    left:handlePosition(leftHandle),
                    width:handleWidth(leftHandle,rightHandle)
                  }"
                 v-if="!disabled"
                 @touchstart="selectionTranslationStart"
                 @touchmove="selectionTranslationMove"
                 @touchend="selectionTranslationEnd"
            />
            <div
                 class="handle handle-left"
                 :style="{left:positionLeft}"
                 v-if="!disabled"
                 @touchstart="handleStartLeft"
                 @touchmove="handleMoveLeft"
                 @touchend="handleEndLeft"
            />
            <div class="handle handle-right"
                 :style="{left:positionRight}"
                 v-if="!disabled"
                 @touchstart="handleStartRight"
                 @touchmove="handleMoveRight"
                 @touchend="handleEndRight"
            />
          </div>
          <div class="timeline-scale">
            <div
                 class="number no-select"
                 v-for="(item,i) in hrArray"
                 :key="item">
              {{isInteger(item)?item:'.'}}
            </div>
          </div>
        </div>
      </div>


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


.timeline{
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;



  .timeline-bar-container{
    width: 100%;
    position: relative;

    .timeline-content{
      width: 100%;
      position: relative;


      .tags{
        position: relative;
        width: 100%;
        padding-bottom: 0.3rem;
        height: 1.3rem;

        .tag{
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateX(-50%);

          .tag-text{
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

      .timeline-bar{
        position: relative;
        background-color: var(--color-default);
        height: 60rpx;
        border-radius: 0.3rem;
        width: 100%;

        .period{
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 0.3rem;
        }
        .to-start{
          background-color: var(--color-primary-light);
        }

        .disabled{
          background-color: var(--color-disabled);
        }

        .in-progress{
          background-color: var(--color-danger-light);
        }

        .selecting-period{
          background-color: var(--color-primary);
          border-radius: 0;
        }

        .handle{
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

          .handle-top{
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



      .timeline-scale{
        height: 45rpx;
		padding-top: 10rpx;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .number{
          
          font-size: var(--time-stepper-font-size);
          //font-weight: 700;
          color: var(--color-secondary-text);
          transform: translateX(50%);
        }

        .number:first-of-type,.number:last-of-type{
          transform: none;
        }

      }
    }

  }

}
</style>