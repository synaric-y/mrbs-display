<template>
	<div class="mask">
<!-- 		<view class="change-language">
			<LanguageSelect/>
		</view> -->
		
		<div class="left-view">
			<div class="title">{{$t('message.setting.left.basic_info')}}</div>

			<div class="info-list">
				<div class="info-row">
					{{$t('message.setting.left.unique_id')}}: {{basicInfo.id}}
				</div>
				<div class="info-row">
					{{$t('message.setting.left.equipment_type')}}: {{basicInfo.type}}
				</div>
				<div class="info-row">
					{{$t('message.setting.left.battery')}}: {{basicInfo.battery}}
				</div>
				<div class="info-row">
					
				</div>
				<div class="info-row">
					{{$t('message.setting.left.room_area')}}: {{basicInfo.room+" "+basicInfo.area}}
				</div>
				<div class="info-row">
					
				</div>
				<div class="info-row">
					{{$t('message.setting.left.online_status')}}: {{basicInfo.status}}
				</div>
				<div class="info-row">
					
				</div>
				<div class="info-row">
					{{$t('message.setting.left.about_us')}}
				</div>
				<div class="info-row">
					
				</div>
			</div>
			
			<div class="copyright">
				Copyright © 2024 BCC.Global/商霖华通
			</div>
		</div>
		<div class="right-view">
			<div class="header">
				<uni-icons type="left" size="30" @click="cancel"></uni-icons>
				<div class="title">{{$t('message.setting.right.setting')}}</div>
			</div>
			<div class="container">
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.brightness')}}</div>
					<div class="slider-wrapper">
						<slider value="75" @changing="changeBrightness" activeColor="#591bb7" backgroundColor="#ffffff" block-color="#ffffff" block-size="20" />
					</div>
					<div class="slider-value">{{settings.brightness+'%'}}</div>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.volume')}}</div>
					<div class="slider-wrapper">
						<slider value="25" @changing="changeVolume" activeColor="#591bb7" backgroundColor="#ffffff" block-color="#ffffff" block-size="20" />
					</div>
					<div class="slider-value">{{settings.volume+'%'}}</div>
				</div>
				<div class="form-row">
					<div class="form-col">
						<div class="label">{{$t('message.setting.right.area')}}</div>
						<uni-data-select
							class="data-select"
							v-model="settings.area"
							:localdata="areaList"
							:clear="false"
							:placeholder="$t('message.activate.please_select')"
							@change="changeArea"
						></uni-data-select>
					</div>
					<div class="form-col">
						<div class="label">{{$t('message.setting.right.meeting_room')}}</div>
						<uni-data-select
							class="data-select"
							v-model="settings.room"
							:localdata="roomList"
							:placeholder="$t('message.activate.please_select')"
							:clear="false"
						></uni-data-select>
					</div>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.request_url')}}</div>
					<div class="input-wrapper">
						<input class="my-input" v-model="settings.requestURL"/>
					</div>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.time_format')}}</div>
					<uni-data-select
						class="data-select"
						style="width: 90rpx;"
						v-model="settings.timeFormat"
						:localdata="timeFormatList"
						:placeholder="$t('message.activate.please_select')"
						:clear="false"
					></uni-data-select>
				</div>
				<div class="form-row">
					<div class="label">{{$t('message.setting.right.theme_color')}}</div>
					<div class="checkboxes">
						<div class="checkbox-group" v-for="item in themeColorList">
							<div :class="settings.themeColor==item.value?'my-checkbox':'my-checkbox my-checkbox-disabled'" @click="changeThemeColor(item.value)">
								<uni-icons v-if="settings.themeColor==item.value" type="checkmarkempty" color="#591bb7" size="20"></uni-icons>
							</div>
							
							<div class="colors">
								<div v-for="color in item.colors" class="color" :style="'background-color:'+color"></div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="btns">
					<button class="btn" type="default" @click="submit">{{$t('message.setting.right.submit')}}</button>
					<button class="btn btn-default" type="default" @click="cancel">{{$t('message.setting.right.cancel')}}</button>
				</div>
			</div>
		</div>
		
		
		
	</div>
</template>

<script>
import LanguageSelect from '../components/LanguageSelect.vue';
export default {
	name:"SettingView",
	components:{
		LanguageSelect
	},
	emits:['close'],
	data() {
		return {
			basicInfo:{
				id: '0EABD',
				type: 'AT-00',
				battery: '80%',
				room: 'A会议室',
				area: '上海',
				status: '正常'
			},
			settings:{
				brightness: 75,
				volume: 25,
				area: 0,
				room: 0,
				requestURL: 'http://www.meeting.com:1234',
				timeFormat: 0,
				themeColor: 0,
			},

			areaList:[
				{ value: 0, text: "上海" },
				{ value: 1, text: "香港" },
			],
			roomList:[
				{ value: 0, text: "A" },
				{ value: 1, text: "B" },
				{ value: 2, text: "C" },
				{ value: 3, text: "D" },
			],
			timeFormatList:[
				{ value: 0, text: "12小时制" },
				{ value: 1, text: "24小时制" },
			],
			themeColorList:[
				{ value: 0, colors:['#591bb7','#b71b1b']},
				{ value: 1, colors:['#337ecc','#ff7b00']},
			]
		};
	},
	methods:{
		changeBrightness(e){
			this.settings.brightness = e.detail.value
			
			uni.setScreenBrightness({
				value: this.settings.brightness / 100, //亮度是百分比，需要除以100
				success: function () {
					console.log('success');
				}
			});
		},
		changeVolume(e){
			this.settings.volume = e.detail.value
		},
		changeArea(e){
			const tempArea = e
			console.log(tempArea);
		},
		changeThemeColor(v){
			this.settings.themeColor = v
			console.log(v);
		},
		submit(){
			
			console.log(this.settings);
			
			this.$emit('close')
		},
		cancel(){
			this.$emit('close')
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
	background-color: #fff;
	z-index: 999;
	display: flex;
	flex-direction: row;
	
	.left-view{
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		color: #fff;
		margin: 0;
		padding: 20rpx 25rpx 10rpx;
		width: 350rpx;
		height: 100%;
		background-color: #333333;
		font-size: 12rpx;
		
		.title{
			flex-shrink: 0;
			font-size: 18rpx;
			font-weight: 700;
		}
		
		.info-list{
			height: 100%;
			.info-row{
				height: 25rpx;
				line-height: 25rpx;
			}
		}
		
		.copyright{
			flex-shrink: 0;
			font-size: 10rpx;
		}
	}
	
	.right-view{
		display: flex;
		flex-direction: column;
		color: #333;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 15rpx 80rpx 20rpx 30rpx;
		background-color: #d6d6d6;
		
		.header{
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 10rpx;
			margin-bottom: 20rpx;
			
			.title{
				font-size: 15rpx;
			}
		}
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
				flex-shrink: 0;
			}
			
			.checkboxes{
				display: flex;
				align-items: center;
				gap: 30rpx;
				width: 100%;
				
				.checkbox-group{
					display: flex;
					align-items: center;
					gap: 15rpx;
					
					.my-checkbox{
						border: 1rpx solid #591bb7;
						border-radius: 2rpx;
						width: 24px;
						height: 24px;
						display: flex;
						justify-content: center;
						align-items: center;
						transition: all 0.2s;
					}
					
					.my-checkbox-disabled{
						border: 1rpx solid #717171;
						border-radius: 2rpx;
						width: 20px;
						height: 20px;
					}
					
					.colors{
						display: flex;
						align-items: center;
						gap: 15rpx;
						
						.color{
							width: 14rpx;
							height: 14rpx;
						}
					}
				}
			}
			
			
			.slider-wrapper{
				width: 100%;
			}
			.slider-value{
				color: #999;
				min-width: 30rpx;
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
				width: 100%;
				height: 100%;
				color: #333;
				font-size: 12rpx;
			}
			
			.form-col{
				display: flex;
				flex-direction: row;
				gap: 10rpx;
				width: 90%;
			}
		}
		

		
		.btns{
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			width: 100%;
			margin-top: 5rpx;
			
			.btn{
				min-width: 80rpx;
				height: 100%;
				background-color: #591bb7;
				color: #fff;
				margin: 0 0 0 58rpx;
			}
			
			.btn-default{
				background-color: #fff;
				color: #333;
			}
			
		}
	}
	
}
</style>