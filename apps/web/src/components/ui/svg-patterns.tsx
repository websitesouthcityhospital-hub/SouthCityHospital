"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable decorative background components to eliminate flat sections.
 */

export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none opacity-[0.03]", className)}
      style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, var(--ink) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
      aria-hidden="true"
    />
  );
}

export function FloatingBlobs({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} aria-hidden="true">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[50%] bg-[var(--primary-light)] rounded-full blur-[80px] opacity-60 mix-blend-multiply" />
      <div className="absolute top-[20%] -right-[10%] w-[35%] h-[40%] bg-[var(--accent-light)] rounded-full blur-[80px] opacity-60 mix-blend-multiply" />
      <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[40%] bg-[#e3eef9] rounded-full blur-[80px] opacity-60 mix-blend-multiply" />
    </div>
  );
}

// Helper to generate a random ECG path for the watermark
function generateRandomWatermarkPath(width: number, height: number) {
  const centerY = height / 2;
  let d = `M0,${centerY} `;
  let x = 0;

  while (x < width - 100) {
    // flat segment
    const flatLen = 50 + Math.random() * 150;
    x += flatLen;
    if (x >= width - 100) break;
    d += `L${x},${centerY} `;

    // random spikes sequence
    const numSpikes = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numSpikes; i++) {
      const h1 = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 60);
      const h2 = (Math.random() > 0.5 ? -1 : 1) * (10 + Math.random() * 40);
      x += 15;
      d += `L${x},${centerY + h1} `;
      x += 15;
      d += `L${x},${centerY + h2} `;
      x += 15;
      d += `L${x},${centerY} `;
    }
  }

  d += `L${width},${centerY}`;
  return d;
}

function getDefaultWatermarkPath(width: number, height: number) {
  const centerY = height / 2;
  return `M0,${centerY} L${width},${centerY}`;
}

export function PulseLineWatermark({ className }: { className?: string }) {
  const width = 1000;
  const height = 200;
  const [path, setPath] = useState(() => getDefaultWatermarkPath(width, height));
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    const runAnimation = async () => {
      while (isMounted) {
        controls.set({ pathLength: 0, opacity: 0 });
        
        setPath(generateRandomWatermarkPath(width, height));
        
        await new Promise((r) => setTimeout(r, 50));
        if (!isMounted) break;

        await controls.start({
          pathLength: [0, 1, 1],
          opacity: [0, 1, 0],
          transition: { duration: 4, ease: "easeInOut" },
        });

        if (isMounted) {
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
      controls.stop();
    };
  }, [controls]);

  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]", className)}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      suppressHydrationWarning
    >
      <motion.path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={controls}
        suppressHydrationWarning
      />
    </svg>
  );
}
