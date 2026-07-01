"use client";

import { useEffect } from "react";
import { useImageSequence } from "@/hooks/useImageSequence";
import { useIsMobile } from "@/hooks/useIsMobile";
import ScrollIndicator from "../Reusable/ScrollIndicator";
import { buildTabClipPath } from "@/utils/scrollTab";
import BorderFrame from "../Reusable/BorderFrame";
import SequenceUI from "./SequenceUI";
import Loader from "./Loader";

const DESKTOP_FRAME_COUNT = 255;
const MOBILE_FRAME_COUNT = 238;

const getDesktopFrame = (i) =>
  `/assets/sequences/desktop/swanson__${String(i).padStart(5, "0")}.webp`;

const getMobileFrame = (i) =>
  `/assets/sequences/mobile/swanson__${String(i).padStart(5, "0")}.webp`;

export default function HeroSequence() {
  const isMobile = useIsMobile();

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

  // Cut the scroll tab out of the sharp video so the blurred background shows
  // through it, seamlessly continuous with the blurred padding border.
  useEffect(() => {
    const canvas = canvasRef.current;
    // The scroll tab is a desktop-only detail — skip the clip on mobile so
    // the sequence fills the frame with no tab cut out of it.
    if (!canvas || !ready || isMobile) return;

    const apply = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const clip = buildTabClipPath(width, height);
      canvas.style.clipPath = clip;
      canvas.style.webkitClipPath = clip;
    };

    apply();
    const resizeObserver = new ResizeObserver(apply);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", apply);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", apply);
      canvas.style.clipPath = "";
      canvas.style.webkitClipPath = "";
    };
  }, [ready, canvasRef, isMobile]);

  return (
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

        <div className="relative z-3 flex h-full w-full items-center justify-center p-[1.2vw] max-md:p-0!">
          <canvas
            ref={canvasRef}
            className="block rounded-lg overflow-hidden h-full w-full"
          />
          <BorderFrame />
          <SequenceUI />
        </div>

        {ready && !isMobile && <ScrollIndicator />}

        {!ready && <Loader />}
      </div>
    </section>
  );
}
