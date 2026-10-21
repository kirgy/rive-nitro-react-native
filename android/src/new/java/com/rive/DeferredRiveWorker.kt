package com.rive

import app.rive.ExperimentalDeferredRendering
import app.rive.RenderBackend
import app.rive.core.CommandQueue

/**
 * rive-android 11.14.2+ exposes its deferred (GPU Canvas) worker through the public
 * `CommandQueue(enableGPUCanvas = true)` constructor. Older versions only had the
 * Kotlin-internal `CommandQueue.createDeferred`, which 11.14.2 removed.
 */
internal object DeferredRiveWorker {
  /** Null when this rive-android has no deferred worker entry point. */
  @OptIn(ExperimentalDeferredRendering::class)
  fun createOrNull(renderBackend: RenderBackend): CommandQueue? {
    return try {
      CommandQueue(renderBackend = renderBackend, enableGPUCanvas = true)
    } catch (e: NoSuchMethodError) {
      null
    }
  }
}
