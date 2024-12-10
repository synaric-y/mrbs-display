package com.android.HelloH5

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast

class MyDeviceAdminReceiver : DeviceAdminReceiver(){


    override fun onEnabled(context: Context, intent: Intent) =
        println("MDA Enabled")

    override fun onDisabled(context: Context, intent: Intent) =
        println("MDA Disabled")
}