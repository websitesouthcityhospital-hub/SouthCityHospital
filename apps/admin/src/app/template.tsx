"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  // Ultra-fast fade for admin efficiency
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.15, 
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}
