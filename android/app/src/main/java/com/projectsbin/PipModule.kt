package com.projectsbin

import android.app.PictureInPictureParams
import android.app.PendingIntent
import android.app.RemoteAction
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Rational
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat

class PipModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "PipModule"
        const val PIP_EVENT_NAME = "onPipStateChange"
        const val PIP_CONTROL_EVENT = "pipControl"
        const val ACTION_PREV_10 = "com.projectsbin.pip.PREV_10"
        const val ACTION_PLAY_PAUSE = "com.projectsbin.pip.PLAY_PAUSE"
        const val ACTION_NEXT_10 = "com.projectsbin.pip.NEXT_10"
        const val ACTION_CLOSE = "com.projectsbin.pip.CLOSE"
        const val ACTION_RESTORE = "com.projectsbin.pip.RESTORE"
    }

    private var mediaSession: MediaSessionCompat? = null

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun enterPip(width: Int, height: Int, promise: Promise) {
        try {
            val activity = reactApplicationContext.currentActivity
            if (activity == null) {
                promise.reject("ERROR", "Activity is null")
                return
            }

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                promise.reject("ERROR", "Picture-in-Picture is not supported on this Android version")
                return
            }

            if (!activity.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)) {
                promise.reject("ERROR", "Picture-in-Picture is not supported on this device")
                return
            }

            val ratio = if (width > 0 && height > 0) Rational(width, height) else Rational(16, 9)
            val actions = buildPipActions(reactApplicationContext, isPlaying = true)
            val builder = PictureInPictureParams.Builder()
                .setAspectRatio(ratio)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder.setActions(actions)
            }
            val pipParams = builder.build()

            val success = activity.enterPictureInPictureMode(pipParams)
            if (success) {
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Failed to enter Picture-in-Picture mode")
            }

        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to start PIP: ${e.message}")
        }
    }

    @ReactMethod
    fun isPipSupported(promise: Promise) {
        try {
            val context = reactApplicationContext
            val isSupported = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                    context.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
            promise.resolve(isSupported)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun isInPipMode(promise: Promise) {
        try {
            val activity = reactApplicationContext.currentActivity
            if (activity == null) {
                promise.resolve(false)
                return
            }

            val inPipMode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                activity.isInPictureInPictureMode
            } else {
                false
            }
            promise.resolve(inPipMode)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun updatePipControls(isPlaying: Boolean) {
        try {
            val activity = reactApplicationContext.currentActivity ?: return
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val actions = buildPipActions(reactApplicationContext, isPlaying)
            val ratio = Rational(16, 9)
            val params = PictureInPictureParams.Builder()
                .setAspectRatio(ratio)
                .setActions(actions)
                .build()
            activity.setPictureInPictureParams(params)
        } catch (_: Exception) { }
    }

    @ReactMethod
    fun initMediaSession() {
        try {
            val context = reactApplicationContext
            if (mediaSession != null) return
            val session = MediaSessionCompat(context, "ProjectsBinMediaSession")
            session.setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() { emitControl("togglePlayPause") }
                override fun onPause() { emitControl("togglePlayPause") }
                override fun onSkipToNext() { emitControl("next10") }
                override fun onSkipToPrevious() { emitControl("prev10") }
                override fun onFastForward() { emitControl("next10") }
                override fun onRewind() { emitControl("prev10") }
            })
            session.isActive = true
            mediaSession = session
            updatePlaybackState(true, 0.0)
        } catch (_: Exception) { }
    }

    @ReactMethod
    fun updatePlaybackState(isPlaying: Boolean, positionMs: Double) {
        try {
            val session = mediaSession ?: return
            val actions = PlaybackStateCompat.ACTION_PLAY or
                    PlaybackStateCompat.ACTION_PAUSE or
                    PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                    PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                    PlaybackStateCompat.ACTION_FAST_FORWARD or
                    PlaybackStateCompat.ACTION_REWIND
            val state = PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(
                    if (isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED,
                    positionMs.toLong(),
                    1.0f
                )
                .build()
            session.setPlaybackState(state)
        } catch (_: Exception) { }
    }

    fun sendPipStateChange(isInPip: Boolean) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            val params = Arguments.createMap().apply {
                putBoolean("isInPip", isInPip)
            }
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(PIP_EVENT_NAME, params)
        }
    }

    private fun buildPipActions(context: Context, isPlaying: Boolean): List<RemoteAction> {
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT else PendingIntent.FLAG_UPDATE_CURRENT

        val prevIntent = Intent().setClassName(context, "com.projectsbin.PipActionReceiver").setAction(ACTION_PREV_10)
        val nextIntent = Intent().setClassName(context, "com.projectsbin.PipActionReceiver").setAction(ACTION_NEXT_10)
        val toggleIntent = Intent().setClassName(context, "com.projectsbin.PipActionReceiver").setAction(ACTION_PLAY_PAUSE)
        val closeIntent = Intent().setClassName(context, "com.projectsbin.PipActionReceiver").setAction(ACTION_CLOSE)
        val restoreIntent = Intent().setClassName(context, "com.projectsbin.PipActionReceiver").setAction(ACTION_RESTORE)

        val prevPI = PendingIntent.getBroadcast(context, 1, prevIntent, flags)
        val togglePI = PendingIntent.getBroadcast(context, 2, toggleIntent, flags)
        val nextPI = PendingIntent.getBroadcast(context, 3, nextIntent, flags)
        val closePI = PendingIntent.getBroadcast(context, 4, closeIntent, flags)
        val restorePI = PendingIntent.getBroadcast(context, 5, restoreIntent, flags)

        val prevIcon = Icon.createWithResource(context, android.R.drawable.ic_media_previous)
        val nextIcon = Icon.createWithResource(context, android.R.drawable.ic_media_next)
        val playIcon = Icon.createWithResource(context, android.R.drawable.ic_media_play)
        val pauseIcon = Icon.createWithResource(context, android.R.drawable.ic_media_pause)
        val closeIcon = Icon.createWithResource(context, android.R.drawable.ic_menu_close_clear_cancel)
        val restoreIcon = Icon.createWithResource(context, android.R.drawable.ic_menu_upload)

        val prev = RemoteAction(prevIcon, "Prev 10s", "Seek back 10 seconds", prevPI)
        val toggle = RemoteAction(if (isPlaying) pauseIcon else playIcon, if (isPlaying) "Pause" else "Play", "Toggle playback", togglePI)
        val next = RemoteAction(nextIcon, "Next 10s", "Seek forward 10 seconds", nextPI)
        val close = RemoteAction(closeIcon, "Close", "Close video", closePI)
        val restore = RemoteAction(restoreIcon, "Back to original", "Restore full screen", restorePI)

        return listOf(prev, toggle, next, close, restore)
    }

    private fun emitControl(action: String) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            val params = Arguments.createMap().apply { putString("action", action) }
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(PIP_CONTROL_EVENT, params)
        }
    }
}
