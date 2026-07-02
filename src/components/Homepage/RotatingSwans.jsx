'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Stage } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Model } from './Swan'

gsap.registerPlugin(ScrollTrigger)

const ENTER_FROM = { x: 7, y: 3, z: 0, ry: -Math.PI * 0.4, rx: 0.15 }
const SPIN = { factor: 0.01, smooth: 0.18 }
const ease = gsap.parseEase('power2.out')

function SwanScene() {
  const posRef = useRef(null)
  const spinRef = useRef(null)
  const tiltRef = useRef(null)
  const enter = useRef(0)
  const velocity = useRef(0)
  const smoothVel = useRef(0)
  const spinY = useRef(0)
  const inSection = useRef(false)

  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleResize = () => setScale(window.innerWidth < 1025 ? 0.6 : 1)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useLenis((lenis) => {
    if (inSection.current) velocity.current = lenis.velocity
  })

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '#story-of-swansons',
      start: 'top 80%',
      end: 'bottom 80%',
      markers: false,
      onToggle: ({ isActive }) => {
        inSection.current = isActive
        if (!isActive) velocity.current = 0
      },
    })

    ScrollTrigger.create({
      trigger: '#story-of-swansons',
      start: 'top 80%',
      end: 'bottom 80%',
      markers: false,
      onUpdate: ({ progress }) => {
        enter.current = progress
      },
    })
  }, [])

  useFrame(() => {
    const t = ease(enter.current)

    posRef.current?.position.set(
      gsap.utils.interpolate(ENTER_FROM.x, 0, t),
      gsap.utils.interpolate(ENTER_FROM.y, 0, t),
      gsap.utils.interpolate(ENTER_FROM.z, 0, t)
    )

    if (tiltRef.current) {
      tiltRef.current.rotation.y = gsap.utils.interpolate(ENTER_FROM.ry, 0, t)
      tiltRef.current.rotation.x = gsap.utils.interpolate(ENTER_FROM.rx, 0, t)
    }

    smoothVel.current +=
      (velocity.current - smoothVel.current) * SPIN.smooth
    spinY.current += smoothVel.current * SPIN.factor

    if (spinRef.current) spinRef.current.rotation.y = spinY.current
  })

  return (
    <group ref={posRef} scale={scale}>
      <group ref={spinRef}>
        <group ref={tiltRef}>
          <Model />
        </group>
      </group>
    </group>
  )
}

export default function RotatingSwans() {
  return (
    <div className="sticky top-0   flex h-screen w-full z-20 items-center justify-center overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <Stage adjustCamera={false} />
        <SwanScene />
      </Canvas>
    </div>
  )
}
