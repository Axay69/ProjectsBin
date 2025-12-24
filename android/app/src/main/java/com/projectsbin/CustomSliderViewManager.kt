package com.projectsbin

import android.widget.SeekBar
import android.view.View
import android.content.res.ColorStateList
import android.util.Log
import android.graphics.Color
import android.graphics.PorterDuff
import android.os.Build
import android.graphics.drawable.StateListDrawable
import android.graphics.drawable.GradientDrawable

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.common.MapBuilder

class CustomSliderViewManager : SimpleViewManager<SeekBar>() {

  companion object {
    private const val TAG = "CustomSlider"
    // Keys for View.setTag(key, value)
    private const val USER_TRACKING_TAG_KEY = 0x10000001
    private const val THUMB_SIZE_TAG_KEY = 0x10000002
    private const val THUMB_COLOR_TAG_KEY = 0x10000003
  }

  override fun getName(): String = "CustomSlider"

  override fun createViewInstance(reactContext: ThemedReactContext): SeekBar {
    val seekBar = SeekBar(reactContext)

    seekBar.max = 1000
    seekBar.isEnabled = true
    // Tag flags & cached values
    seekBar.setTag(USER_TRACKING_TAG_KEY, false) // isUserTracking flag
    seekBar.setTag(THUMB_SIZE_TAG_KEY, null)     // thumb size in dp (nullable)
    seekBar.setTag(THUMB_COLOR_TAG_KEY, Color.WHITE) // cached thumb color
    
    // Prevent thumb from scaling on press by using a custom drawable
    // Initialize with default white color
    setupThumbDrawable(seekBar, Color.WHITE, null)

    seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
      override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
        if (fromUser && sb != null) {
          val event = Arguments.createMap().apply {
            putInt("value", progress)
          }
          Log.d(TAG, "Sending onSliderChange event with value=$progress")
          reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(seekBar.id, "topSliderChange", event)
        }
      }

      override fun onStartTrackingTouch(sb: SeekBar?) {
        sb?.let {
          it.setTag(USER_TRACKING_TAG_KEY, true)
          Log.d(TAG, "Sending onSlideStart event")
          val event = Arguments.createMap().apply {
            putString("type", "start")
          }
          reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(it.id, "topSlideStart", event)
        }
      }

      override fun onStopTrackingTouch(sb: SeekBar?) {
        sb?.let {
          it.setTag(USER_TRACKING_TAG_KEY, false)
          val finalProgress = it.progress
          Log.d(TAG, "Sending onSlideEnd event with value=$finalProgress")
          val event = Arguments.createMap().apply {
            putInt("value", finalProgress)
          }
          reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(it.id, "topSlideEnd", event)
        }
      }
    })

    return seekBar
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    return MapBuilder.of(
      "topSliderChange",
      MapBuilder.of("registrationName", "onSliderChange"),
      "topSlideStart",
      MapBuilder.of("registrationName", "onSlideStart"),
      "topSlideEnd",
      MapBuilder.of("registrationName", "onSlideEnd")
    )
  }

  // ================= PROPS =================

  @ReactProp(name = "min")
  fun setMin(view: SeekBar, min: Int) {
    // SeekBar min is always 0, we handle range via max and progress
    // Store min if needed for future calculations
  }

  @ReactProp(name = "max")
  fun setMax(view: SeekBar, max: Int) {
    view.max = if (max > 0) max else 1000
    Log.d(TAG, "setMax: ${view.max}")
  }

  @ReactProp(name = "progress")
  fun setProgress(view: SeekBar, progress: Int) {
    val isUserTracking = view.getTag(USER_TRACKING_TAG_KEY) as? Boolean ?: false
    if (!isUserTracking && view.progress != progress) {
      Log.d(TAG, "setProgress: updating from ${view.progress} to $progress (userTracking=$isUserTracking)")
      view.progress = progress
    } else if (isUserTracking) {
      Log.d(TAG, "setProgress: skipping update (user is tracking)")
    }
  }

  @ReactProp(name = "minimumTrackTintColor")
  fun setMinTrackColor(view: SeekBar, colorString: String?) {
    val color = parseColorOrNull(colorString) ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      view.progressTintList = ColorStateList.valueOf(color)
    } else {
      view.progressDrawable.setColorFilter(color, PorterDuff.Mode.SRC_IN)
    }
  }

  @ReactProp(name = "maximumTrackTintColor")
  fun setMaxTrackColor(view: SeekBar, colorString: String?) {
    val color = parseColorOrNull(colorString) ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      view.progressBackgroundTintList = ColorStateList.valueOf(color)
    } else {
      view.progressDrawable.mutate().setColorFilter(color, PorterDuff.Mode.SRC_ATOP)
    }
  }

  @ReactProp(name = "thumbTintColor")
  fun setThumbColor(view: SeekBar, colorString: String?) {
    val color = parseColorOrNull(colorString) ?: Color.WHITE
    // Cache color on the view so size updates can reuse it
    view.setTag(THUMB_COLOR_TAG_KEY, color)
    val thumbSizeDp = view.getTag(THUMB_SIZE_TAG_KEY) as? Int
    setupThumbDrawable(view, color, thumbSizeDp)
  }

  @ReactProp(name = "thumbSize", defaultInt = 0)
  fun setThumbSize(view: SeekBar, sizeDp: Int) {
    val effectiveSizeDp = if (sizeDp > 0) sizeDp else null
    view.setTag(THUMB_SIZE_TAG_KEY, effectiveSizeDp)

    val color = (view.getTag(THUMB_COLOR_TAG_KEY) as? Int) ?: Color.WHITE
    setupThumbDrawable(view, color, effectiveSizeDp)
  }

  private fun setupThumbDrawable(seekBar: SeekBar, color: Int, sizeDp: Int?) {
    val thumbColor = color
    val density = seekBar.context.resources.displayMetrics.density

    val thumbSizePx = when {
      sizeDp != null && sizeDp > 0 -> (sizeDp * density).toInt()
      else -> {
        val originalThumb = seekBar.thumb
        if (originalThumb != null && originalThumb.intrinsicWidth > 0) {
          originalThumb.intrinsicWidth
        } else {
          (24 * density).toInt()
        }
      }
    }

    // Create a simple circle drawable without state changes
    val thumbDrawable = GradientDrawable().apply {
      shape = GradientDrawable.OVAL
      setColor(thumbColor)
      setSize(thumbSizePx, thumbSizePx)
    }

    // Create a state list drawable that always shows the same drawable
    // regardless of pressed/selected state (prevents scaling)
    val stateListDrawable = StateListDrawable().apply {
      addState(intArrayOf(), thumbDrawable) // Default state
      addState(intArrayOf(android.R.attr.state_pressed), thumbDrawable) // Pressed state (same)
      addState(intArrayOf(android.R.attr.state_selected), thumbDrawable) // Selected state (same)
      addState(intArrayOf(android.R.attr.state_focused), thumbDrawable) // Focused state (same)
    }

    seekBar.thumb = stateListDrawable
  }

  private fun parseColorOrNull(colorString: String?): Int? {
    if (colorString.isNullOrBlank()) return null
    return try {
      Color.parseColor(colorString)
    } catch (_: IllegalArgumentException) {
      null
    }
  }
}
