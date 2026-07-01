"use client"

import { useEffect } from "react"
import { useImageSequence } from "@/hooks/useImageSequence"
import ScrollIndicator from "../Reusable/ScrollIndicator"
import { buildTabClipPath } from "@/utils/scrollTab"
import BorderFrame from "../Reusable/BorderFrame"
import SequenceUI from "./SequenceUI"
import Loader from "./Loader"

const FRAME_COUNT = 255

const getFrame = (i) =>
    `/assets/sequences/desktop/swanson__${String(i).padStart(5, "0")}.webp`

export default function HeroSequence() {
    const { refs, ready, loadingProgress } = useImageSequence({
        frameCount: FRAME_COUNT,
        getFrame,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        cover: true,
    })

    const {
        canvas: canvasRef,
        backgroundCanvas: backgroundCanvasRef,
        section: sectionRef,
    } = refs

    // Cut the scroll tab out of the sharp video so the blurred background shows
    // through it, seamlessly continuous with the blurred padding border.
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !ready) return

        const apply = () => {
            const { width, height } = canvas.getBoundingClientRect()
            if (!width || !height) return
            const clip = buildTabClipPath(width, height)
            canvas.style.clipPath = clip
            canvas.style.webkitClipPath = clip
        }

        apply()
        const resizeObserver = new ResizeObserver(apply)
        resizeObserver.observe(canvas)
        window.addEventListener("resize", apply)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("resize", apply)
            canvas.style.clipPath = ""
            canvas.style.webkitClipPath = ""
        }
    }, [ready, canvasRef])

    return (
        <section ref={sectionRef} id="hero-sequence" className="relative h-[600vh] w-full">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas
                    ref={backgroundCanvasRef}
                    className="absolute inset-0 z-1 block h-full w-full"
                />
                <div className="h-full w-full  pointer-events-none! backdrop-blur-md bg-white/5 absolute inset-0 z-2" />

                <div className="relative z-3 flex h-full w-full items-center justify-center p-[1.2vw]">
                    <canvas ref={canvasRef} className="block rounded-lg overflow-hidden h-full w-full" />
                    <BorderFrame />
                    <SequenceUI />
                </div>

                {ready && <ScrollIndicator />}

                {!ready && (
                    <Loader />
                )}
            </div>
        </section>
    )
}
