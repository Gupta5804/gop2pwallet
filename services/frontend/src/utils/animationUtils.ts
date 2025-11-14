/**
 * Animation Utilities
 * Helper functions and constants for consistent animations across the app
 */

/**
 * Animation Timing Standards (in milliseconds)
 */
export const animationTiming = {
  quick: 100, // Very quick interactions (hover, press)
  fast: 150, // Fast transitions
  base: 200, // Standard transition
  normal: 300, // Normal transition
  slow: 400, // Slow transition
  slower: 500, // Slower transition
  slowest: 800, // Slowest transition
} as const

/**
 * Easing Functions
 * CSS cubic-bezier curves for smooth animations
 */
export const easingFunctions = {
  // Standard easings
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier curves
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',

  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInOutCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',

  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',

  // Special curves
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
} as const

/**
 * Animation Keyframe Classes
 * Common CSS keyframes for animations
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  slideInUp: `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  slideInDown: `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  slideInLeft: `
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  slideInRight: `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,

  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,

  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,

  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,

  shake: `
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }
  `,

  float: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }
  `,

  wiggle: `
    @keyframes wiggle {
      0%, 100% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(-1deg);
      }
      75% {
        transform: rotate(1deg);
      }
    }
  `,
} as const

/**
 * Animation Presets
 * Pre-configured animation combinations
 */
export const animationPresets = {
  // Fade animations
  fadeIn: `fadeIn ${animationTiming.normal}ms ${easingFunctions.easeOutQuad}`,
  fadeOut: `fadeOut ${animationTiming.fast}ms ${easingFunctions.easeInQuad}`,

  // Slide animations
  slideInUp: `slideInUp ${animationTiming.normal}ms ${easingFunctions.easeOutQuad}`,
  slideInDown: `slideInDown ${animationTiming.normal}ms ${easingFunctions.easeOutQuad}`,
  slideInLeft: `slideInLeft ${animationTiming.normal}ms ${easingFunctions.easeOutQuad}`,
  slideInRight: `slideInRight ${animationTiming.normal}ms ${easingFunctions.easeOutQuad}`,

  // Scale animations
  scaleIn: `scaleIn ${animationTiming.normal}ms ${easingFunctions.easeOutQuad}`,

  // Loading animations
  pulse: `pulse ${animationTiming.slowest * 2}ms ${easingFunctions.easeInOut} infinite`,
  spin: `spin ${animationTiming.slowest}ms ${easingFunctions.linear} infinite`,
  shimmer: `shimmer 2s ${easingFunctions.linear} infinite`,

  // Attention animations
  bounce: `bounce ${animationTiming.slow}ms ${easingFunctions.ease} 2`,
  shake: `shake ${animationTiming.slow}ms ${easingFunctions.easeInOut}`,
  float: `float 3s ${easingFunctions.easeInOut} infinite`,
  wiggle: `wiggle 0.5s ${easingFunctions.ease}`,
} as const

/**
 * Get CSS animation string
 * @param name Animation name from presets
 * @returns CSS animation string
 *
 * @example
 * const animation = getAnimation('fadeIn')
 * // Returns: "fadeIn 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
 */
export const getAnimation = (name: keyof typeof animationPresets): string => {
  return animationPresets[name]
}

/**
 * Create stagger animation delay
 * @param index Item index in array
 * @param delayPerItem Milliseconds per item
 * @returns Delay in milliseconds
 *
 * @example
 * const delay = getStaggerDelay(2, 50)
 * // Returns: 100 (2 * 50)
 */
export const getStaggerDelay = (index: number, delayPerItem: number = 50): number => {
  return index * delayPerItem
}

/**
 * Create stagger animation CSS
 * @param index Item index
 * @param delayPerItem Milliseconds per item
 * @returns Animation delay CSS
 *
 * @example
 * const css = getStaggerCss(2, 50)
 * // Returns: "animation-delay: 100ms"
 */
export const getStaggerCss = (index: number, delayPerItem: number = 50): string => {
  return `animation-delay: ${getStaggerDelay(index, delayPerItem)}ms`
}

/**
 * Chakra UI animation props for common animations
 * Used with Chakra's motion components
 */
export const chakraAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: animationTiming.normal / 1000 },
  },

  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: animationTiming.normal / 1000 },
  },

  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: animationTiming.normal / 1000 },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: animationTiming.normal / 1000 },
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: animationTiming.normal / 1000 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: animationTiming.normal / 1000 },
  },

  scaleInCenter: {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
    transition: { duration: animationTiming.slow / 1000 },
  },
}
