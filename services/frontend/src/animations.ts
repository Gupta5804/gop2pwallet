/**
 * Animation Variants and Transitions
 * Framer Motion animation definitions for consistent animations across the app
 */

export const animations = {
  // Page Transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  pageExit: {
    initial: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Fade In/Out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },

  fadeOut: {
    initial: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Slide Animations
  slideInLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideInRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideInUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideInDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Scale Animations
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  scaleInCenter: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Bounce
  bounce: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: 1,
    },
  },

  // Modal
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  modalContent: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Card Hover
  cardHover: {
    whileHover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    whileTap: { scale: 0.98 },
  },

  // Button Hover
  buttonHover: {
    whileHover: {
      scale: 1.02,
      y: -2,
    },
    whileTap: { scale: 0.98 },
  },

  // Loading Spinner
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },

  // Pulse
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  // Shake (for errors)
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },

  // Success Check
  successCheck: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    rotate: [0, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },

  // List Item Stagger
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },

  // Dropdown
  dropdownEnter: {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Tooltip
  tooltipEnter: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.15 },
  },

  // Notification Toast
  toastEnter: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Tab Switch
  tabSwitch: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },
}

/**
 * Transition Durations
 */
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '800ms',
}

/**
 * Easing Functions
 */
export const easing = {
  linear: 'linear',
  ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}
