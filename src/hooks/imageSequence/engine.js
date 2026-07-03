import { createCanvasRenderer } from "./canvasRenderer"

// Safari/WebKit has never implemented requestIdleCallback, so this fallback
// is what iOS always uses. It must mimic the real deadline object shape —
// callers rely on deadline.timeRemaining(), and a bare setTimeout callback
// receives no arguments, which used to throw and silently kill background
// frame loading on iOS.
const scheduleIdle =
  typeof requestIdleCallback !== "undefined"
    ? requestIdleCallback
    : (cb) => {
        const start = Date.now()
        return setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          })
        }, 1)
      }

const cancelIdle =
  typeof cancelIdleCallback !== "undefined"
    ? cancelIdleCallback
    : clearTimeout

function getDeviceProfile() {
  const memory = navigator.deviceMemory ?? 8
  const lowEnd = memory <= 4

  const cacheRadius = lowEnd ? 12 : 20

  return {
    lowEnd,
    maxDpr: lowEnd ? 1.5 : 2,
    // The cache MUST be able to hold the whole working set (both scroll
    // directions) or it thrashes — evicting frames it's about to need again,
    // which is what caused the reverse-scroll stalls. Keep 2*radius + margin.
    cacheSize: 2 * cacheRadius + (lowEnd ? 12 : 20),
    preloadBatch: lowEnd ? 10 : 20,
    cacheRadius,
    lerpFactor: 0.2,
    jumpThreshold: 30,
  }
}

class LRUCache {
  constructor(maxSize, onEvict) {
    this.maxSize = maxSize
    this.onEvict = onEvict
    this.map = new Map()
  }

  has(key) {
    return this.map.has(key)
  }

  get(key) {
    if (!this.map.has(key)) return undefined
    const value = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.maxSize) {
      const oldest = this.map.keys().next().value
      const evicted = this.map.get(oldest)
      this.map.delete(oldest)
      this.onEvict?.(oldest, evicted)
    }
    this.map.set(key, value)
  }

  clear() {
    for (const [key, value] of this.map) {
      this.onEvict?.(key, value)
    }
    this.map.clear()
  }
}

function releaseBitmap(entry) {
  if (entry?.source?.close) entry.source.close()
  entry?.revoke?.()
}

async function loadFrameBitmap(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Failed to load frame: ${url}`)

  const blob = await response.blob()

  if (typeof createImageBitmap === "function") {
    try {
      return { kind: "bitmap", source: await createImageBitmap(blob) }
    } catch {
      // Safari or unsupported format — fall through to Image
    }
  }

  const objectUrl = URL.createObjectURL(blob)
  const img = new Image()
  img.decoding = "async"
  img.src = objectUrl

  try {
    await img.decode()
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw new Error(`Failed to decode frame: ${url}`)
  }

  return {
    kind: "image",
    source: img,
    revoke: () => URL.revokeObjectURL(objectUrl),
  }
}

export function createImageSequenceEngine({
  element,
  backgroundElement = null,
  frameCount,
  getFrame,
  renderer = createCanvasRenderer(),
  backgroundRenderer = backgroundElement ? createCanvasRenderer({ cover: true }) : null,
  onReady,
  onLoadingProgress,
  onProgressChange,
}) {
  const profile = getDeviceProfile()
  const abort = new AbortController()
  const { signal } = abort

  const loading = new Set()
  const loaded = new Set()

  const cache = new LRUCache(profile.cacheSize, (key, entry) => {
    releaseBitmap(entry)
    loaded.delete(key)
  })

  let targetFrame = 0
  let currentFrame = 0
  let direction = 1
  let lastDrawnFrame = -1
  let rafId = 0
  let idleId = 0
  let resizeObserver
  let running = true
  let destroyed = false
  let backgroundCursor = 0

  renderer.mount(element)
  if (backgroundRenderer && backgroundElement) {
    backgroundRenderer.mount(backgroundElement)
  }

  /** @param {HTMLElement} el */
  const resizeElement = (el, r) => {
    const { width, height } = el.getBoundingClientRect()
    if (width <= 0 || height <= 0) return

    const dpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr)
    r.resize(width, height, dpr)
  }

  const clampFrame = (index) =>
    Math.max(0, Math.min(frameCount - 1, index))

  const clampProgress = (progress) =>
    Math.max(0, Math.min(1, progress))

  const emitLoadingProgress = () => {
    onLoadingProgress?.(loaded.size / frameCount)
  }

  const draw = (index) => {
    if (!cache.has(index)) return false
    const entry = cache.get(index)
    renderer.draw(entry.source)
    backgroundRenderer?.draw(entry.source)
    return true
  }

  const resize = () => {
    resizeElement(element, renderer)
    if (backgroundElement && backgroundRenderer) {
      resizeElement(backgroundElement, backgroundRenderer)
    }

    if (lastDrawnFrame >= 0 && cache.has(lastDrawnFrame)) {
      draw(lastDrawnFrame)
    }
  }

  const storeFrame = (index, entry) => {
    loaded.add(index)
    loading.delete(index)
    cache.set(index, entry)
    emitLoadingProgress()
  }

  const loadFrame = async (index) => {
    const frame = clampFrame(index)
    if (loaded.has(frame) || loading.has(frame) || signal.aborted) return

    loading.add(frame)

    try {
      const entry = await loadFrameBitmap(getFrame(frame), signal)
      storeFrame(frame, entry)

      if (frame === 0) {
        resize()
        draw(0)
        lastDrawnFrame = 0
        onReady?.()
      }

      const rounded = clampFrame(Math.round(currentFrame))
      if (rounded === frame && lastDrawnFrame !== frame && cache.has(frame)) {
        if (draw(frame)) lastDrawnFrame = frame
      }
    } catch (err) {
      loading.delete(frame)
      if (err.name !== "AbortError") {
        console.warn(`[useImageSequence] frame ${frame} failed`, err)
      }
    }
  }

  const loadMany = (indices) => {
    for (const index of indices) {
      const frame = clampFrame(index)
      if (!loaded.has(frame) && !loading.has(frame)) {
        loadFrame(frame)
      }
    }
  }

  // Load neighbours ordered by proximity to the current frame and biased in the
  // scroll direction, so the frames we're about to reach are fetched first and
  // stay warm in the LRU regardless of whether we're going forwards or back.
  const loadRange = (center) => {
    const radius = profile.cacheRadius
    const behind = Math.max(4, Math.round(radius * 0.5))
    const ahead = direction >= 0 ? radius : behind
    const back = direction >= 0 ? behind : radius
    const span = Math.max(ahead, back)
    const indices = []

    for (let i = 1; i <= span; i += 1) {
      if (i <= ahead) {
        const f = clampFrame(center + i * direction)
        if (!loaded.has(f) && !loading.has(f)) indices.push(f)
      }
      if (i <= back) {
        const f = clampFrame(center - i * direction)
        if (!loaded.has(f) && !loading.has(f)) indices.push(f)
      }
    }

    loadMany(indices)
  }

  // Nearest already-cached frame to `target` within the preload radius, or -1.
  const nearestCachedFrame = (target) => {
    if (cache.has(target)) return target
    for (let d = 1; d <= profile.cacheRadius; d += 1) {
      if (cache.has(target - d)) return target - d
      if (cache.has(target + d)) return target + d
    }
    return -1
  }

  const scheduleBackgroundLoads = () => {
    if (signal.aborted || backgroundCursor >= frameCount) return

    idleId = scheduleIdle(
      (deadline) => {
        if (signal.aborted) return

        while (
          backgroundCursor < frameCount &&
          (deadline.timeRemaining?.() > 0 || deadline.didTimeout)
        ) {
          if (!loaded.has(backgroundCursor) && !loading.has(backgroundCursor)) {
            loadFrame(backgroundCursor)
          }
          backgroundCursor += 1
        }

        if (backgroundCursor < frameCount) {
          scheduleBackgroundLoads()
        }
      },
      { timeout: 2000 }
    )
  }

  const bootstrap = async () => {
    await loadFrame(0)

    const firstBatch = []
    for (let i = 1; i <= profile.preloadBatch; i += 1) {
      firstBatch.push(i)
    }
    loadMany(firstBatch)

    const secondBatch = []
    for (
      let i = profile.preloadBatch + 1;
      i <= profile.preloadBatch * 2;
      i += 1
    ) {
      secondBatch.push(i)
    }
    loadMany(secondBatch)

    backgroundCursor = profile.preloadBatch * 2 + 1
    scheduleBackgroundLoads()
  }

  const tick = () => {
    if (!running || destroyed) return

    const delta = Math.abs(targetFrame - currentFrame)

    if (delta > profile.jumpThreshold) {
      currentFrame = targetFrame
    } else if (delta > 0.01) {
      currentFrame += (targetFrame - currentFrame) * profile.lerpFactor
    } else {
      currentFrame = targetFrame
    }

    const frameToDraw = clampFrame(Math.round(currentFrame))

    if (frameToDraw !== lastDrawnFrame) {
      if (cache.has(frameToDraw)) {
        if (draw(frameToDraw)) lastDrawnFrame = frameToDraw
      } else {
        loadFrame(frameToDraw)
        // Don't freeze on a stale, far-away frame while the exact one loads —
        // show the closest cached frame so scrubbing degrades smoothly instead
        // of stalling then snapping.
        const nearest = nearestCachedFrame(frameToDraw)
        if (nearest >= 0 && nearest !== lastDrawnFrame && draw(nearest)) {
          lastDrawnFrame = nearest
        }
      }
    }

    // Touch the immediate neighbourhood so it counts as recently used and
    // survives LRU eviction even when we reverse direction.
    for (let i = -2; i <= 2; i += 1) {
      const f = clampFrame(frameToDraw + i)
      if (cache.has(f)) cache.get(f)
    }

    loadRange(frameToDraw)
    rafId = requestAnimationFrame(tick)
  }

  const startLoop = () => {
    if (rafId || destroyed) return
    rafId = requestAnimationFrame(tick)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(element)
  if (backgroundElement) resizeObserver.observe(backgroundElement)
  resize()
  startLoop()
  bootstrap()

  return {
    setProgress(progress) {
      const clamped = clampProgress(progress)
      const next = clamped * (frameCount - 1)
      if (next > targetFrame) direction = 1
      else if (next < targetFrame) direction = -1
      targetFrame = next
      onProgressChange?.(clamped)
    },

    getProgress() {
      if (frameCount <= 1) return 0
      return currentFrame / (frameCount - 1)
    },

    seek(progress) {
      const clamped = clampProgress(progress)
      const next = clamped * (frameCount - 1)
      if (next > targetFrame) direction = 1
      else if (next < targetFrame) direction = -1
      targetFrame = next
      currentFrame = targetFrame
      onProgressChange?.(clamped)

      const frameToDraw = clampFrame(Math.round(currentFrame))
      if (cache.has(frameToDraw)) {
        if (draw(frameToDraw)) lastDrawnFrame = frameToDraw
      } else {
        loadFrame(frameToDraw)
      }
    },

    play() {
      if (destroyed) return
      running = true
      startLoop()
    },

    pause() {
      running = false
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    },

    destroy() {
      if (destroyed) return
      destroyed = true
      running = false
      abort.abort()
      cancelAnimationFrame(rafId)
      if (idleId) cancelIdle(idleId)
      resizeObserver?.disconnect()
      cache.clear()
      loading.clear()
      loaded.clear()
      renderer.destroy()
      backgroundRenderer?.destroy()
      rafId = 0
    },
  }
}
