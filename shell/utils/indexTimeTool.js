import moment from 'moment-timezone';
function formatDate(timestamp, timeZone, locale, dateFormat) {
	return moment.unix(timestamp)
		.tz(timeZone)
		.locale(locale)
		.format(dateFormat);
}

function displayHM(timestamp,locale) {
	let dateFormat = 'hh:mm A';
	const koDate = formatDate(timestamp, 'Asia/Seoul', 'ko', dateFormat);
	const enDate = formatDate(timestamp, 'America/New_York', 'en', dateFormat);
	const zhDate = formatDate(timestamp, 'Asia/Shanghai', 'zh-cn', dateFormat);
	let parts = null;
	console.log(locale);
	if (locale == 'en') {
		parts = enDate.split(' ');
	} else if (locale == 'ko') {
		parts = koDate.split(' ');
	} else {
		parts = zhDate.split(' ');
	}
	//console.log('displayHM am pm :', parts);
	const timeMinute = parts[0];
	const ap = parts[1];
	return timeMinute + ' ' + ap;
}

function dateDisplayLocale(timestamp,locale) {
	// console.log('dateDisplay now_timestamp', timestamp);
	let dateFormat = 'YYYY年MM月DD日';
	if (locale == 'en') {
		dateFormat = 'MMMM D, YYYY';
	} else if (locale == 'ko') {
		dateFormat = 'YYYY년MM월DD일';
	} else {
		dateFormat = 'YYYY年MM月DD日';
	}
	const displayAP = displayHM(timestamp,locale);
	const koDate = formatDate(timestamp, 'Asia/Seoul', 'ko', dateFormat);
	const enDate = formatDate(timestamp, 'America/New_York', 'en', dateFormat);
	const zhDate = formatDate(timestamp, 'Asia/Shanghai', 'zh-cn', dateFormat);
	
	let nowlanguageTime = displayAP + '  '
	if (locale == 'en') {
		nowlanguageTime += enDate;
	} else if (locale == 'ko') {
		nowlanguageTime += koDate;
	} else {
		nowlanguageTime += zhDate;
	}
	// console.log('dateDisplay now_timestamp currenlanguageTime', nowlanguageTime);
	
	return nowlanguageTime
}

function formatTime(timestamp) {
	// 将10位时间戳转换为Date对象
	var date = new Date(timestamp * 1000);
	// 获取小时和分钟
	var hours = date.getHours().toString().padStart(2, '0');
	var minutes = date.getMinutes().toString().padStart(2, '0');
	// 返回格式化的时间字符串
	return hours + ':' + minutes;
}

function getTimestamp(year, month, day, hour, minute) {
	// 注意：JavaScript 中的月份从 0 开始，所以需要减 1
	const date = new Date(year, month - 1, day, hour, minute, 0, 0); // 秒和毫秒设置为0
	return Math.floor(date.getTime() / 1000); // 将毫秒转为秒
}

export {
	dateDisplayLocale,
	formatDate,
	formatTime,
	getTimestamp

}