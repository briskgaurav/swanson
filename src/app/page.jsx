import HeroSequence from '@/components/Homepage/HeroSequence'
import Navbar from '@/components/Homepage/Navbar'
import StoryofSwansons from '@/components/Homepage/StoryofSwansons'
import Swiper from '@/components/Homepage/Swiper'
import React from 'react'

export default function page() {
  return (
    <>
      <Navbar />
      <HeroSequence />
      <StoryofSwansons />
      <Swiper />
    </>
  )
}
