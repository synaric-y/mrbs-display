package com.android.HelloH5;

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import io.dcloud.PandoraEntryActivity


public class MyActivity : PandoraEntryActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val adminName = ComponentName("com.bcc.mrbsDisplay","com.android.HelloH5.MyDeviceAdminReceiver") // 被adb设置的admin Component

        // 设为主屏幕
        val filter = IntentFilter(Intent.ACTION_MAIN)
        filter.addCategory(Intent.CATEGORY_HOME)
        filter.addCategory(Intent.CATEGORY_DEFAULT)

        val componentName = ComponentName("com.bcc.mrbsDisplay", "com.android.HelloH5.MyActivity")
        val devicePolicyManager: DevicePolicyManager =
            context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        devicePolicyManager.addPersistentPreferredActivity(adminName, filter, componentName)



        // 常亮
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // 锁定
        val KIOSK_PACKAGE = "com.bcc.mrbsDisplay"


        val context = context
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                as DevicePolicyManager

        dpm.setLockTaskFeatures(
            adminName,
            DevicePolicyManager.LOCK_TASK_FEATURE_NONE)
        dpm.setLockTaskPackages(adminName, arrayOf(KIOSK_PACKAGE))

        if (dpm.isLockTaskPermitted(context.packageName)) {
            println("isLockTaskPermitted")
            startLockTask()
        } else {
            println("notPermitted")
        }

        // 隐藏导航栏
        hideTwoBars()
    }

    // 重新返回
    override fun onResume() {
        super.onResume()

        println("onResume")

//        Handler().postDelayed(Runnable {
//
//        }, 1000)

//        // 隐藏状态栏
//        hideTwoBars()
//
//        // 屏幕锁定
//        val context = context
//        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE)
//                as DevicePolicyManager
//
//        // First, confirm that this package is allowlisted to run in lock task mode.
//        if (dpm.isLockTaskPermitted(context.packageName)) {
//            println("isLockTaskPermitted")
//            startLockTask()
//        } else {
//            // Because the package isn't allowlisted, calling startLockTask() here
//            // would put the activity into screen pinning mode.
//        }
//


    }

    override fun onDestroy() {
        super.onDestroy()

        // 解除锁屏
//        stopLockTask()
    }

    // 屏幕旋转
    override fun onConfigurationChanged(p0: Configuration) {
        super.onConfigurationChanged(p0)

//        println("onConfigurationChanged")
//
//        // 隐藏状态栏
//        hideTwoBars()
    }

    private fun hideTwoBars(){

        println("hideTwoBars")

//        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
//                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
//                or View.SYSTEM_UI_FLAG_FULLSCREEN)

        // 隐藏两个栏
        val windowInsetsController =
            WindowCompat.getInsetsController(window, window.decorView)
        // Configure the behavior of the hidden system bars.

        println(windowInsetsController)
        println(windowInsetsController?.systemBarsBehavior)

        windowInsetsController?.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        println(windowInsetsController?.systemBarsBehavior)

        windowInsetsController?.hide(WindowInsetsCompat.Type.systemBars())

    }

    // 通过反射实现
    private fun setStatusBarDisable() { //调用statusBar的disable方法
//        @SuppressLint("WrongConstant")
//
//        val service = getSystemService("statusbar")
//        try {
//            val statusBarManager = Class.forName("android.app.StatusBarManager")
//            val expand: Method = statusBarManager.getMethod("disable", Int::class.javaPrimitiveType)
//
//            val flag: Int = 0x00200000 or 0x01000000 or 0x00400000 or 0x00010000
//
//            val permissionCheck =
//                ContextCompat.checkSelfPermission(this, STATUS_BAR)
//
//            val MY_REQUEST_CODE = 100;
//            if (permissionCheck != PackageManager.PERMISSION_GRANTED) {
//                ActivityCompat.requestPermissions(
//                    this,
//                    arrayOf<String>(STATUS_BAR),
//                    MY_REQUEST_CODE
//                )
//            } else {
//                expand.invoke(service, flag)
//            }
//
//        } catch (e: Exception) {
//            e.printStackTrace()
//        }
        window.decorView.apply {
            // Hide both the navigation bar and the status bar.
            // SYSTEM_UI_FLAG_FULLSCREEN is only available on Android 4.1 and higher, but as
            // a general rule, you should design your app to hide the status bar whenever you
            // hide the navigation bar.
            systemUiVisibility = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_FULLSCREEN
        }
    }
}
