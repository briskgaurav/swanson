"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";

gsap.registerPlugin(Draggable);

const TEAM = [
  { id: 0, name: "Kraig Swanson", title: "Founder", role: "Managing Partner", img: "/assets/imgs/team1.jpg" },
  { id: 1, name: "Alex Monroe", title: "Partner", role: "Investment Director", img: "/assets/imgs/team2.jpg" },
  { id: 2, name: "James Carter", title: "Associate", role: "Senior Analyst", img: "/assets/imgs/team1.jpg" },
  { id: 3, name: "Morgan Ellis", title: "Director", role: "Risk Management", img: "/assets/imgs/team3.jpg" },
  { id: 4, name: "Taylor Reed", title: "VP", role: "Capital Markets", img: "/assets/imgs/team4.jpg" },
];

const SLOTS = {
  "-3": { tx: -240, ty: -25, rotateY: 40, scale: 0.50, opacity: 0 },
  "-2": { tx: -148, ty: -16.5, rotateY: 30, scale: 0.67, opacity: 0 },
  "-1": { tx: -64, ty: -6, rotateY: 20, scale: 0.84, opacity: 1 },
  "0": { tx: 0, ty: 0, rotateY: 0, scale: 1.00, opacity: 1 },
  "1": { tx: 64, ty: -6, rotateY: -20, scale: 0.84, opacity: 1 },
  "2": { tx: 148, ty: -16.5, rotateY: -30, scale: 0.67, opacity: 0 },
  "3": { tx: 240, ty: -25, rotateY: -40, scale: 0.50, opacity: 0 },
};

const ZMAP = {
  "-3": 0, "-2": 0, "-1": 1, "0": 3, "1": 1, "2": 0, "3": 0,
};

function lerp(a, b, t) { return a + (b - a) * t; }

function slotAt(eff) {
  const f = Math.floor(eff);
  const t = eff - f;
  const A = SLOTS[String(f)];
  const B = SLOTS[String(f + 1)];
  if (!A) return null;
  if (!B || t === 0) return { ...A, zIndex: ZMAP[String(f)] ?? 0 };
  return {
    tx: lerp(A.tx, B.tx, t),
    ty: lerp(A.ty, B.ty, t),
    rotateY: lerp(A.rotateY, B.rotateY, t),
    scale: lerp(A.scale, B.scale, t),
    opacity: lerp(A.opacity, B.opacity, t),
    zIndex: t < 0.5 ? (ZMAP[String(f)] ?? 0) : (ZMAP[String(f + 1)] ?? 0),
  };
}

const mod = (n, m) => ((n % m) + m) % m;

const N = TEAM.length;
const DRAG_PX = 180;   
const THRESH = 0.30;  
const IMG_REVEAL = 25;    

export default function Swiper() {
  const [active, setActive] = useState(0);

  const activeRef = useRef(0);    
  const cardRefs = useRef([]);   
  const imgRefs = useRef([]);   
  const proxyRef = useRef(null); 
  const stageRef = useRef(null); 
  const goToRef = useRef(null); 

  useEffect(() => {

    function applyAll(progress) {
      TEAM.forEach((_, i) => {
        let rel = i - activeRef.current;
        if (rel > N / 2) rel -= N;
        if (rel < -N / 2) rel += N;

        const eff = rel + progress;
        const cardEl = cardRefs.current[i];
        const imgEl = imgRefs.current[i];
        if (!cardEl) return;

        if (Math.abs(eff) > 2.7) {
          gsap.set(cardEl, { opacity: 0, pointerEvents: 'none' });
          return;
        }

        const slot = slotAt(eff);
        if (!slot) return;

        const reveal = Math.max(0, 1 - Math.abs(eff));
        const imgH = 100 - reveal * IMG_REVEAL;

        gsap.set(cardEl, {
          xPercent: -50 + slot.tx,
          yPercent: slot.ty,
          rotateY: slot.rotateY,
          scale: slot.scale,
          opacity: slot.opacity,
          zIndex: slot.zIndex,
          pointerEvents: slot.opacity < 0.05 ? 'none' : 'auto',
        });

        if (imgEl) gsap.set(imgEl, { height: `${imgH}%` });
      });
    }

    let currentAnim = null;
    function tweenProgress(fromP, toP, onDone) {
      if (currentAnim) currentAnim.kill();
      const obj = { p: fromP };
      currentAnim = gsap.to(obj, {
        p: toP,
        duration: 0.52,
        ease: 'power3.out',
        onUpdate() { applyAll(obj.p); },
        onComplete() {
          currentAnim = null;
          onDone?.();
        },
      });
    }

    cardRefs.current.forEach(el => {
      if (el) gsap.set(el, { transformOrigin: 'bottom center' });
    });
    applyAll(0);

    const proxyEl = proxyRef.current;
    const stageEl = stageRef.current;
    gsap.set(proxyEl, { x: 0 });

    const [draggable] = Draggable.create(proxyEl, {
      type: 'x',
      trigger: stageEl,       
      minimumMovement: 6,             
      inertia: false,

      onDragStart() {

        if (currentAnim) { currentAnim.kill(); currentAnim = null; }
        gsap.set(proxyEl, { x: 0 }); 
      },

      onDrag() {
        const p = Math.max(-1, Math.min(1, this.x / DRAG_PX));
        applyAll(p);
      },

      onDragEnd() {
        const p = Math.max(-1, Math.min(1, this.x / DRAG_PX));
        gsap.set(proxyEl, { x: 0 }); 

        if (Math.abs(p) >= THRESH) {
          const nextIdx = p < 0
            ? mod(activeRef.current + 1, N)
            : mod(activeRef.current - 1, N);
          const finalP = p < 0 ? -1 : 1;

          tweenProgress(p, finalP, () => {

            activeRef.current = nextIdx;
            setActive(nextIdx);
            applyAll(0);
          });
        } else {
          tweenProgress(p, 0); 
        }
      },
    });

    goToRef.current = (targetIdx) => {
      if (targetIdx === activeRef.current) return;
      let rel = targetIdx - activeRef.current;
      if (rel > N / 2) rel -= N;
      if (rel < -N / 2) rel += N;
      const finalP = rel > 0 ? -1 : 1;

      tweenProgress(0, finalP, () => {
        activeRef.current = targetIdx;
        setActive(targetIdx);
        applyAll(0);
      });
    };

    return () => {
      draggable.kill();
      if (currentAnim) currentAnim.kill();
    };
  }, []); 

  return (
    <section className="relative max-md:py-[20vw] mt-[-20vw] max-md:mt-[-35vh] w-full pt-[6vw] bg-background overflow-hidden pb-[clamp(40px,5vw,80px)]">

        <h2
          className="text110 -translate-y-[-4vw] max-md:translate-y-0! text-foreground text-center font-medium"
        >
          We are <em className="text-primary">Swanson</em>
        </h2>

      <div
        ref={stageRef}
        className="relative z-10 w-full select-none cursor-grab"
        style={{
          height: 'clamp(300px,58vw,620px)',

          perspective: '900px',
          perspectiveOrigin: '50% 100%',
          touchAction: 'pan-y', 
        }}
      >

        <div
          ref={proxyRef}
          style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1 }}
        />

        {TEAM.map((member, i) => (
          <div
            key={member.id}
            ref={el => { cardRefs.current[i] = el; }}
            className="absolute bottom-0 left-1/2"
            style={{ width: 'clamp(200px,34vw,380px)' }}
          >

            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: '3 / 4', borderRadius: 'clamp(14px,2.2vw,26px)' }}
            >

              <div
                className="absolute pb-[1vw] max-md:pb-[3vw] backdrop-blur-xl bg-white/20 inset-0 flex flex-col items-center justify-end text-center pointer-events-none"

              >
                <p
                  className="font-philosopher text-foreground font-bold leading-[1.15] m-0"
                  style={{
                    fontSize: 'clamp(18px,2.8vw,38px)',
                    marginBottom: 'clamp(5px,0.6vw,10px)',
                  }}
                >
                  {member.name}
                </p>
                <p
                  className="m-0 font-normal leading-[1.45] text-white/65"
                  style={{ fontSize: 'clamp(10px,1vw,15px)' }}
                >
                  {member.title}&nbsp;–&nbsp;{member.role}
                </p>
              </div>

              <div
                ref={el => { imgRefs.current[i] = el; }}
                className="absolute top-0 left-0 w-full overflow-hidden"
                style={{
                  height: '100%',
                  borderRadius: 'clamp(14px,2.2vw,26px)',
                }}
              >
                <img
                  src={member.img}
                  alt={member.name}
                  draggable={false}
                  className="w-full h-full object-cover object-top block pointer-events-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-[2vw] max-md:bottom-[10vw] left-1/2 -translate-x-1/2 rounded-full w-[35vw] pointer-events-none ">
        <Image src={'/assets/svgs/ring.svg'} height={500} width={500} className="object-contain h-full w-full" />
      </div>
      <div className="size-[40vw] opacity-20 bg-primary absolute bottom-[-10vw] blur-3xl rounded-full left-1/2 -translate-x-1/2"></div>

    </section>
  );
}
