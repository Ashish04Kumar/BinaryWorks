"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";

const tilts = ["-rotate-3", "rotate-2", "-rotate-1"];

// Stacked photos; click sends the top one to the back.
const PhotoStack = ({ photos }: { photos: StaticImageData[] }) => {
  const [order, setOrder] = useState(photos.map((_, i) => i));

  const next = () => setOrder(([first, ...rest]) => [...rest, first]);

  return (
    <button
      onClick={next}
      aria-label="Show next photo"
      className="relative block w-full max-w-[13.5rem] sm:max-w-xs md:max-w-sm aspect-[4/5] mx-auto cursor-pointer"
    >
      {order
        .slice()
        .reverse()
        .map((photoIndex, depth, arr) => {
          const isTop = depth === arr.length - 1;
          return (
            <span
              key={photoIndex}
              className={`absolute inset-0 rounded-lg overflow-hidden border-4 theme-bg-card bw-rule shadow-xl transition-transform duration-300 ${
                isTop ? "rotate-0 hover:-rotate-1" : tilts[depth % tilts.length]
              }`}
            >
              <Image
                src={photos[photoIndex]}
                alt="Ashish Kumar"
                fill
                sizes="(max-width: 640px) 216px, (max-width: 768px) 320px, 384px"
                className="object-cover"
                placeholder="blur"
              />
            </span>
          );
        })}
      <span className="absolute -bottom-8 left-0 right-0 text-center font-mono text-xs bw-muted">
        click to shuffle
      </span>
    </button>
  );
};

export default PhotoStack;
