/**
 * SkeletonLoader Components
 * Professional skeleton screens for loading states
 * Used to show placeholder content while data is loading
 */

import { Box, Skeleton, Stack } from '@chakra-ui/react'

/**
 * SkeletonCard - Single skeleton card loader
 * Mimics the card layout while loading
 */
export const SkeletonCard = ({ count = 1 }: { count?: number }) => {
  return (
    <Stack gap={3} width="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          width="100%"
          p={4}
          borderRadius="md"
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <Stack gap={3}>
            <Skeleton height="24px" borderRadius="md" />
            <Box display="flex" gap={2} justifyContent="space-between">
              <Skeleton height="16px" width="40%" borderRadius="md" />
              <Skeleton height="16px" width="30%" borderRadius="md" />
            </Box>
            <Skeleton height="14px" width="50%" borderRadius="md" />
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

/**
 * SkeletonTransaction - Skeleton for transaction list items
 * Shows 3 transaction skeleton items by default
 */
export const SkeletonTransaction = ({ count = 3 }: { count?: number }) => {
  return (
    <Stack gap={4} width="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          width="100%"
          p={4}
          borderRadius="lg"
          bg="white"
          border="1px"
          borderColor="gray.200"
          _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
        >
          <Box display="flex" gap={4} justifyContent="space-between">
            {/* Icon placeholder */}
            <Skeleton
              height="44px"
              width="44px"
              borderRadius="full"
              flexShrink={0}
            />

            {/* Content placeholder */}
            <Stack gap={2} alignItems="flex-start" flex={1} width="100%">
              <Skeleton height="16px" width="60%" borderRadius="md" />
              <Skeleton height="14px" width="40%" borderRadius="md" />
            </Stack>

            {/* Amount placeholder */}
            <Skeleton
              height="18px"
              width="25%"
              borderRadius="md"
              flexShrink={0}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  )
}

/**
 * SkeletonBalance - Skeleton for balance card
 */
export const SkeletonBalance = () => {
  return (
    <Box
      width="100%"
      p={6}
      borderRadius="lg"
      bg="white"
      border="1px"
      borderColor="gray.200"
      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
    >
      <Stack gap={4} alignItems="flex-start" width="100%">
        {/* Title */}
        <Skeleton height="20px" width="40%" borderRadius="md" />

        {/* Amount */}
        <Skeleton height="32px" width="50%" borderRadius="md" />

        {/* Subtext */}
        <Skeleton height="14px" width="35%" borderRadius="md" />

        {/* Action button area */}
        <Box display="flex" gap={2} width="100%">
          <Skeleton height="40px" flex={1} borderRadius="md" />
          <Skeleton height="40px" flex={1} borderRadius="md" />
        </Box>
      </Stack>
    </Box>
  )
}

/**
 * SkeletonStats - Skeleton for stats cards
 */
export const SkeletonStats = ({ count = 2 }: { count?: number }) => {
  return (
    <Box display="flex" gap={4} width="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          flex={1}
          p={4}
          borderRadius="md"
          bg="white"
          border="1px"
          borderColor="gray.200"
          _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
        >
          <Stack gap={2} alignItems="flex-start">
            <Skeleton height="14px" width="60%" borderRadius="md" />
            <Skeleton height="24px" width="70%" borderRadius="md" />
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

/**
 * SkeletonDashboard - Full dashboard skeleton
 * Shows balance + stats + transactions skeleton
 */
export const SkeletonDashboard = () => {
  return (
    <Stack gap={6} width="100%" alignItems="stretch">
      {/* Header/Welcome section */}
      <Stack gap={2} alignItems="flex-start">
        <Skeleton height="28px" width="40%" borderRadius="md" />
        <Skeleton height="16px" width="60%" borderRadius="md" />
      </Stack>

      {/* Balance Card */}
      <SkeletonBalance />

      {/* Stats */}
      <SkeletonStats count={2} />

      {/* Transactions Header */}
      <Skeleton height="20px" width="30%" borderRadius="md" />

      {/* Transaction List */}
      <SkeletonTransaction count={3} />
    </Stack>
  )
}

/**
 * SkeletonForm - Skeleton for form inputs
 */
export const SkeletonForm = ({ count = 3 }: { count?: number }) => {
  return (
    <Stack gap={4} width="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} width="100%">
          {/* Label */}
          <Skeleton height="16px" width="30%" borderRadius="md" mb={2} />
          {/* Input */}
          <Skeleton height="40px" width="100%" borderRadius="md" />
        </Box>
      ))}

      {/* Button */}
      <Skeleton height="40px" width="100%" borderRadius="md" mt={4} />
    </Stack>
  )
}

/**
 * SkeletonAvatar - Skeleton for user avatar
 */
export const SkeletonAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: '32px',
    md: '44px',
    lg: '56px',
  }

  return (
    <Skeleton
      height={sizeMap[size]}
      width={sizeMap[size]}
      borderRadius="full"
    />
  )
}

/**
 * SkeletonList - Generic skeleton list
 */
export const SkeletonList = ({
  count = 5,
  height = '60px',
}: {
  count?: number
  height?: string
}) => {
  return (
    <Stack gap={3} width="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={height} width="100%" borderRadius="md" />
      ))}
    </Stack>
  )
}
