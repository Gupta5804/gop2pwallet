/**
 * NotFoundPage (404)
 * Displayed when user navigates to a route that doesn't exist
 */

import { Box, Heading, Text, Button, VStack, Center, Icon } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { LuSearchX, LuArrowLeft } from 'react-icons/lu'

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <Box
            minH="100vh"
            bg={{ base: 'white', _dark: 'gray.900' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={{ base: 4, md: 8 }}
        >
            <Center flexDirection="column" gap={6} maxW="md" width="100%">
                {/* 404 Graphic */}
                <VStack gap={2} align="center">
                    <Icon as={LuSearchX} boxSize={20} color="gray.300" _dark={{ color: 'gray.700' }} />
                    <Text fontSize="6xl" fontWeight={800} color="gray.200" _dark={{ color: 'gray.800' }} letterSpacing="-2px">
                        404
                    </Text>
                </VStack>

                {/* Error Message */}
                <VStack gap={2} align="center" width="100%">
                    <Heading size="lg" textAlign="center">
                        Page Not Found
                    </Heading>
                    <Text
                        fontSize="md"
                        color="gray.600"
                        _dark={{ color: 'gray.400' }}
                        textAlign="center"
                    >
                        The page you're looking for doesn't exist or has been moved.
                    </Text>
                </VStack>

                {/* Action Buttons */}
                <VStack gap={3} width="100%" pt={4}>
                    <Button
                        width="100%"
                        size="lg"
                        onClick={() => navigate(-1)}
                        bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                        color="white"
                        fontWeight={600}
                        _hover={{
                            opacity: 0.9,
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                        }}
                    >
                        <Icon as={LuArrowLeft} mr={2} />
                        Go Back
                    </Button>
                    <Button
                        width="100%"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/')}
                        borderColor="teal.600"
                        color="teal.600"
                        _dark={{ borderColor: 'teal.400', color: 'teal.400' }}
                        fontWeight={600}
                        _hover={{
                            bg: 'teal.50',
                            _dark: { bg: 'rgba(20, 184, 166, 0.1)' },
                        }}
                    >
                        <Icon as={LuArrowLeft} mr={2} />
                        Go Home
                    </Button>
                </VStack>

                {/* Help Text */}
                <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }} textAlign="center">
                    Lost? Our team is here to help: support@gopay.com
                </Text>
            </Center>
        </Box>
    )
}
