<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// return
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('landscape')
			plus.navigator.setFullscreen(true)

			var ac = plus.android.runtimeMainActivity();
			var win = plus.android.invoke(ac, "getWindow");
			plus.android.invoke(win, "setNavigationBarColor", 0);
			var dv = plus.android.invoke(win, "getDecorView");
			plus.android.invoke(dv, "setSystemUiVisibility", 256 | 1024 | 512);
			// WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
			plus.android.invoke(win, "addFlags", 128);
			// #endif
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