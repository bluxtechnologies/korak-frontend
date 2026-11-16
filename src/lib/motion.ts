/**
 * Fintech Motion Design Tokens & Utilities
 *
 * Provides crisp, high-trust motion presets (150ms–220ms, zero cartoon bounce)
 * tuned for professional SaaS and banking interfaces (Stripe, Linear, Mercury).
 * Fully respects 'prefers-reduced-motion'.
 */
import type { Transition, Variants } from "motion/react";

/**
 * Standard fintech spring and easing configurations.
 */
export const MOTION_SPRINGS = {
  /** Snappy micro-interaction spring (buttons, badges, icons) */
  snappy: {
    type: "spring",
    stiffness: 450,
    damping: 32,
    mass: 0.8,
  } as const,

  /** Dialog and modal entrance spring (subtle scale from 0.96 -> 1) */
  modal: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.9,
  } as const,

  /** Smooth drawer or panel slide */
  drawer: {
    type: "spring",
    stiffness: 350,
    damping: 34,
    mass: 1,
  } as const,
};

/**
 * Precision cubic-bezier easing curve for fintech UIs.
 * Rapid initial acceleration followed by smooth deceleration.
 */
export const FINTECH_EASE = [0.16, 1, 0.3, 1] as const;

export const MOTION_TRANSITIONS = {
  /** Micro-interaction quick transition (150ms) */
  quick: {
    duration: 0.15,
    ease: FINTECH_EASE,
  } as Transition,

  /** Standard element entrance transition (180ms) */
  standard: {
    duration: 0.18,
    ease: FINTECH_EASE,
  } as Transition,

  /** Pure opacity fade (140ms) */
  fade: {
    duration: 0.14,
    ease: "easeOut",
  } as Transition,

  /** Stagger children orchestrator (0.04s interval) */
  stagger: {
    staggerChildren: 0.04,
    delayChildren: 0.02,
  } as Transition,
};

/**
 * Pre-configured motion variants for consistent page and component choreography.
 */
export const MOTION_VARIANTS = {
  /** Pure opacity fade */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: MOTION_TRANSITIONS.fade },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  } as Variants,

  /** Subtle upward slide and fade (4-8px) for cards, rows, and alerts */
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: MOTION_TRANSITIONS.standard },
    exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
  } as Variants,

  /** Container orchestrator that staggers child list items / cards */
  staggerContainer: {
    initial: {},
    animate: {
      transition: MOTION_TRANSITIONS.stagger,
    },
  } as Variants,

  /** Child item within a staggered container */
  staggerItem: {
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: MOTION_TRANSITIONS.standard,
    },
  } as Variants,

  /** Modal and alert dialog entrance: subtle scale + fade */
  dialogScale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: MOTION_SPRINGS.modal,
    },
    exit: {
      opacity: 0,
      scale: 0.97,
      transition: { duration: 0.12, ease: "easeOut" },
    },
  } as Variants,

  /** Mobile drawer sliding from left edge */
  drawerSlideLeft: {
    initial: { x: "-100%" },
    animate: {
      x: 0,
      transition: MOTION_SPRINGS.drawer,
    },
    exit: {
      x: "-100%",
      transition: { duration: 0.15, ease: "easeInOut" },
    },
  } as Variants,

  /** Mobile bottom nav bar slide from bottom edge */
  bottomNavSlideUp: {
    initial: { y: "100%" },
    animate: {
      y: 0,
      transition: MOTION_SPRINGS.drawer,
    },
    exit: {
      y: "100%",
      transition: { duration: 0.15, ease: "easeInOut" },
    },
  } as Variants,

  /** Eye mask transition for balance concealment */
  balanceMask: {
    initial: { opacity: 0, filter: "blur(4px)" },
    animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.18 } },
    exit: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } },
  } as Variants,
};

/**
 * Micro-interaction hover and tap properties for interactive cards & buttons.
 */
export const INTERACTION_PRESETS = {
  cardLift: {
    whileHover: { y: -2, transition: { duration: 0.14 } },
    whileTap: { scale: 0.99 },
  },
  buttonPress: {
    whileTap: { scale: 0.98 },
  },
  subtleBounce: {
    whileHover: { scale: 1.02, transition: { duration: 0.12 } },
    whileTap: { scale: 0.97 },
  },
};
