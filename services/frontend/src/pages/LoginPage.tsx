// src/pages/LoginPage.tsx

import { useState, useEffect } from 'react';

import { 
    Heading,
    Box,
    Button,
    Container,
    VStack,
    Text,
    Link as ChakraLink,
    Field,
    Input,
    HStack,
    Separator,
    Center,
    Spacer

} from "@chakra-ui/react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toaster } from "@/components/ui/toaster"
import { useNavigate, Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // local loading state for the form button

    const navigate = useNavigate();
    
    const { login, googleLogin, isAuthenticated } = useAuth();

    useEffect(() => {
        if(isAuthenticated){
            navigate('/',{ replace: true});
        }
    }, [isAuthenticated, navigate]);
    // Handler for regular email/password login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            //1. Make the API call directly from the login page
            await login({email, password});
            //2. Extract the token from the successful response
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Login Failed",error);
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
            console.error("Google login failed in component",error);
        }
    };
    

    return (
        <Container centerContent >
            <Box
                p={8}
                mt={20}
                maxWidth="400px"
                borderWidth={1}
                borderRadius={8}
                boxShadow="lg"
            >
                <VStack as="form" onSubmit={handleSubmit} align="center">
                    <Heading as="h1" size = "lg" textAlign="center">
                        Login to your account
                    </Heading>
                    <Field.Root required>
                        <Field.Label>
                            Email Address
                            <Input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </Field.Label>
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            Password
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        </Field.Label>
                    </Field.Root>
                    <Button
                        variant="subtle"
                        type="submit"
                        colorScheme="teal"
                        width="full"
                        loading={isSubmitting}
                    >
                        Login
                    </Button>
                    <Text>
                        Don't have an account?{' '}
                        <ChakraLink color="teal.500" asChild>
                            <ReactRouterLink to="/signup">
                                Sign Up
                            </ReactRouterLink>
                        </ChakraLink>
                    </Text>
                </VStack>
                <HStack my={4} align="center">
                    <Spacer/>
                        <Text fontSize="sm" alignSelf="center" whiteSpace="nowrap">OR</Text>
                    <Spacer/>
                </HStack>
                <Box>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            toaster.create({
                                title: 'Google Login Failed',
                                description: 'An error occurred while logging in with Google. Please try again',
                                type: 'error',
                                duration: 5000,
                            });
                        }}
                    />
                </Box>

            </Box>
        </Container>
    );
}