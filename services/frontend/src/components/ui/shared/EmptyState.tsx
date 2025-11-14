import { VStack, Box, Heading, Text, Icon, Button, Center } from '@chakra-ui/react'
import React from 'react'

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * EmptyState Component
 * Displays when there's no data to show
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Center py={12}>
      <VStack gap={4} textAlign="center" maxW="sm">
        {/* Icon Circle */}
        <Box
          p={6}
          bg="gray.100"
          _dark={{ bg: 'gray.800' }}
          rounded="full"
        >
          <Icon as={icon} boxSize={8} color="gray.400" />
        </Box>

        {/* Title */}
        <Heading size="md" fontWeight={600} color="gray.700" _dark={{ color: 'gray.200' }}>
          {title}
        </Heading>

        {/* Description */}
        <Text color="gray.500" _dark={{ color: 'gray.400' }}>
          {description}
        </Text>

        {/* Action Button */}
        {action && (
          <Button
            mt={4}
            colorPalette="teal"
            onClick={action.onClick}
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-2px)',
            }}
          >
            {action.label}
          </Button>
        )}
      </VStack>
    </Center>
  )
}
