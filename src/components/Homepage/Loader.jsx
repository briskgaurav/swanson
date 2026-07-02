"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

export default function Loader({ visible = true }) {
    const containerRef = useRef(null)
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        if (visible) return

        const el = containerRef.current
        if (!el) return

        const tween = gsap.to(el, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => setHidden(true),
        })

        return () => tween.kill()
    }, [visible])

    if (hidden) return null

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-500 grid place-items-center bg-background text-foreground"
        >
            <Image
                src="/assets/svgs/swan.svg"
                alt="Loading..."
                width={500}
                height={500}
                className="w-52 h-52 swan-loader-animation"
                priority
            />
        </div>
    )
}
