/**
 * ErrorBoundary Component
 * Catches React errors and displays a fallback UI
 * Prevents entire app from crashing due to single component error
 */

import { Component, ReactNode } from 'react'
import { Box, VStack, Heading, Text, Button, Icon, Center } from '@chakra-ui/react'
import { LuCircleAlert, LuRotateCcw, LuArrowLeft } from 'react-icons/lu'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onReset?: () => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: any
}

/**
 * ErrorBoundary - Error boundary component for React error handling
 * 
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo)
        this.setState(prevState => ({
            ...prevState,
            errorInfo,
        }))

        // Send to error tracking service here (e.g., Sentry, LogRocket)
        // Example: captureException(error, { contexts: { react: errorInfo } })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        this.props.onReset?.()
    }

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Box 
                    minH="100vh" 
                    bg={{ base: 'white', _dark: 'gray.900' }} 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                >
                    <Center flexDirection="column" gap={6} maxW="md" mx="auto" p={8}>
                        <Icon as={LuCircleAlert} boxSize={16} color="red.500" />

                        <Heading size="lg" textAlign="center">
                            Something Went Wrong
                        </Heading>

                        <VStack gap={2} align="center" width="100%">
                            <Text 
                                fontSize="sm" 
                                color="gray.600" 
                                _dark={{ color: 'gray.400' }} 
                                textAlign="center"
                            >
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </Text>
                            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.errorInfo && (
                                <Box
                                    fontSize="xs"
                                    bg="red.50"
                                    p={3}
                                    borderRadius="md"
                                    overflow="auto"
                                    maxH="200px"
                                    width="100%"
                                    fontFamily="monospace"
                                    color="red.700"
                                    _dark={{ bg: 'rgba(239, 68, 68, 0.1)', color: 'red.300' }}
                                >
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                </Box>
                            )}
                        </VStack>

                        <VStack gap={3} width="100%">
                            <Button
                                width="100%"
                                size="lg"
                                onClick={this.handleReset}
                                bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                                color="white"
                                fontWeight={600}
                                _hover={{
                                    opacity: 0.9,
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                            >
                                <Icon as={LuRotateCcw} mr={2} />
                                Try Again
                            </Button>
                            <Button
                                width="100%"
                                variant="outline"
                                size="lg"
                                onClick={this.handleGoHome}
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

                        <Text 
                            fontSize="xs" 
                            color="gray.500" 
                            _dark={{ color: 'gray.500' }} 
                            textAlign="center"
                        >
                            If this problem persists, please contact support
                        </Text>
                    </Center>
                </Box>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
