package com.projectsbin
import expo.modules.ReactActivityDelegateWrapper

import android.content.res.Configuration
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments
import com.facebook.react.ReactApplication

class MainActivity : ReactActivity() {

  override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    emitPipEvent(isInPictureInPictureMode)
  }

  override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode)
    emitPipEvent(isInPictureInPictureMode)
  }

  private fun emitPipEvent(isInPip: Boolean) {
    val app = application as ReactApplication
    val manager = app.reactNativeHost.reactInstanceManager
    val context = manager.currentReactContext
    if (context != null) {
      val params = Arguments.createMap().apply { putBoolean("isInPip", isInPip) }
      context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onPipStateChange", params)
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "ProjectsBin"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))
}
