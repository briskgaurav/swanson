'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const directionConfig = {
  left: {
    root: 'items-start origin-top-left',
    paragraph: 'w-[26vw]',
    rotate: 15,
    xPercent: -30,
  },
  right: {
    root: 'items-end origin-top-right',
    paragraph: 'w-[27vw] pl-[10vw] pr-[2vw] text-right',
    rotate: -15,
    xPercent: 30,
  },
}

export default function Stories({
  text,
  imageSrc,
  direction = 'left',
  alt = '',
  className = '',
  paragraphClassName = '',
  imageClassName = '',
}) {
  const ref = useRef(null)
  const config = directionConfig[direction] ?? directionConfig.left

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      gsap.fromTo(
        el,
        {
          rotate: config.rotate,
          xPercent: config.xPercent,
        },
        {
          rotate: 0,
          xPercent: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'bottom 88%',
            scrub: true,
            markers: false,
          },
        }
      )
    },
    { scope: ref, dependencies: [direction] }
  )

  return (
    <div
      ref={ref}
      className={`flex h-fit max-md:w-full max-md:gap-[8vw] w-[40vw] flex-col gap-[2vw] ${config.root} ${className}`.trim()}
    >
      <p
        className={`text24 max-md:text-center! leading-tight ${direction === 'left' ? 'order-1' : 'order-2'} ${paragraphClassName || config.paragraph}`.trim()}
      >
        {text}
      </p>
      <div
        className={`aspect-video max-md:w-full  w-[37vw] shrink-0 overflow-hidden rounded-xl ${direction === 'left' ? 'order-2' : 'order-1'} ${imageClassName}`.trim()}
      >
        <Image
          src={imageSrc}
          alt={alt}
          height={500}
          width={500}
          className="h-full w-full object-cover object-top"
        />
      </div>
    </div>
  )
}
