<template>
	<view>
		<button size="default" type="default" class="select-btn" id="my-btn"
		style="color:#ffffff;backgroundColor:rgba(230, 241, 252, 0.25);borderColor:#1AAD19"
		hover-class="is-hover" @click="clickBtn">{{title}}</button>
	</view>
	<div v-if="listShow" class="mask" @click="toggleList">
		<div class="list" :style="{'left': x+'px','top': y+'px'}">
			<div class="triangle"></div>
			<div class="list-inner" >
				<div v-for="item in localdata" :key="item.key" class="list-item" @click="selectItem($event,item.value)">
					{{item.text}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name:"ocSelect",
		props: ["title","localdata"],
		mounted(){

		},
		methods:{
			clickBtn(){
				let btn=uni.createSelectorQuery().select('#my-btn');
				const that = this
				btn.boundingClientRect(rect=>{
					that.x = rect.left
					that.y = rect.top  + rect.height
					
					that.toggleList()
				}).exec();
				
				console.log(42);
			},
			toggleList(){
				this.listShow = !this.listShow
			},
			selectItem(e,v){
				e.preventDefault();
				e.stopPropagation();
				
				this.toggleList();
				this.$emit('change',v);
			},
		},
		data() {
			return {
				listShow: false,
				x: 0,
				y: 0
			};
		}
	}
</script>

<style lang="scss" scoped>
	.select-btn {
		width: 66rpx;
		height: 22rpx;
		border-radius: 4rpx;
		background-color: rgba(230, 241, 252, 0.25);
		font-size: 12rpx;
		color: white;
		line-height: 22rpx;
		text-align: center;
	}
	
	.mask{
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-color: transparent;
		z-index: 999;
		

		
		.list{
			position: absolute;
			top: 0;
			left: 0;
			z-index: 1000;
			
			
			.triangle{
				position: relative;
				top: 0;
				left: 50%;
				width: 0;
				height: 0; 
				border-bottom: 8.66rpx solid #fff ; // 5*根号3
				border-left: 5rpx solid transparent;
				border-right: 5rpx solid transparent;
				border-top: 0;
				transform: translateX(-50%);
			}
			
			.list-inner{
				
				display: flex;
				flex-direction: column;
				gap: 2rpx;
				width: 66rpx;
				border-radius: 2rpx;
				padding: 2rpx;
				background-color: #fff;
				box-shadow: 0rpx 2rpx 3rpx 2rpx rgba(0,0,0,.15);

				
				.list-item{
					font-size: 14rpx;
					color: #333;
					line-height: 2.5;
					text-align: center;
					z-index: 1001;
				}
			}
		}
		
		
	}
	

</style>