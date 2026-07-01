"use client"

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createCanvasRenderer } from "./imageSequence/canvasRenderer"
import { createImageSequenceEngine } from "./imageSequence/engine"

gsap.registerPlugin(ScrollTrigger)

export function useImageSequence({
  frameCount,
  getFrame,
  start = "top top",
  end = "+=3000",
  scrub = 1,
  cover = true,
  trigger,
  renderer,
  scroll = true,
}) {
  const canvasRef = useRef(null)
  const backgroundCanvasRef = useRef(null)
  const sectionRef = useRef(null)
  const refs = useMemo(
    () => ({
      canvas: canvasRef,
      backgroundCanvas: backgroundCanvasRef,
      section: sectionRef,
    }),
    []
  )
  const getFrameRef = useRef(getFrame)
  const engineRef = useRef(null)
  const scrollTriggerRef = useRef(null)
  const progressRef = useRef(0)

  const [ready, setReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useLayoutEffect(() => {
    getFrameRef.current = getFrame
  }, [getFrame])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const backgroundCanvas = backgroundCanvasRef.current
    const section = sectionRef.current
    if (!canvas || !backgroundCanvas || !section) return

    setReady(false)
    setLoadingProgress(0)
    progressRef.current = 0

    const resolvedRenderer =
      renderer ?? createCanvasRenderer({ cover })

    const engine = createImageSequenceEngine({
      element: canvas,
      backgroundElement: backgroundCanvas,
      frameCount,
      getFrame: (i) => getFrameRef.current(i),
      renderer: resolvedRenderer,
      onReady: () => {
        setReady(true)
        requestAnimationFrame(() => ScrollTrigger.refresh())
      },
      onLoadingProgress: setLoadingProgress,
      onProgressChange: (progress) => {
        progressRef.current = progress
      },
    })

    engineRef.current = engine

    if (scroll !== false) {
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: trigger ?? section,
        start,
        end,
        scrub,
        onUpdate: (self) => engine.setProgress(self.progress),
      })
    }

    return () => {
      scrollTriggerRef.current?.kill()
      scrollTriggerRef.current = null
      engine.destroy()
      engineRef.current = null
    }
  }, [frameCount, start, end, scrub, cover, trigger, renderer, scroll])

  const play = useCallback(() => engineRef.current?.play(), [])
  const pause = useCallback(() => engineRef.current?.pause(), [])
  const seek = useCallback((progress) => engineRef.current?.seek(progress), [])
  const getProgress = useCallback(
    () => engineRef.current?.getProgress() ?? 0,
    []
  )
  const destroy = useCallback(() => {
    scrollTriggerRef.current?.kill()
    scrollTriggerRef.current = null
    engineRef.current?.destroy()
    engineRef.current = null
  }, [])

  return {
    refs,
    ready,
    loadingProgress,
    progress: progressRef,
    getProgress,
    play,
    pause,
    seek,
    destroy,
  }
}
