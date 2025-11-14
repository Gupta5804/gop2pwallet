/**
 * LoadingSpinner Component
 * Reusable loading spinner with customizable size and color
 * Used for async operations, button loading states, and data fetching
 */

import { Spinner, Center, Box, Text } from '@chakra-ui/react'

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'lg'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Color of the spinner
   * @default 'teal.500'
   */
  color?: string

  /**
   * Optional label text to display below spinner
   */
  label?: string

  /**
   * Vertical padding
   * @default 8
   */
  py?: number | string

  /**
   * Show spinner inline instead of centered
   * @default false
   */
  inline?: boolean
}

/**
 * LoadingSpinner - Professional loading indicator
 *
 * @example
 * // Basic usage
 * <LoadingSpinner />
 *
 * @example
 * // With label
 * <LoadingSpinner label="Loading data..." />
 *
 * @example
 * // Inline spinner
 * <LoadingSpinner inline size="md" />
 *
 * @example
 * // Custom styling
 * <LoadingSpinner size="xl" color="purple.500" label="Processing..." />
 */
export const LoadingSpinner = ({
  size = 'lg',
  color = 'teal.500',
  label,
  py = 8,
  inline = false,
}: LoadingSpinnerProps) => {
  const spinner = (
    <Spinner
      size={size}
      color={color}
      role="status"
      aria-label="Loading"
    />
  )

  // If inline, just return the spinner
  if (inline) {
    if (label) {
      return (
        <Box display="flex" gap={2} alignItems="center">
          {spinner}
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            {label}
          </Text>
        </Box>
      )
    }
    return spinner
  }

  // Otherwise, center it
  return (
    <Center py={py} flexDirection="column" gap={4}>
      {spinner}
      {label && (
        <Text
          fontSize="sm"
          color="gray.600"
          _dark={{ color: 'gray.400' }}
          textAlign="center"
        >
          {label}
        </Text>
      )}
    </Center>
  )
}

/**
 * LoadingSpinnerButton - Spinner for button loading states
 * Smaller variant for inline use in buttons
 */
export const LoadingSpinnerButton = ({
  color = 'white',
}: { color?: string }) => (
  <Spinner
    size="sm"
    color={color}
    role="status"
    aria-label="Loading"
  />
)
