"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** next/image with a graceful gold-on-espresso fallback if a photo fails to load. */
export default function Photo({ className, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        aria-label={alt}
        style={{ containerType: "inline-size" }}
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#5a3322,#1d0f0a_70%)] flex items-center justify-center",
          className,
        )}
      >
        <span
          className="font-display italic text-gold-400/70"
          style={{ fontSize: "clamp(9px, 16cqw, 30px)" }}
        >
          glee
        </span>
      </div>
    );
  }
  const external = typeof props.src === "string" && !props.src.includes("images.unsplash.com");
  return (
    <Image {...props} unoptimized={props.unoptimized ?? external} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
