import { Box, BoxProps } from '@chakra-ui/react'
import React from 'react'

interface GradientCardProps extends BoxProps {
  gradient?: string
  children: React.ReactNode
}

/**
 * GradientCard Component
 * A styled card component with gradient background for prominent displays
 */
export function GradientCard({
  gradient = 'linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)',
  children,
  ...props
}: GradientCardProps) {
  return (
    <Box
      background={gradient}
      color="white"
      position="relative"
      overflow="hidden"
      boxShadow="lg"
      borderRadius="md"
      p={6}
      transition="all 0.3s ease"
      _hover={{
        boxShadow: 'xl',
        transform: 'translateY(-2px)',
      }}
      {...props}
    >
      {/* Decorative background element */}
      <Box
        position="absolute"
        right={-20}
        top={-20}
        width={100}
        height={100}
        bg="rgba(255, 255, 255, 0.1)"
        rounded="full"
        pointerEvents="none"
      />
      {children}
    </Box>
  )
}
