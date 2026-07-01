'use client'

import { useRef } from 'react'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

const HIDDEN = {
    xPercent: -100,
    opacity: 0,
    filter: 'blur(10px)',
}

const TITLE_HIDDEN = {
    yPercent: 100,
    opacity: 0,
    filter: 'blur(10px)',
}

const VISIBLE = {
    xPercent: 0,
    opacity: 1,
    filter: 'blur(0px)',
}

const TITLE_VISIBLE = {
    yPercent: 0,
    opacity: 1,
    filter: 'blur(0px)',
}

const EXIT = {
    xPercent: 100,
    opacity: 0,
    filter: 'blur(10px)',
}

const TITLE_EXIT = {
    yPercent: -100,
    opacity: 0,
    filter: 'blur(10px)',
}

function addEnter(timeline, container, title) {
    timeline.to(container, { ...VISIBLE, duration: 0.4 })
    timeline.to(title, { ...TITLE_VISIBLE, duration: 0.4 }, '<')
}

function addExit(timeline, container, title, para) {
    if (para) {
        timeline.to(para, { opacity: 0, filter: 'blur(10px)', duration: 0.6 })
    }
    timeline.to(container, { ...EXIT, duration: 0.6 }, para ? '<' : undefined)
    timeline.to(title, { ...TITLE_EXIT, duration: 0.6 }, '<')
}

export default function SequenceUI() {
    const containerTextRef = useRef(null)
    const containerText2Ref = useRef(null)
    const containerText3Ref = useRef(null)
    const titleRef = useRef(null)
    const title2Ref = useRef(null)
    const title3Ref = useRef(null)
    const paraRef = useRef(null)
    const scrollToExploreRef = useRef(null)
    const sectionMeterRef = useRef(null)
    const meterTrack1Ref = useRef(null)
    const meterTrack2Ref = useRef(null)
    const meterFill1Ref = useRef(null)
    const meterFill2Ref = useRef(null)

    useGSAP(() => {
        gsap.set([containerText2Ref.current, containerText3Ref.current], HIDDEN)
        gsap.set([title2Ref.current, title3Ref.current], TITLE_HIDDEN)
        gsap.set(meterFill1Ref.current, { width: '0%' })
        gsap.set(meterFill2Ref.current, { width: '0%' })
        gsap.set(meterTrack1Ref.current, { width: '6vw' })
        gsap.set(meterTrack2Ref.current, { width: 0 })
        gsap.set(scrollToExploreRef.current, { yPercent: 120 })

        const sequence1 = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero-sequence',
                start: 'top top',
                end: '27% top',
                scrub: true,
            },
        })

        const sequence2 = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero-sequence',
                start: '27% top',
                end: '55% top',
                scrub: true,
            },
        })

        const sequence3 = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero-sequence',
                start: '52% top',
                end: '72% top',
                scrub: true,
            },
        })
        const sequence4 = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero-sequence',
                start: '62% top',
                end: '85% 20%',
                scrub: true,
            },
        })

        addExit(sequence1, containerTextRef.current, titleRef.current, paraRef.current)
        sequence1.to(
            meterFill1Ref.current,
            { width: '100%', duration: 1, ease: 'none' },
            0
        )

        addEnter(sequence2, containerText2Ref.current, title2Ref.current)
        addExit(sequence2, containerText2Ref.current, title2Ref.current)
        sequence2.to(meterTrack1Ref.current, { width: 0, duration: 0.4, ease: 'none' }, 0)
        sequence2.to(meterTrack2Ref.current, { width: '6vw', duration: 0.4, ease: 'none' }, 0)
        sequence2.to(
            meterFill2Ref.current,
            { width: '100%', duration: 1, ease: 'none' },
            0
        )

        addEnter(sequence3, containerText3Ref.current, title3Ref.current)
        sequence3.to(title3Ref.current, { opacity: 0, filter: 'blur(10px)', duration: 0.4 })
        sequence3.to(containerText3Ref.current, { opacity: 0, filter: 'blur(10px)', duration: 0.4 }, '<')
        sequence3.to(
            sectionMeterRef.current,
            { opacity: 0, filter: 'blur(10px)', duration: 0.4 },
            0
        )

        sequence4.to(scrollToExploreRef.current, {
            yPercent: 0,
            ease: 'power2.inOut',
            duration: 1,
        })
    }, [])

    return (
        <div className="absolute z-10 flex h-full w-full flex-col items-start justify-end p-[4vw]">
            <div className="h-fit w-full">
                <div className="relative mb-[1vw] h-[2vw] w-full">
                    <div
                        ref={titleRef}
                        className="absolute inset-0 flex w-full items-center gap-[1vw]"
                    >
                        <span className="h-[.06vw] w-[6vw] bg-foreground" />
                        <p className="text30">Market Capitalization Company</p>
                    </div>
                    <div
                        ref={title2Ref}
                        className="absolute inset-0 flex w-full items-center gap-[1vw]"
                    >
                        <span className="h-[.06vw] w-[6vw] bg-foreground" />
                        <p className="text30">Strategic Growth Partners</p>
                    </div>
                    <div
                        ref={title3Ref}
                        className="absolute inset-0 flex w-full items-center gap-[1vw]"
                    >
                        <span className="h-[.06vw] w-[6vw] bg-foreground" />
                        <p className="text30">Legacy Wealth Management</p>
                    </div>
                </div>

                <div className="relative h-[15vw] w-[70vw]">
                    <div ref={containerTextRef} className="absolute h-full w-full">
                        <p
                            ref={paraRef}
                            className="text20 text-secondary absolute left-[40vw] top-[3vw] w-[13vw] font-medium"
                        >
                            Accredited Investors only. 99 spots available
                        </p>
                        <h2 className="text150 w-full font-medium leading-none">
                            Swanson Reserve Capital
                        </h2>
                    </div>

                    <div ref={containerText2Ref} className="absolute h-full w-full">
                        <h2 className="text150 w-full font-medium leading-none">
                            Innovation Invested
                        </h2>
                    </div>

                    <div ref={containerText3Ref} className="absolute h-full w-full">
                        <h2 className="text150 w-full font-medium leading-none">
                            Prosperity Protected
                        </h2>
                    </div>
                </div>
            </div>

            <div
                ref={sectionMeterRef}
                className="mt-[4vw] flex w-fit items-center gap-[1vw]"
            >
                <p className="text20">01</p>
                <div
                    ref={meterTrack1Ref}
                    className="relative h-[.1vw] w-[6vw] shrink-0 overflow-hidden bg-foreground/20"
                >
                    <span
                        ref={meterFill1Ref}
                        className="absolute left-0 top-0 h-full w-0 bg-white"
                    />
                </div>
                <p className="text20">02</p>
                <div
                    ref={meterTrack2Ref}
                    className="relative h-[.1vw] w-0 shrink-0 overflow-hidden bg-foreground/20"
                >
                    <span
                        ref={meterFill2Ref}
                        className="absolute left-0 top-0 h-full w-0 bg-white"
                    />
                </div>
                <p className="text20">03</p>
            </div>
            <div ref={scrollToExploreRef} className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 w-[70vw] flex flex-col items-center justify-center z-10">
                <div className="flex items-center justify-center gap-[1.2vw]">
                    <div className="relative flex items-center justify-center size-[4vw]">
                        <Image
                            src="/assets/svgs/plus.svg"
                            alt="Swanson Reserve"
                            fill
                            className="object-contain invert"
                        />
                    </div>
                    <span className="text110 font-medium leading-none text-white">We are</span>
                </div>
                <div>
                    <span className="text110 font-medium leading-none text-white">Swanson Reserve</span>
                </div>
                <div className='mt-[2vw]'>
                    <div className="flex flex-col items-center">
                        <p className='text20'>SCROLL TO EXPLORE</p>
                        <svg
                            className="mt-2"
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
               
                </div>
            </div>

        </div>
    )
}
