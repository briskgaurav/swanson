"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

gsap.registerPlugin(ScrollTrigger)

const LenisSmoothScroll = () => {
  const lenisRef = useRef(null)

  useEffect(() => {
    let cleanup

    function init() {
      const lenis = lenisRef.current?.lenis
      if (!lenis) return false

      function update(time) {
        lenis.raf(time * 1000)
      }

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true })
          }
          return lenis.scroll
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        },
      })

      lenis.on("scroll", ScrollTrigger.update)
      gsap.ticker.add(update)

      const onRefresh = () => lenis.resize()
      ScrollTrigger.addEventListener("refresh", onRefresh)
      ScrollTrigger.refresh()

      cleanup = () => {
        ScrollTrigger.scrollerProxy(document.documentElement, {})
        lenis.off("scroll", ScrollTrigger.update)
        ScrollTrigger.removeEventListener("refresh", onRefresh)
        gsap.ticker.remove(update)
      }

      return true
    }

    if (!init()) {
      const id = requestAnimationFrame(() => init())
      return () => {
        cancelAnimationFrame(id)
        cleanup?.()
      }
    }

    return () => cleanup?.()
  }, [])

  return (
    <ReactLenis root options={{ autoRaf: false, duration: 1.2 }} ref={lenisRef} />
  )
}

export default LenisSmoothScroll
