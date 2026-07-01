"use client"

import { TAB } from "@/utils/scrollTab"
import Image from "next/image"

// The tab shape itself is cut out of the video canvas (see buildTabClipPath in
// HeroSequence), revealing the blurred background beneath. This component only
// draws the content that sits inside that revealed area.
export default function ScrollIndicator() {
  return (
    <div
      className="pointer-events-none absolute z-4 flex flex-col items-center justify-between py-[1.6vw]"
      style={{
        right: `${TAB.inset}vw`,
        bottom: `${TAB.inset}vw`,
        width: `${TAB.width}vw`,
        height: `${TAB.height}vw`,
      }}
    >
      <span className="text20 uppercase tracking-[0.35em] text-white/80 [writing-mode:vertical-rl]">
       SCROLL
      </span>

      <div className="flex  flex-col items-center justify-start pb-[1vw] ">
        {/* <span className="w-px flex-1 bg-white/40" /> */}
        <Image src={'/assets/svgs/arrow.svg'} alt="scroll" className="h-[70%] translate-y-[-3vw] mt-auto mb-[1vw] w-full" width={12} height={14} />
      </div>
    </div>
  )
}
