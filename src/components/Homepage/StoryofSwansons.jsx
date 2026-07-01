"use client";

import { Canvas } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import { Model } from "./Swan";

export default function StoryofSwansons() {
  return (
    <section className="relative h-screen w-full bg-background">
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <Canvas
          className="h-full w-full"
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
        >
          <Environment preset="studio" />
          <Center>
            <Model />
          </Center>
        </Canvas>
      </div>
    </section>
  );
}
