package com.projectsbin

import android.app.ActivityManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class PipActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        when (action) {
            PipModule.ACTION_PREV_10 -> emit(context, "prev10")
            PipModule.ACTION_NEXT_10 -> emit(context, "next10")
            PipModule.ACTION_PLAY_PAUSE -> emit(context, "togglePlayPause")
            PipModule.ACTION_RESTORE -> restoreToForeground(context)
            PipModule.ACTION_CLOSE -> closeApp(context)
        }
    }

    private fun emit(context: Context, control: String) {
        try {
            val app = context.applicationContext as ReactApplication
            val manager = app.reactNativeHost.reactInstanceManager
            val reactContext = manager.currentReactContext
            val params = Arguments.createMap().apply { putString("action", control) }
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(PipModule.PIP_CONTROL_EVENT, params)
        } catch (_: Exception) { }
    }

    private fun restoreToForeground(context: Context) {
        try {
            val intent = Intent(context, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            context.startActivity(intent)
        } catch (_: Exception) { }
    }

    private fun closeApp(context: Context) {
        try {
            val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            am.appTasks.forEach { it.finishAndRemoveTask() }
        } catch (_: Exception) { }
    }
}

