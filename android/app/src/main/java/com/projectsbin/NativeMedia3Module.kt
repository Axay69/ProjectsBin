package com.projectsbin

import android.net.Uri
import android.media.MediaMetadataRetriever
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.transformer.Effects
import androidx.media3.effect.MatrixTransformation
import androidx.media3.effect.SpeedChangeEffect
import androidx.media3.effect.Presentation
import androidx.media3.effect.OverlayEffect
import androidx.media3.effect.BitmapOverlay
import androidx.media3.effect.TextureOverlay
import androidx.media3.effect.Crop
import androidx.media3.common.audio.SonicAudioProcessor
import androidx.media3.common.audio.SpeedProvider
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.Composition
import androidx.media3.transformer.Transformer
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import java.io.File
import java.io.FileOutputStream
import com.google.common.collect.ImmutableList

class NativeMedia3Module(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "NativeMedia3Module"

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun processVideo(inputUri: String, config: ReadableMap, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val mediaItemBuilder = MediaItem.Builder().setUri(uri)
      
      // 1. Trim
      if (config.hasKey("trim")) {
        val trim = config.getMap("trim")!!
        val start = if (trim.hasKey("start")) trim.getDouble("start").toLong() else 0L
        val end = if (trim.hasKey("end")) trim.getDouble("end").toLong() else Long.MAX_VALUE
        
        mediaItemBuilder.setClippingConfiguration(
          MediaItem.ClippingConfiguration.Builder()
            .setStartPositionMs(start)
            .setEndPositionMs(end)
            .build()
        )
      }

      val videoEffects = mutableListOf<androidx.media3.common.Effect>()
      val audioProcessors = mutableListOf<androidx.media3.common.audio.AudioProcessor>()

      // 2. Speed
      if (config.hasKey("speed")) {
        val speedVal = config.getDouble("speed").toFloat()
        videoEffects.add(SpeedChangeEffect(speedVal))
        val sonic = SonicAudioProcessor()
        sonic.setSpeed(speedVal)
        sonic.setPitch(1f)
        audioProcessors.add(sonic)
      }

      // 3. Rotate
      if (config.hasKey("rotation")) {
        val rotationDegrees = config.getDouble("rotation").toFloat()
        val rotation = MatrixTransformation { _ ->
          val m = android.graphics.Matrix()
          m.postRotate(rotationDegrees)
          m
        }
        videoEffects.add(rotation)
      }

      // 4. Crop
      if (config.hasKey("crop")) {
        val cropMap = config.getMap("crop")!!
        val left = cropMap.getDouble("left").toFloat()
        val top = cropMap.getDouble("top").toFloat()
        val right = cropMap.getDouble("right").toFloat()
        val bottom = cropMap.getDouble("bottom").toFloat()

        val retriever = MediaMetadataRetriever()
        retriever.setDataSource(reactApplicationContext, uri)
        val width = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
        val height = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
        retriever.release()

        if (width > 0 && height > 0) {
           val nLeft = (left / width) * 2 - 1
           val nRight = (right / width) * 2 - 1
           val nTop = 1 - (top / height) * 2
           val nBottom = 1 - (bottom / height) * 2
           videoEffects.add(Crop(nLeft, nRight, nBottom, nTop))
        }
      }

      // 5. Overlay
      if (config.hasKey("overlay")) {
        val overlayMap = config.getMap("overlay")!!
        val text = overlayMap.getString("text") ?: ""
        val x = overlayMap.getDouble("x").toFloat()
        val y = overlayMap.getDouble("y").toFloat()
        
        // Get dimensions if not already
        val retriever = MediaMetadataRetriever()
        retriever.setDataSource(reactApplicationContext, uri)
        val width = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
        val height = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
        retriever.release()

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply {
          color = Color.WHITE
          textSize = 100f
          isAntiAlias = true
          style = Paint.Style.FILL
          setShadowLayer(10f, 0f, 0f, Color.BLACK)
        }
        canvas.drawText(text, x, y, paint)
        val overlay = BitmapOverlay.createStaticBitmapOverlay(bitmap)
        videoEffects.add(OverlayEffect(ImmutableList.of<TextureOverlay>(overlay)))
      }

      // 6. Flip
      if (config.hasKey("flip")) {
         val flipMap = config.getMap("flip")!!
         val h = if (flipMap.hasKey("horizontal")) flipMap.getBoolean("horizontal") else false
         val v = if (flipMap.hasKey("vertical")) flipMap.getBoolean("vertical") else false
         if (h || v) {
             val flipEffect = MatrixTransformation { _ ->
                val m = android.graphics.Matrix()
                m.postScale(if (h) -1f else 1f, if (v) -1f else 1f)
                m
             }
             videoEffects.add(flipEffect)
         }
      }
      
      // 7. Compression / Resolution (Presentation)
      var mimeType = MimeTypes.VIDEO_H264
      if (config.hasKey("compression")) {
          val comp = config.getString("compression")
          if (comp == "HEVC_720P") {
              mimeType = MimeTypes.VIDEO_H265
              // Resize to 720p height?
              // Calculate width preserving aspect ratio
               val retriever = MediaMetadataRetriever()
               retriever.setDataSource(reactApplicationContext, uri)
               val width = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
               val height = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
               retriever.release()
               
               if (height > 720) {
                   val scale = 720f / height
                   val newW = (width * scale).toInt()
                   val alignedW = alignTo16(newW)
                   val alignedH = alignTo16(720)
                   videoEffects.add(Presentation.createForWidthAndHeight(alignedW, alignedH, Presentation.LAYOUT_SCALE_TO_FIT))
               }
          }
      }

      val editedMediaItem = EditedMediaItem.Builder(mediaItemBuilder.build())
        .setEffects(Effects(audioProcessors, videoEffects))
        .build()

      val outPath = outputFile("processed")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(mimeType)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(editedMediaItem, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  private fun toFileUri(input: String): Uri {
    return if (input.startsWith("file://")) {
      Uri.parse(input)
    } else {
      Uri.parse("file://$input")
    }
  }

  private fun outputFile(namePrefix: String): String {
    val dir = reactApplicationContext.cacheDir
    val file = File(dir, "${namePrefix}_${System.currentTimeMillis()}.mp4")
    return file.absolutePath
  }

  private fun alignTo16(value: Int): Int {
    return (value / 16) * 16
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun addTextOverlay(inputUri: String, text: String, x: Float, y: Float, startMs: Double, endMs: Double, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val retriever = MediaMetadataRetriever()
      retriever.setDataSource(reactApplicationContext, uri)
      val durationMs = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      val width = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val height = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
      retriever.release()

      val overlayStart = maxOf(0L, startMs.toLong())
      val overlayEnd = minOf(durationMs, endMs.toLong())
      
      // Create Bitmap with text
      val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)
      val paint = Paint().apply {
        color = Color.WHITE
        textSize = 100f
        isAntiAlias = true
        style = Paint.Style.FILL
        setShadowLayer(10f, 0f, 0f, Color.BLACK)
      }
      canvas.drawText(text, x, y, paint)
      
      val overlay = BitmapOverlay.createStaticBitmapOverlay(bitmap)
      val overlayEffect = OverlayEffect(ImmutableList.of<TextureOverlay>(overlay))

      // Sequence: [0, start] -> [start, end] (overlay) -> [end, dur]
      val parts = mutableListOf<EditedMediaItem>()
      
      // Part 1: Before overlay
      if (overlayStart > 0) {
        val clip1 = MediaItem.ClippingConfiguration.Builder()
          .setEndPositionMs(overlayStart)
          .build()
        val item1 = MediaItem.Builder().setUri(uri).setClippingConfiguration(clip1).build()
        parts.add(EditedMediaItem.Builder(item1).build())
      }

      // Part 2: With overlay
      if (overlayEnd > overlayStart) {
        val clip2 = MediaItem.ClippingConfiguration.Builder()
          .setStartPositionMs(overlayStart)
          .setEndPositionMs(overlayEnd)
          .build()
        val item2 = MediaItem.Builder().setUri(uri).setClippingConfiguration(clip2).build()
        val edited2 = EditedMediaItem.Builder(item2)
          .setEffects(Effects(emptyList(), listOf(overlayEffect)))
          .build()
        parts.add(edited2)
      }

      // Part 3: After overlay
      if (overlayEnd < durationMs) {
        val clip3 = MediaItem.ClippingConfiguration.Builder()
          .setStartPositionMs(overlayEnd)
          .build()
        val item3 = MediaItem.Builder().setUri(uri).setClippingConfiguration(clip3).build()
        parts.add(EditedMediaItem.Builder(item3).build())
      }

      val sequence = EditedMediaItemSequence(parts)
      val composition = Composition.Builder(sequence).build()
      
      val outPath = outputFile("text_overlay")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(composition, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun rotate(inputUri: String, degrees: Float, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val retriever = MediaMetadataRetriever()
      retriever.setDataSource(reactApplicationContext, uri)
      val width = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val height = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
      retriever.release()

      val item = MediaItem.fromUri(uri)
      
      val rotation = MatrixTransformation { _ ->
        val m = android.graphics.Matrix()
        m.postRotate(degrees)
        m
      }

      val rotInt = degrees.toInt()
      // If rotated 90 or 270, swap width/height
      // Note: This assumes simple 90 degree increments.
      // For arbitrary rotation, we'd need bounding box calculation, but keeping it simple for now.
      val newWidth = if (rotInt % 180 != 0) height else width
      val newHeight = if (rotInt % 180 != 0) width else height

      // Align to 16 just in case, though usually input is already aligned or encoder handles it.
      // But safe to align.
      val alignedW = alignTo16(newWidth)
      val alignedH = alignTo16(newHeight)

      val presentation = Presentation.createForWidthAndHeight(alignedW, alignedH, Presentation.LAYOUT_SCALE_TO_FIT)
        
      val edited = EditedMediaItem.Builder(item)
        .setEffects(Effects(emptyList(), listOf(rotation, presentation)))
        .build()
        
      val outPath = outputFile("rotate")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()
      transformer.start(edited, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun flip(inputUri: String, horizontal: Boolean, vertical: Boolean, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val item = MediaItem.fromUri(uri)
      
      val flipEffect = androidx.media3.effect.MatrixTransformation { _ ->
        val m = android.graphics.Matrix()
        m.postScale(if (horizontal) -1f else 1f, if (vertical) -1f else 1f)
        m
      }
        
      val edited = EditedMediaItem.Builder(item)
        .setEffects(Effects(emptyList(), listOf(flipEffect)))
        .build()
        
      val outPath = outputFile("flip")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()
      transformer.start(edited, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun crop(inputUri: String, left: Float, top: Float, right: Float, bottom: Float, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val retriever = MediaMetadataRetriever()
      retriever.setDataSource(reactApplicationContext, uri)
      val width = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val height = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
      retriever.release()
      
      // Convert pixels to normalized coordinates [-1, 1]
      // Left: -1, Right: 1. Top: 1, Bottom: -1 (OpenGL style)
      // Input coords: (0,0) is Top-Left.
      
      val nLeft = (left / width) * 2 - 1
      val nRight = (right / width) * 2 - 1
      val nTop = 1 - (top / height) * 2
      val nBottom = 1 - (bottom / height) * 2
      
      // Media3 Crop: (left, right, bottom, top) in range [-1, 1]
      val cropEffect = Crop(nLeft, nRight, nBottom, nTop)
      
      val item = MediaItem.fromUri(uri)
      val edited = EditedMediaItem.Builder(item)
        .setEffects(Effects(emptyList(), listOf(cropEffect)))
        .build()

      val outPath = outputFile("crop")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()
      transformer.start(edited, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun extractFrame(inputUri: String, timeMs: Double, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val retriever = MediaMetadataRetriever()
      retriever.setDataSource(reactApplicationContext, uri)
      
      val bitmap = retriever.getFrameAtTime((timeMs * 1000).toLong(), MediaMetadataRetriever.OPTION_CLOSEST)
      retriever.release()
      
      if (bitmap == null) {
        promise.reject("ERROR", "Failed to extract frame")
        return
      }
      
      val dir = reactApplicationContext.cacheDir
      val file = File(dir, "frame_${System.currentTimeMillis()}.jpg")
      val stream = FileOutputStream(file)
      bitmap.compress(Bitmap.CompressFormat.JPEG, 90, stream)
      stream.close()
      
      promise.resolve("file://${file.absolutePath}")
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun cut(inputUri: String, startCutMs: Double, endCutMs: Double, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val retriever = MediaMetadataRetriever()
      retriever.setDataSource(reactApplicationContext, uri)
      val durationMs = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      retriever.release()

      val cutStart = maxOf(0L, startCutMs.toLong())
      val cutEnd = minOf(durationMs, endCutMs.toLong())
      
      // Part 1: 0 to startCut
      val clip1 = MediaItem.ClippingConfiguration.Builder()
        .setStartPositionMs(0)
        .setEndPositionMs(cutStart)
        .build()
      val item1 = MediaItem.Builder().setUri(uri).setClippingConfiguration(clip1).build()
      val edited1 = EditedMediaItem.Builder(item1).build()

      // Part 2: endCut to duration
      val clip2 = MediaItem.ClippingConfiguration.Builder()
        .setStartPositionMs(cutEnd)
        .setEndPositionMs(durationMs)
        .build()
      val item2 = MediaItem.Builder().setUri(uri).setClippingConfiguration(clip2).build()
      val edited2 = EditedMediaItem.Builder(item2).build()

      val sequence = EditedMediaItemSequence(edited1, edited2)
      val composition = Composition.Builder(sequence).build()

      val outPath = outputFile("cut")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(composition, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun mergeTopBottom(inputA: String, inputB: String, promise: Promise) {
    try {
      val uriA = toFileUri(inputA)
      val uriB = toFileUri(inputB)

      val retrieverA = MediaMetadataRetriever()
      val retrieverB = MediaMetadataRetriever()
      retrieverA.setDataSource(reactApplicationContext, uriA)
      retrieverB.setDataSource(reactApplicationContext, uriB)
      val durA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      val durB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      val rotA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION) ?: "0").toInt()
      val widthA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val heightA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
      
      val rotB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION) ?: "0").toInt()
      val widthB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val heightB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()

      retrieverA.release()
      retrieverB.release()
      val minDur = minOf(durA, durB)

      val dispWA = if (rotA % 180 == 0) widthA else heightA
      val dispHA = if (rotA % 180 == 0) heightA else widthA
      val dispWB = if (rotB % 180 == 0) widthB else heightB
      val dispHB = if (rotB % 180 == 0) heightB else widthB

      val rawW = maxOf(dispWA, dispWB)
      val scaleA = if (dispWA > 0) rawW.toFloat() / dispWA.toFloat() else 1f
      val scaleB = if (dispWB > 0) rawW.toFloat() / dispWB.toFloat() else 1f
      
      val Ha = dispHA * scaleA
      val Hb = dispHB * scaleB
      val rawH = Ha + Hb

      val maxH = 1920f 
      val globalScale = if (rawH > maxH) maxH / rawH else 1f
      
      val targetH = (rawH * globalScale).toInt()
      val targetW = (rawW * globalScale).toInt()

      val alignedH = alignTo16(targetH)
      val alignedW = alignTo16(targetW)

      val clipA = MediaItem.ClippingConfiguration.Builder().setEndPositionMs(minDur).build()
      val clipB = MediaItem.ClippingConfiguration.Builder().setEndPositionMs(minDur).build()

      val itemA = MediaItem.Builder().setUri(uriA).setClippingConfiguration(clipA).build()
      val itemB = MediaItem.Builder().setUri(uriB).setClippingConfiguration(clipB).build()

      val presentation = Presentation.createForWidthAndHeight(
        alignedW,
        alignedH,
        Presentation.LAYOUT_STRETCH_TO_FIT
      )

      val topEffect = MatrixTransformation { _ ->
        val m = android.graphics.Matrix()
        val heightRatio = if (rawH > 0) Ha / rawH else 0.5f
        m.postScale(1f, heightRatio)
        m.postTranslate(0f, -1f + heightRatio)
        m
      }

      val bottomEffect = MatrixTransformation { _ ->
        val m = android.graphics.Matrix()
        val heightRatio = if (rawH > 0) Hb / rawH else 0.5f
        m.postScale(1f, heightRatio)
        m.postTranslate(0f, 1f - heightRatio)
        m
      }

      val editedA = EditedMediaItem.Builder(itemA)
        .setEffects(Effects(emptyList<androidx.media3.common.audio.AudioProcessor>(), listOf(topEffect, presentation)))
        .build()

      val editedB = EditedMediaItem.Builder(itemB)
        .setEffects(Effects(emptyList<androidx.media3.common.audio.AudioProcessor>(), listOf(bottomEffect, presentation)))
        .build()

      val seqA = EditedMediaItemSequence(editedA)
      val seqB = EditedMediaItemSequence(editedB)

      val composition = Composition.Builder(seqA, seqB).build()

      val outPath = outputFile("vstack")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(composition, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun imageToVideo(imageUri: String, durationMs: Double, promise: Promise) {
    try {
      val uri = toFileUri(imageUri)
      val dur = durationMs.toLong()
      
      val mediaItem = MediaItem.Builder()
        .setUri(uri)
        .setImageDurationMs(dur)
        .build()
        
      val edited = EditedMediaItem.Builder(mediaItem).setFrameRate(30).build()
      
      val outPath = outputFile("img2vid")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(edited, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun transcode(inputUri: String, width: Double, height: Double, bitrate: Double, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
        
      var editedBuilder = EditedMediaItem.Builder(MediaItem.fromUri(uri))
       
       // Resize if width/height provided > 0
       if (width > 0 && height > 0) {
          val w = alignTo16(width.toInt())
          val h = alignTo16(height.toInt())
          val presentation = Presentation.createForWidthAndHeight(w, h, Presentation.LAYOUT_SCALE_TO_FIT)
          editedBuilder.setEffects(Effects(emptyList(), listOf(presentation)))
       }
       
       val edited = editedBuilder.build()
       val outPath = outputFile("transcode")
       
       val transformerBuilder = Transformer.Builder(reactApplicationContext)
         .setVideoMimeType(MimeTypes.VIDEO_H264)
         .setAudioMimeType(MimeTypes.AUDIO_AAC)
       
       // Bitrate requires VideoEncoderSettings but Media3 Transformer defaults usually work best.
       // Explicit bitrate control in Transformer is tricky without forcing re-encoding params.
       // However, we can use setVideoMimeType and let it optimize.
       // If strict bitrate is needed, we would need a custom EncoderFactory.
       // For now, we rely on default, or we can assume "compress" means standard H264 profile.
       
       val transformer = transformerBuilder
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }
          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()
        
       transformer.start(edited, outPath)
     } catch (e: Exception) {
       promise.reject("ERROR", e.message)
     }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun trim(inputUri: String, startMs: Double, endMs: Double, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val retriever = MediaMetadataRetriever()
      retriever.setDataSource(reactApplicationContext, uri)
      val durationMs = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      retriever.release()

      val safeStart = maxOf(0L, startMs.toLong())
      val safeEnd = if (endMs > 0) minOf(durationMs, endMs.toLong()) else durationMs
      val finalStart = minOf(safeStart, safeEnd)
      val finalEnd = maxOf(safeEnd, finalStart)
      val clipping = MediaItem.ClippingConfiguration.Builder()
        .setStartPositionMs(finalStart)
        .setEndPositionMs(finalEnd)
        .build()

      val mediaItem = MediaItem.Builder()
        .setUri(uri)
        .setClippingConfiguration(clipping)
        .build()

      val edited = EditedMediaItem.Builder(mediaItem).build()

      val outPath = outputFile("trim")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }

          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(edited, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun changeSpeed(inputUri: String, speed: Double, preservePitch: Boolean, promise: Promise) {
    try {
      val uri = toFileUri(inputUri)
      val mediaItem = MediaItem.fromUri(uri)

      val speedProvider = object : SpeedProvider {
        override fun getSpeed(presentationTimeUs: Long): Float = speed.toFloat()
        override fun getNextSpeedChangeTimeUs(presentationTimeUs: Long): Long = Long.MAX_VALUE
      }

      val audioProcessor = SonicAudioProcessor().apply {
        setSpeed(speed.toFloat())
        setPitch(speed.toFloat())
      }

      val videoSpeed = SpeedChangeEffect(speedProvider)

      val edited = EditedMediaItem.Builder(mediaItem)
        .setEffects(Effects(listOf(audioProcessor), listOf(videoSpeed)))
        .build()

      val outPath = outputFile("speed_${speed}")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }

          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(edited, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @OptIn(UnstableApi::class)
  @ReactMethod
  fun mergeSideBySide(inputA: String, inputB: String, promise: Promise) {
    try {
      val uriA = toFileUri(inputA)
      val uriB = toFileUri(inputB)

      val retrieverA = MediaMetadataRetriever()
      val retrieverB = MediaMetadataRetriever()
      retrieverA.setDataSource(reactApplicationContext, uriA)
      retrieverB.setDataSource(reactApplicationContext, uriB)
      val durA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      val durB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0").toLong()
      val rotA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION) ?: "0").toInt()
      val widthA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val heightA = (retrieverA.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()
      
      val rotB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION) ?: "0").toInt()
      val widthB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH) ?: "0").toInt()
      val heightB = (retrieverB.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT) ?: "0").toInt()

      retrieverA.release()
      retrieverB.release()
      val minDur = minOf(durA, durB)

      val dispWA = if (rotA % 180 == 0) widthA else heightA
      val dispHA = if (rotA % 180 == 0) heightA else widthA
      val dispWB = if (rotB % 180 == 0) widthB else heightB
      val dispHB = if (rotB % 180 == 0) heightB else widthB

      val rawH = maxOf(dispHA, dispHB)
      val scaleA = if (dispHA > 0) rawH.toFloat() / dispHA.toFloat() else 1f
      val scaleB = if (dispHB > 0) rawH.toFloat() / dispHB.toFloat() else 1f
      
      val Wa = dispWA * scaleA
      val Wb = dispWB * scaleB
      val rawW = Wa + Wb

      // Limit resolution to avoid codec exceptions (e.g. > 4K width or weird dimensions)
      // Cap height at 1080p which is safe for most devices
      val maxH = 1080f 
      val globalScale = if (rawH > maxH) maxH / rawH else 1f
      
      val targetH = (rawH * globalScale).toInt()
      val targetW = (rawW * globalScale).toInt()

      // Align dimensions to multiples of 16 to ensure encoder compatibility
      val alignedH = (targetH / 16) * 16
      val alignedW = (targetW / 16) * 16

      val clipA = MediaItem.ClippingConfiguration.Builder()
        .setStartPositionMs(0)
        .setEndPositionMs(minDur)
        .build()
      val clipB = MediaItem.ClippingConfiguration.Builder()
        .setStartPositionMs(0)
        .setEndPositionMs(minDur)
        .build()

      val itemA = MediaItem.Builder().setUri(uriA).setClippingConfiguration(clipA).build()
      val itemB = MediaItem.Builder().setUri(uriB).setClippingConfiguration(clipB).build()

      val presentation = Presentation.createForWidthAndHeight(
        alignedW,
        alignedH,
        Presentation.LAYOUT_STRETCH_TO_FIT
      )

      val leftEffect = MatrixTransformation { _ ->
        val m = android.graphics.Matrix()
        val widthRatio = if (rawW > 0) Wa / rawW else 0.5f
        m.postScale(widthRatio, 1f)
        m.postTranslate(-1f + widthRatio, 0f)
        m
      }

      val rightEffect = MatrixTransformation { _ ->
        val m = android.graphics.Matrix()
        val widthRatio = if (rawW > 0) Wb / rawW else 0.5f
        m.postScale(widthRatio, 1f)
        m.postTranslate(1f - widthRatio, 0f)
        m
      }

      val editedA = EditedMediaItem.Builder(itemA)
        .setEffects(Effects(emptyList<androidx.media3.common.audio.AudioProcessor>(), listOf(leftEffect, presentation)))
        .build()

      val editedB = EditedMediaItem.Builder(itemB)
        .setEffects(Effects(emptyList<androidx.media3.common.audio.AudioProcessor>(), listOf(rightEffect, presentation)))
        .build()

      val seqA = EditedMediaItemSequence(editedA)
      val seqB = EditedMediaItemSequence(editedB)

      val composition = Composition.Builder(seqA, seqB)
        .build()

      val outPath = outputFile("hstack")
      val transformer = Transformer.Builder(reactApplicationContext)
        .setVideoMimeType(MimeTypes.VIDEO_H264)
        .setAudioMimeType(MimeTypes.AUDIO_AAC)
        .addListener(object : Transformer.Listener {
          override fun onCompleted(composition: Composition, result: androidx.media3.transformer.ExportResult) {
            promise.resolve("file://$outPath")
          }

          override fun onError(composition: Composition, result: androidx.media3.transformer.ExportResult, exception: androidx.media3.transformer.ExportException) {
            promise.reject("ERROR", exception.message)
          }
        })
        .build()

      transformer.start(composition, outPath)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }
}
