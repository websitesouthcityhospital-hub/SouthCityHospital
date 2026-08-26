"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface PulseLineProps {
  className?: string;
  width?: number;
  height?: number;
  animate?: boolean;
  color?: string;
}

function generateRandomEcgPath(width: number, height: number) {
  const centerY = height / 2;
  let d = `M0,${centerY} `;
  let x = 0;

  while (x < width - 40) {
    // flat segment
    const flatLen = 20 + Math.random() * 30;
    x += flatLen;
    if (x >= width - 40) break;
    d += `L${x},${centerY} `;

    // random spikes sequence
    const numSpikes = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numSpikes; i++) {
      const h1 = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15);
      const h2 = (Math.random() > 0.5 ? -1 : 1) * (5 + Math.random() * 10);
      x += 6;
      d += `L${x},${centerY + h1} `;
      x += 6;
      d += `L${x},${centerY + h2} `;
      x += 6;
      d += `L${x},${centerY} `;
    }
  }

  d += `L${width},${centerY}`;
  return d;
}

function getDefaultPath(width: number, height: number) {
  const centerY = height / 2;
  return `M0,${centerY} L${width},${centerY}`;
}

/**
 * PulseLine — ECG-style waveform SVG element.
 * Generates a randomized graph line on each animation loop.
 */
export function PulseLine({
  className,
  width = 280,
  height = 48,
  animate = true,
  color = "var(--accent)",
}: PulseLineProps) {
  const [path, setPath] = useState(() => getDefaultPath(width, height));
  const controls = useAnimation();
  const circleControls = useAnimation();

  useEffect(() => {
    if (!animate) return;
    let isMounted = true;

    const runAnimation = async () => {
      while (isMounted) {
        // Reset instantly
        controls.set({ pathLength: 0, opacity: 0 });
        circleControls.set({ opacity: 0, scale: 0 });
        
        // Generate new random ECG path
        setPath(generateRandomEcgPath(width, height));
        
        // Small delay to ensure reset is applied
        await new Promise((r) => setTimeout(r, 50));
        if (!isMounted) break;

        // Run circle and line simultaneously
        circleControls.start({
          opacity: [0, 1, 0.6, 1, 0],
          scale: [0, 1, 1, 1, 1],
          transition: { duration: 3, ease: "easeInOut" },
        });

        await controls.start({
          pathLength: [0, 1, 1],
          opacity: [0, 1, 0],
          transition: { duration: 3, ease: "easeInOut" },
        });

        // Delay before next pulse
        if (isMounted) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
      controls.stop();
      circleControls.stop();
    };
  }, [animate, width, height, controls, circleControls]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className={className}
      suppressHydrationWarning
    >
      {animate ? (
        <motion.path
          d={path}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={controls}
          suppressHydrationWarning
        />
      ) : (
        <path
          d={path}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        />
      )}
      {/* Pulsing dot at the end */}
      {animate && (
        <motion.circle
          cx={width}
          cy={height / 2}
          r={3}
          fill={color}
          animate={circleControls}
          suppressHydrationWarning
        />
      )}
    </svg>
  );
}
