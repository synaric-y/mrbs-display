// if (lang == 'en') {
// 	this.timezore = 'America/New_York'
// 	this.languageSet = 'en-US,en;q=0.9'
// } else if (lang == 'ko') {
// 	this.timezore = 'Asia/Seoul'
// 	this.languageSet = 'ko-KR,ko;q=0.9'
// } else {
// 	this.timezore = 'Asia/Shanghai'
// 	this.languageSet = 'zh-CN,zh;q=0.9'
// }

const timeZoneMapping = {
	'en': 'America/New_York',
	'ko': 'Asia/Seoul',
	'zh': 'Asia/Shanghai'
}

const languageSetMapping = {
	'en': 'en-US,en;q=0.9',
	'ko': 'ko-KR,ko;q=0.9',
	'zh': 'zh-CN,zh;q=0.9'
}

export {
	timeZoneMapping,
	languageSetMapping
} 