"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

// ─── Shared Framer Motion Variants ───────────────────────────────────────────

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── ScrollReveal wrapper ─────────────────────────────────────────────────────
interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  once?: boolean;
  margin?: string;
}

export function ScrollReveal({
  children,
  variants = fadeUpVariants,
  className,
  delay = 0,
  once = true,
  margin = "-80px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as never });

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerReveal — wraps a grid/list with staggered child animations ────────
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  margin?: string;
}

export function StaggerReveal({
  children,
  className,
  once = true,
  margin = "-80px",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as never });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Convenience export — use as child of StaggerReveal
export const StaggerItem = motion.div;
export { staggerItemVariants as itemVariants };

// ─── CountUp ────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface CountUpProps {
  to: number;
  duration?: number;
  className?: string;
}

export function CountUp({ to, duration = 2, className }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, to, {
        duration,
        ease: [0.16, 1, 0.3, 1], // premium ease-out
        onUpdate(value) {
          setCount(Math.round(value));
        },
      });
      return () => controls.stop();
    }
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  );
}

// ─── Floating Element ────────────────────────────────────────────────────────
interface FloatingProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Floating({ children, className, delay = 0 }: FloatingProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: ["0px", "-10px", "0px"] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
