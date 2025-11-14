import { Card, Skeleton, VStack, HStack } from '@chakra-ui/react'

/**
 * SkeletonCard Component
 * Loading state component showing placeholder cards
 */
export function SkeletonCard() {
  return (
    <Card.Root variant="elevated">
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Skeleton height="20px" width="60%" />
          <Skeleton height="40px" width="100%" />
          <HStack gap={4}>
            <Skeleton height="15px" width="30%" />
            <Skeleton height="15px" width="25%" />
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

/**
 * SkeletonCardGrid Component
 * Multiple loading skeleton cards for grid layouts
 */
export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}
