<template>
	<div class="mask">
<!-- 		<view class="change-language">
			<LanguageSelect/>
		</view> -->
		<div class="container">
			<div class="title" :style="'font-size:' + (($i18n.locale=='zh')?25:20) +'rpx'">{{$t('message.login.title')}}</div>
			<div class="form-row">
				<div class="label">{{$t('message.login.account_number')}}</div>
				<div class="input-wrapper">
					<input class="my-input" v-model="accountNumber"/>
				</div>
			</div>
			<div class="form-row">
				<div class="label">{{$t('message.login.password')}}</div>
				<div class="input-wrapper">
					<input password class="my-input" v-model="password"/>
				</div>
			</div>
			
			<div class="btns">
				<button class="btn btn-default" type="default" @click="$emit('close')">{{$t('message.login.previous')}}</button>
				<button :class="'btn btn'+(currentTheme!='dark'?'':'-dark')" type="default" @click="finish">{{$t('message.login.confirm')}}</button>
			</div>
		</div>
	</div>
</template>

<script>
// import LanguageSelect from '../components/LanguageSelect.vue';
import {mapGetters} from 'vuex';
import {loginApi} from '@/api/api';
export default {
	name:"ActivateView",
	components:{
		
	},
	emits:['close','previous','success'],
	computed: {
	  ...mapGetters(['currentTheme'])
	},
	data() {
		return {
			accountNumber: '',
			password: ''
		};
	},
	methods:{
		finish(){
			loginApi(
				{
					"username": this.accountNumber,
					"password": this.password
				}
			).then(res=>{
				console.log(res);
				
				
				if(res.data.code!==0&&res.data.code!==1){
					uni.showToast({
						title: this.$t('message.login.login_fail'),
						icon: 'none',
					})
				}else{
					uni.showToast({
						title: this.$t('message.login.login_success'),
						icon: 'none',
					})
					this.$emit('success')
				}
				
			}).catch(e=>{
				console.log(e);
			}).finally(()=>{
				this.accountNumber = ''
				this.password = ''
				
				this.$emit('close')
			})
			
			
		},
		previous(){
			this.$emit('previous')
		}
		
	}
}
</script>

<style lang="scss" scoped>
.mask{
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	background-color: rgba(0,0,0,.5);
	z-index: 999;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	backdrop-filter: blur(3rpx);
	color: #fff;
	
	.btn-dark{
		background-color: var(--dark-color-primary)!important;
	}
	
	.change-language {
		position: fixed;
		top: 24rpx;
		right: 20rpx;
		background-color: rgba(230, 241, 252, 0.25);
		font-size: 12rpx;
		color: white;
		line-height: 22rpx;
		border-radius: 4rpx 4rpx 4rpx 4rpx;
		width: 66rpx;
		height: 22rpx;
		text-align: center;
		z-index: 9999
	}
	
	.container{
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		width: 60%;
		height: 60%;
		
		
		.title{
			width: 100%;
			font-size: 25rpx;
			text-align: center;
			color: #fff;
			margin-bottom: 10rpx;
		}
		
		.form-row{
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: 10rpx;
			font-size: 12rpx;
			height: 25rpx;
			width: 100%;
			
			.label{
				// min-width: 60rpx;
				flex-shrink: 0;
			}
			
			.input-wrapper{
				height: 100%;
				width: 100%;
				border-radius: 3rpx;
				padding: 0 5rpx 0 10rpx;
				background-color: #fff;
				display: flex;
				flex-direction: row;
				gap: 5rpx;
				
				.my-input{
					height: 25rpx;
					line-height: 25rpx;
					width: 100%;
					color: #333;
				}
				
				.scan{
					flex-shrink: 0;
				}
			}
			

			
			.data-select{
				min-width: 90rpx;
				height: 100%;
				color: #333;
				font-size: 12rpx;
			}
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				line-height: 25rpx;
				background-color: #591bb7;
				color: #fff;
			}
			
			.form-col{
				display: flex;
				flex-direction: row;
				gap: 10rpx;
			}
		}
		

		
		.btns{
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			width: 100%;
			margin-top: 30rpx;
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				background-color: var(--color-primary);
				color: #fff;
				margin: 0 0 0 58rpx;
			}
			
			.btn-default{
				background-color: #bebebe;
				color: #fff;
			}
		}
	}
	
}
</style>