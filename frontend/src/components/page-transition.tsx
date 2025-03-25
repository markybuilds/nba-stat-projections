'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Variants for the page transitions
 */
const variants = {
  // Hidden state (entering from or exiting to)
  hidden: {
    opacity: 0,
    y: 20,
  },
  // Visible state (while showing)
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier curve
    },
  },
  // Exit state (when leaving)
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

/**
 * PageTransition component wraps page content and applies smooth transitions
 * between navigation using framer-motion
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  
  return (
    <motion.main
      key={pathname}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.main>
  );
} 