import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    VStack,
    Text,
    Input,
    Field,
    HStack,
    Heading,
    Link as ChakraLink,
    Icon,
    Separator,
} from "@chakra-ui/react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toaster } from "@/components/ui/toaster"
import { ColorModeButton } from "@/components/ui/color-mode"
import { useNavigate, Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LuZap, LuLock, LuSmile, LuArrowRight } from 'react-icons/lu';
import { FaGithub } from 'react-icons/fa';
import { Badge, Link } from '@chakra-ui/react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login, googleLogin, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login({ email, password });
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Login Failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        try {
            if (response.credential) {
                await googleLogin(response.credential);
                navigate('/', { replace: true });
            } else {
                toaster.error({
                    title: 'Google Login Failed',
                    description: 'No credential received from Google. Please try again.',
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error("Google login failed in component", error);
        }
    };

    return (
        <Box minH="100vh" display="flex" alignItems="stretch" bg={{ base: 'white', _dark: 'gray.900' }}>
            {/* Left Side - Hero Section */}
            <Box
                flex={1}
                background="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                display={{ base: 'none', md: 'flex' }}
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                p={8}
                color="white"
                position="relative"
                overflow="hidden"
            >
                {/* Decorative background elements */}
                <Box
                    position="absolute"
                    width="400px"
                    height="400px"
                    bg="rgba(255, 255, 255, 0.05)"
                    rounded="full"
                    top={-100}
                    right={-100}
                />
                <Box
                    position="absolute"
                    width="300px"
                    height="300px"
                    bg="rgba(255, 255, 255, 0.05)"
                    rounded="full"
                    bottom={-50}
                    left={-50}
                />

                <VStack
                    gap={8}
                    align="start"
                    position="relative"
                    zIndex={1}
                    maxW="md"
                >
                    {/* Logo/Branding */}
                    <VStack align="start" gap={4}>
                        <Badge colorPalette="blue" variant="solid" size="lg">
                            Full Stack Project
                        </Badge>
                        <Heading size="4xl" fontWeight={700} letterSpacing="-0.02em" lineHeight="1.1">
                            GoP2P Wallet System
                        </Heading>
                        <Text fontSize="lg" color="rgba(255, 255, 255, 0.9)" fontWeight={500} lineHeight="relaxed">
                            A Microservices-based Payment Platform demonstrating Go, gRPC, RabbitMQ, and React.
                        </Text>
                    </VStack>

                    {/* Features */}
                    <VStack gap={6} align="start" pt={4}>
                        <HStack gap={4} align="start">
                            <Box
                                p={3}
                                bg="rgba(255, 255, 255, 0.15)"
                                rounded="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={LuZap} boxSize={6} />
                            </Box>
                            <VStack align="start" gap={1}>
                                <Text fontWeight={600} fontSize="sm">Instant Transfers</Text>
                                <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">
                                    Send money to friends in seconds
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack gap={4} align="start">
                            <Box
                                p={3}
                                bg="rgba(255, 255, 255, 0.15)"
                                rounded="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={LuLock} boxSize={6} />
                            </Box>
                            <VStack align="start" gap={1}>
                                <Text fontWeight={600} fontSize="sm">Bank-Level Security</Text>
                                <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">
                                    Your money is always protected
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack gap={4} align="start">
                            <Box
                                p={3}
                                bg="rgba(255, 255, 255, 0.15)"
                                rounded="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={LuSmile} boxSize={6} />
                            </Box>
                            <VStack align="start" gap={1}>
                                <Text fontWeight={600} fontSize="sm">Simple to Use</Text>
                                <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">
                                    Easy-to-use interface for everyone
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>


                    {/* Engineering Link */}
                    <Box pt={8}>
                        <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
                            <ReactRouterLink to="/engineering">
                                <Button
                                    variant="outline"
                                    color="white"
                                    size="lg"
                                    borderColor="whiteAlpha.400"
                                    _hover={{
                                        bg: "whiteAlpha.200",
                                        transform: "translateX(5px)",
                                        borderColor: "whiteAlpha.800"
                                    }}
                                    transition="all 0.3s ease"
                                >
                                    <HStack gap={2}>
                                        <Text>View System Architecture</Text>
                                        <Icon as={LuArrowRight} />
                                    </HStack>
                                </Button>
                            </ReactRouterLink>
                        </ChakraLink>
                    </Box>
                </VStack>
            </Box>

            {/* Right Side - Login Form */}
            <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={{ base: 4, md: 8 }}
                bg={{ base: 'gray.50', _dark: 'gray.900' }}
                position="relative"
            >
                <Box position="absolute" top={4} right={4}>
                    <ColorModeButton />
                </Box>
                <Box
                    w="100%"
                    maxW="md"
                    bg={{ base: "white", _dark: "gray.800" }}
                    p={{ base: 8, md: 10 }}
                    rounded="2xl"
                    shadow="xl"
                    border="1px solid"
                    borderColor={{ base: "gray.100", _dark: "gray.700" }}
                >
                    <VStack width="100%" gap={8}>
                        {/* Header */}
                        <VStack align="center" width="100%" gap={2} textAlign="center">
                            <Heading size="3xl" fontWeight={800} letterSpacing="-0.01em">
                                Welcome Back
                            </Heading>
                            <Text color="gray.500" _dark={{ color: 'gray.400' }} fontSize="md">
                                Sign in to your account to continue
                            </Text>
                        </VStack>

                        {/* Form */}
                        <VStack
                            as="form"
                            onSubmit={handleSubmit}
                            width="100%"
                            gap={4}
                        >
                            {/* Email Field */}
                            <Field.Root width="100%">
                                <Field.Label fontWeight={600} mb={2}>
                                    Email Address
                                </Field.Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    size="lg"
                                    rounded="lg"
                                    bg={{ base: 'gray.50', _dark: 'gray.800' }}
                                    borderColor="gray.300"
                                    _dark={{ borderColor: 'gray.600' }}
                                    _focus={{
                                        borderColor: 'teal.500',
                                        boxShadow: '0 0 0 3px rgba(14, 124, 134, 0.1)',
                                    }}
                                    required
                                />
                            </Field.Root>

                            {/* Password Field */}
                            <Field.Root width="100%">
                                <Field.Label fontWeight={600} mb={2}>
                                    Password
                                </Field.Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    size="lg"
                                    rounded="lg"
                                    bg={{ base: 'gray.50', _dark: 'gray.800' }}
                                    borderColor="gray.300"
                                    _dark={{ borderColor: 'gray.600' }}
                                    _focus={{
                                        borderColor: 'teal.500',
                                        boxShadow: '0 0 0 3px rgba(14, 124, 134, 0.1)',
                                    }}
                                    required
                                />
                            </Field.Root>

                            {/* Forgot Password Link - REMOVED for Portfolio Demo */}
                            {/* <HStack width="100%" justify="flex-end"> ... </HStack> */}

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                width="100%"
                                size="lg"
                                background="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                                color="white"
                                loading={isSubmitting}
                                rounded="lg"
                                fontWeight={600}
                                fontSize="md"
                                transition="all 0.3s ease"
                                _hover={{
                                    opacity: 0.9,
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                _active={{
                                    transform: 'translateY(0)',
                                }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                }}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </VStack>

                        {/* Divider */}
                        <HStack width="100%" gap={3}>
                            <Separator />
                            <Text color="gray.500" fontSize="sm" whiteSpace="nowrap" fontWeight={500}>
                                OR
                            </Text>
                            <Separator />
                        </HStack>

                        {/* Google Login */}
                        <Box width="100%">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    toaster.error({
                                        title: 'Login Failed',
                                        description: 'Google login failed. Please try again.',
                                        type: 'error',
                                        duration: 5000,
                                    })
                                }}
                            />
                        </Box>

                        {/* Sign Up Link */}
                        <Text textAlign="center" color="gray.600" _dark={{ color: 'gray.400' }}>
                            Don't have an account?{' '}
                            <ChakraLink
                                asChild
                                color="teal.600"
                                _dark={{ color: 'teal.400' }}
                                fontWeight={600}
                                _hover={{ textDecoration: 'underline' }}
                            >
                                <ReactRouterLink to="/signup">
                                    Create one now
                                </ReactRouterLink>
                            </ChakraLink>
                        </Text>

                        {/* GitHub Link Footer */}
                        <VStack gap={2} pt={4} width="100%">
                            <Link
                                asChild
                                width="100%"
                                _hover={{ textDecoration: 'none' }}
                            >
                                <a
                                    href="https://github.com/gupta5804/gop2pwallet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        width="100%"
                                        size="md"
                                        color="gray.600"
                                        borderColor="gray.300"
                                        _dark={{
                                            color: "gray.300",
                                            borderColor: "gray.600",
                                            _hover: { bg: "whiteAlpha.100", borderColor: "gray.400" }
                                        }}
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            boxShadow: "md",
                                            borderColor: "gray.400",
                                            bg: "gray.50"
                                        }}
                                        transition="all 0.3s ease"
                                    >
                                        <Icon as={FaGithub} mr={2} />
                                        View Source Code on GitHub
                                    </Button>
                                </a>
                            </Link>
                        </VStack>
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
}
