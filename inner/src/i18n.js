import { createI18n } from "vue-i18n";
import zhLocale from './locale/zh.json'
import enLocale from './locale/en.json'
import koLocale from './locale/ko.json'

const messages = {
	"zh": zhLocale,
	"en": enLocale,
	"ko": koLocale
}

const i18n = createI18n({
	legacy: false, // 解决vue2兼容问题
	locale: uni.getStorageSync('lang') || 'zh', // 先从本地缓存拿，没有就是中文
	globalInjection: true, // 解决vue2兼容问题
	messages
})
export default i18n