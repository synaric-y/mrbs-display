<template>
	<view>
		<ocSelect :title="$t('message.index.right.language')" :localdata="datasource" @change="changeLang"/>
	</view>
</template>

<script>
	import ocSelect from '../components/oc-select.vue'
	export default {
		name:"LanguageSelect",
		components:{
			ocSelect
		},
		emits:['update'],

		data() {
			return {
				datasource: [{
					value: 0,
					text: '中文',
					key: 'zh'
				}, {
					value: 1,
					text: 'English',
					key: 'en'
				}, {
					value: 2,
					text: '한국인',
					key: 'ko'
				}],
			};
		},
		methods:{
			changeLang(index) {
				var lang = this.datasource[index].key

				console.log('lang selected lang', lang)
				this.$i18n.locale = lang
				uni.setStorageSync('lang', lang); //加缓存
				
				this.$emit('update')
			},
		}
	}
</script>

<style>

</style>