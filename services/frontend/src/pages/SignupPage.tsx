import { useState, useEffect } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import apiClient from "@/services/api";
import { toaster } from '@/components/ui/toaster'

import {
    Box,
    Button,
    Container,
    Field,
    Heading,
    Input,
    VStack,
    Text,
    Link as ChakraLink,
    HStack,
    Icon,
    Separator,
} from '@chakra-ui/react';
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { LuZap, LuLock, LuSmile, LuArrowRight, LuCheck } from "react-icons/lu";

export default function SignupPage(){
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Email & Password
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect if user is already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/',{replace: true});
        }
    }, [isAuthenticated, navigate]);

    // Validate step 1
    const isStep1Valid = username.trim() && firstName.trim() && lastName.trim();

    // Validate step 2
    const isStep2Valid = email.trim() && password.trim() && confirmPassword === password && password.length >= 6;

    const handleNextStep = () => {
        if (!isStep1Valid) {
            toaster.error({
                title: 'Missing Information',
                description: 'Please fill in all fields',
                type: 'error',
                duration: 3000,
            });
            return;
        }
        setStep(2);
    };

    const handleBackStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Make the API call to the register endpoint
            const response = await apiClient.post('/auth/register', { 
                username,
                firstName,
                lastName, 
                email, 
                password
            })
            // 2. Extract the token from the successful response
            const { token } = response.data;

            if(token) {
                // 3. Log the user in automatically with the new token
                login(token);
                //4. Navigate to the main dashboard
                navigate('/',{replace:true});
            } else {
                throw new Error("Signup Successful, but no token was provided");
            }
        } catch (error: any) {
            // 5. Show a user-friendly error message if signup fails
            toaster.error({
                title: 'Signup failed',
                description: error.response?.data?.error || 'The username or email might already be taken. Please try again',
                type: 'error',
                duration: 5000,
            });
            console.error("Signup error:",error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        const googleToken = credentialResponse.credential;
        if (googleToken) {
            try {
                // Send the Google token to your single backend endpoint
                const response = await apiClient.post('/auth/google', { googleToken });
                const { token } = response.data;

                if (token) {
                    login(token);
                    navigate('/', { replace: true });
                } else {
                    throw new Error("Google login successful, but no app token was provided.");
                }
            } catch (error) {
                toaster.error({
                    title: 'Google Sign-Up Failed',
                    description: 'Could not sign you up with Google. Please try again.',
                    type: 'error',
                });
                console.error("Google login error:", error);
            }
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
                    <VStack align="start" gap={2}>
                        <Heading size="4xl" fontWeight={700} letterSpacing="-0.02em">
                            Join GoPay
                        </Heading>
                        <Text fontSize="lg" color="rgba(255, 255, 255, 0.9)" fontWeight={500}>
                            Start Sending Money Today
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
                                minW="44px"
                            >
                                <Icon as={LuZap} boxSize={6} />
                            </Box>
                            <VStack align="start" gap={1}>
                                <Text fontWeight={600} fontSize="sm">Instant Transfers</Text>
                                <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">
                                    Send money in seconds
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
                                minW="44px"
                            >
                                <Icon as={LuLock} boxSize={6} />
                            </Box>
                            <VStack align="start" gap={1}>
                                <Text fontWeight={600} fontSize="sm">Secure & Safe</Text>
                                <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">
                                    Bank-level security
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
                                minW="44px"
                            >
                                <Icon as={LuSmile} boxSize={6} />
                            </Box>
                            <VStack align="start" gap={1}>
                                <Text fontWeight={600} fontSize="sm">Easy to Use</Text>
                                <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">
                                    Simple, intuitive interface
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>
                </VStack>
            </Box>

            {/* Right Side - Signup Form */}
            <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={{ base: 4, md: 8 }}
                bg={{ base: 'white', _dark: 'gray.900' }}
            >
                <VStack maxW="sm" width="100%" gap={8}>
                    {/* Header */}
                    <VStack align="start" width="100%" gap={2}>
                        <Heading size="2xl" fontWeight={700}>
                            {step === 1 ? 'Create Account' : 'Set Password'}
                        </Heading>
                        <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                            {step === 1 
                                ? 'Tell us about yourself'
                                : 'Secure your account'
                            }
                        </Text>
                    </VStack>

                    {/* Progress Indicator */}
                    <HStack width="100%" gap={2}>
                        <Box
                            flex={1}
                            height="2px"
                            bg={step >= 1 ? "teal.500" : "gray.200"}
                            rounded="full"
                            transition="all 0.3s ease"
                        />
                        <Box
                            flex={1}
                            height="2px"
                            bg={step === 2 ? "teal.500" : "gray.200"}
                            rounded="full"
                            transition="all 0.3s ease"
                        />
                    </HStack>

                    {/* Form */}
                    <VStack
                        as="form"
                        onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}
                        width="100%"
                        gap={4}
                    >
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <>
                                {/* Username Field */}
                                <Field.Root width="100%">
                                    <Field.Label fontWeight={600} mb={2}>
                                        Username
                                    </Field.Label>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
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

                                {/* First Name Field */}
                                <Field.Root width="100%">
                                    <Field.Label fontWeight={600} mb={2}>
                                        First Name
                                    </Field.Label>
                                    <Input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Your first name"
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

                                {/* Last Name Field */}
                                <Field.Root width="100%">
                                    <Field.Label fontWeight={600} mb={2}>
                                        Last Name
                                    </Field.Label>
                                    <Input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Your last name"
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
                            </>
                        )}

                        {/* Step 2: Email & Password */}
                        {step === 2 && (
                            <>
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
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                        Minimum 6 characters
                                    </Text>
                                </Field.Root>

                                {/* Confirm Password Field */}
                                <Field.Root width="100%">
                                    <Field.Label fontWeight={600} mb={2}>
                                        Confirm Password
                                    </Field.Label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        size="lg"
                                        rounded="lg"
                                        bg={{ base: 'gray.50', _dark: 'gray.800' }}
                                        borderColor={confirmPassword && password !== confirmPassword ? "red.500" : "gray.300"}
                                        _dark={{ borderColor: confirmPassword && password !== confirmPassword ? "red.500" : 'gray.600' }}
                                        _focus={{
                                            borderColor: 'teal.500',
                                            boxShadow: '0 0 0 3px rgba(14, 124, 134, 0.1)',
                                        }}
                                        required
                                    />
                                    {confirmPassword && password !== confirmPassword && (
                                        <Text fontSize="xs" color="red.500" mt={2}>
                                            Passwords do not match
                                        </Text>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <HStack gap={1} mt={2}>
                                            <Icon as={LuCheck} boxSize={4} color="green.500" />
                                            <Text fontSize="xs" color="green.500">
                                                Passwords match
                                            </Text>
                                        </HStack>
                                    )}
                                </Field.Root>
                            </>
                        )}

                        {/* Action Buttons */}
                        <HStack width="100%" gap={3}>
                            {step === 2 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    width="100%"
                                    size="lg"
                                    onClick={handleBackStep}
                                    rounded="lg"
                                    fontWeight={600}
                                >
                                    Back
                                </Button>
                            )}
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
                                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                            >
                                {step === 1 ? 'Next' : isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </HStack>
                    </VStack>

                    {/* Only show divider and Google on step 2 */}
                    {step === 2 && (
                        <>
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
                                            title: 'Sign-Up Failed',
                                            description: 'Google sign-up failed. Please try again.',
                                            type: 'error',
                                            duration: 5000,
                                        })
                                    }}
                                />
                            </Box>
                        </>
                    )}

                    {/* Login Link */}
                    <Text textAlign="center" color="gray.600" _dark={{ color: 'gray.400' }}>
                        Already have an account?{' '}
                        <ChakraLink
                            asChild
                            color="teal.600"
                            _dark={{ color: 'teal.400' }}
                            fontWeight={600}
                            _hover={{ textDecoration: 'underline' }}
                        >
                            <ReactRouterLink to="/login">
                                Sign In
                            </ReactRouterLink>
                        </ChakraLink>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
}
