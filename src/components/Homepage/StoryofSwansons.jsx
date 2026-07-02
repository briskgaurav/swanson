"use client";

import { storySections } from "@/__mock__/stories";
import Stories from "../Reusable/Stories";
import RotatingSwans from "./RotatingSwans";

export default function StoryofSwansons() {
  return (
    <section id="story-of-swansons" className="relative h-fit w-full bg-background">
      <RotatingSwans />

      {storySections.map((section) => (
        <div key={section.id} className={section.rowClassName}>
          {section.items.map((item) => (
            <Stories key={item.id} {...item} />
          ))}
        </div>
      ))}
    </section>
  );
}
