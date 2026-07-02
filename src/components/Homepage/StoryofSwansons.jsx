"use client";

import DiagonalLines from "../Reusable/DiagonalLines";
import Stories from "../Reusable/Stories";
import RotatingSwans from "./RotatingSwans";

export default function StoryofSwansons() {
  return (
    <section id="story-of-swansons" className="relative  h-fit w-full bg-background">
      <RotatingSwans />
      <div className="sticky mt-[-100vh] overflow-x-hidden top-0 z-5 h-screen w-full">
        <DiagonalLines />
      </div>

      <div className="relative z-10 overflow-x-hidden max-md:gap-[8vw] background max-md:mt-[-100vh] mt-[-80vh] max-md:flex-col flex h-screen w-full justify-between self-padd">
        <Stories
          direction="left"
          text="Swanson Reserve Capital is private investment fund with dual Share Classes, Structured Notes & Long Equity Quantitative investing.What we do: Our fund curates investment strategies for accredited investors, family offices, institutions, endowments and businesses to help:"
          imageSrc="/assets/imgs/family.png"
          alt="Story of Swansons"
          className="mt-auto"
          paragraphClassName="w-[29vw]  max-md:w-full"
        />
        <Stories
          direction="right"
          text="1. Create Quarterly Income: Pay ongoing expenses, kids tuition, mortgages, car payments, private jet, or fund charitable contributions."
          imageSrc="/assets/imgs/studio.png"
          alt="studio"
          paragraphClassName="pl-[10vw]  max-md:w-full max-md:pl-0! max-md:pr-0! pr-[2vw] text-right"
        />
      </div>

      <div className="relative z-10 overflow-x-hidden max-md:gap-[8vw] max-md:w-full h-screen max-md:h-auto mt-[10vw] max-md:mt-[20vw] w-full flex max-md:flex-col justify-between self-padd">
        <Stories
          direction="left"
          text="2: Achieve Long Term Growth: While still receiving quarterly distributions, our Growth Notes and Equity Allocations are designed to accumulate long term wealth."
          imageSrc="/assets/imgs/family.png"
          alt="Story of Swansons"
          className="mt-auto"
          paragraphClassName="w-[26vw] max-md:w-full"
        />
        <Stories
          direction="right"
          className="max-md:w-full!"
          text="3: Capital Preservation: Both investment Share Classes are designed to shield our investors from large market downturns. Our Structured Products all come with barrier protections of up to 50% while our Equity Portfolio is designed to achieve risk adjusted returns above S&P 500 with lower beta risks."
          imageSrc="/assets/imgs/office.png"
          alt="office"
          paragraphClassName="pl-[7vw] max-md:pr-0! max-md:pl-0! max-md:w-full pr-[2vw] text-right"
        />
      </div>

      <div className="h-[80vh]  w-full" />

    </section>
  );
}
