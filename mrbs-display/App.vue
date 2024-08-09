<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// return
			plus.screen.lockOrientation('landscape-primary')
			plus.navigator.setFullscreen(true)

			// var color = plus.android.newObject("android.graphics.Color")
			var ac = plus.android.runtimeMainActivity();
			// var c2int = plus.android.invoke(color, "parseColor", "transparent");
			// console.log("c2int===" + JSON.stringify(c2int))
			var win = plus.android.invoke(ac, "getWindow");
			// console.log("win===" + JSON.stringify(win))
			// -2147483648
			// 134217728
			plus.android.invoke(win, "setNavigationBarColor", 0);
			var dv = plus.android.invoke(win, "getDecorView");
			// plus.android.invoke(win, "addFlags", -2147483648);
			// plus.android.invoke(win, "addFlags", 134217728);
			plus.android.invoke(dv, "setSystemUiVisibility", 256 | 1024 | 512);
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>