/**
 * AnimatedModalWrapper
 * Provides consistent animation effects for modals and dialogs
 * Used as a wrapper around Dialog.Content for smooth entrance/exit
 */

import { Box, BoxProps } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export interface AnimatedModalWrapperProps extends BoxProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean

  /**
   * Animation type
   */
  animationType?: 'scale' | 'slideUp' | 'slideDown' | 'fade'

  /**
   * Duration in milliseconds
   */
  duration?: number
}

/**
 * AnimatedModalWrapper - Wraps Dialog.Content with entrance/exit animations
 */
export const AnimatedModalWrapper = ({
  isOpen,
  animationType = 'scale',
  duration = 300,
  children,
  ...props
}: AnimatedModalWrapperProps) => {
  const [isAnimating, setIsAnimating] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => setIsAnimating(false), duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration])

  const getAnimationStyles = () => {
    const durationStr = String(duration)
    const easing = 'cubic-bezier(0.4, 0, 0.2, 1)'

    switch (animationType) {
      case 'scale':
        return {
          animation: isOpen
            ? `scaleIn ${durationStr}ms ${easing}`
            : `scaleOut ${durationStr}ms ${easing}`,
          transformOrigin: 'center',
        }

      case 'slideUp':
        return {
          animation: isOpen
            ? `slideInUp ${durationStr}ms ${easing}`
            : `slideOutDown ${durationStr}ms ${easing}`,
        }

      case 'slideDown':
        return {
          animation: isOpen
            ? `slideInDown ${durationStr}ms ${easing}`
            : `slideOutUp ${durationStr}ms ${easing}`,
        }

      case 'fade':
        return {
          animation: isOpen
            ? `fadeIn ${durationStr}ms ${easing}`
            : `fadeOut ${durationStr}ms ${easing}`,
        }

      default:
        return {}
    }
  }

  if (!isAnimating && !isOpen) {
    return null
  }

  return (
    <Box {...(getAnimationStyles() as any)} {...props}>
      {children}
    </Box>
  )
}
