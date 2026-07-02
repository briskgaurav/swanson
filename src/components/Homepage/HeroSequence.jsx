"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useImageSequence } from "@/hooks/useImageSequence";
import { useIsMobile } from "@/hooks/useIsMobile";
import ScrollIndicator from "../Reusable/ScrollIndicator";
import { buildTabClipPath } from "@/utils/scrollTab";
import BorderFrame from "../Reusable/BorderFrame";
import SequenceUI from "./SequenceUI";
import Loader from "./Loader";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_FRAME_COUNT = 255;
const MOBILE_FRAME_COUNT = 238;
const MIN_LOADER_MS = 2000;

// Scroll progress window over which the notches collapse and the padding
// dissolves so the canvas expands to full screen.
const REVEAL_START = 0.8;
const REVEAL_END = 1;
const CANVAS_PADDING_VW = 1.2; // matches the wrapper's p-[1.2vw]
const CANVAS_RADIUS_REM = 0.5; // matches rounded-lg

const getDesktopFrame = (i) =>
  `/assets/sequences/desktop/swanson__${String(i).padStart(5, "0")}.webp`;

const getMobileFrame = (i) =>
  `/assets/sequences/mobile/swanson__${String(i).padStart(5, "0")}.webp`;

export default function HeroSequence() {
  const isMobile = useIsMobile();
  const canvasWrapperRef = useRef(null);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_LOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  const { refs, ready, loadingProgress } = useImageSequence({
    frameCount: isMobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT,
    getFrame: isMobile ? getMobileFrame : getDesktopFrame,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    cover: true,
  });

  const {
    canvas: canvasRef,
    backgroundCanvas: backgroundCanvasRef,
    section: sectionRef,
  } = refs;

  const showLoader = !ready || !minTimeElapsed;

  // Cut the scroll tab out of the sharp video so the blurred background shows
  // through it, seamlessly continuous with the blurred padding border. Near the
  // end of the scroll (REVEAL_START→REVEAL_END) the notches collapse and the
  // padding/rounding dissolve so the canvas smoothly grows to full screen.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapperRef.current;
    // The scroll tab is a desktop-only detail — skip the clip on mobile so
    // the sequence fills the frame with no tab cut out of it.
    if (!canvas || !wrapper || !ready || isMobile) return;

    let reveal = 0;

    const apply = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const clip = buildTabClipPath(width, height, reveal);
      canvas.style.clipPath = clip;
      canvas.style.webkitClipPath = clip;
    };

    const applyExpand = () => {
      const k = 1 - reveal;
      wrapper.style.padding = `${CANVAS_PADDING_VW * k}vw`;
      canvas.style.borderRadius = `${CANVAS_RADIUS_REM * k}rem`;

    };

    apply();
    applyExpand();

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        reveal = gsap.utils.clamp(
          0,
          1,
          (self.progress - REVEAL_START) / (REVEAL_END - REVEAL_START)
        );
        apply();
        applyExpand();
      },
    });

    const resizeObserver = new ResizeObserver(apply);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", apply);

    return () => {
      st.kill();
      resizeObserver.disconnect();
      window.removeEventListener("resize", apply);
      canvas.style.clipPath = "";
      canvas.style.webkitClipPath = "";
      canvas.style.borderRadius = "";
      wrapper.style.padding = "";
    };
  }, [ready, canvasRef, sectionRef, isMobile]);

  return (
    <>
      <Loader visible={showLoader} />

      <section
        ref={sectionRef}
        id="hero-sequence"
        className="relative h-[600vh] w-full"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {!isMobile && (
            <canvas
              ref={backgroundCanvasRef}
              className="absolute inset-0 z-1 block h-full w-full"
            />
          )}
          <div className="h-full w-full  pointer-events-none! backdrop-blur-md bg-white/5 absolute inset-0 z-2" />

          <div
            ref={canvasWrapperRef}
            className="relative z-3 flex h-full w-full items-center justify-center p-[1.2vw] max-md:p-0!"
          >
            <canvas
              ref={canvasRef}
              className="block rounded-lg overflow-hidden h-full w-full"
            />
            <BorderFrame />
            <SequenceUI />
          </div>

          {!showLoader && !isMobile && (
            <div>
              <ScrollIndicator />
            </div>
          )}

        </div>
      </section>
    </>
  );
}
