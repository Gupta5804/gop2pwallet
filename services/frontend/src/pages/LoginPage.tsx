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
    Center,
    HStack,
    Separator

} from "@chakra-ui/react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toaster } from "@/components/ui/toaster"
import { useNavigate, Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/api';

export default function LoginPage() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // local loading state for the form button

    const navigate = useNavigate();
    
    const { login, isAuthenticated } = useAuth();

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
            const response = await apiClient.post('/auth/login',{email, password});
            //2. Extract the token from the successful response
            const { token } = response.data;

            if(token) {
                // 3. Pass the token to the AuthContext
                login(token);
                //4. Navigate to the main dashboard page
                navigate('/',{replace: true}) 
            } else {
                throw new Error("Login Successful, but no token provided by the server");
            }
        } catch (error) {
            toaster.create({
                title: 'Login Failed',
                description: 'Incorrect email or password. Please try again',
                type: 'error',
                duration: 5000,
            });
            console.error("Login Error:",error);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        
        const googleToken = credentialResponse.credential;

        try {
            // send the google token to the backend
            const response = await apiClient.post('/auth/google', {googleToken});
            const { token } = response.data;

            if (token) {
                login(token);
                navigate('/', { replace: true });
            } else {
                throw new Error("Login Successful, but no token provided by the server");
            }
        } catch (error) {
            toaster.create({
                title: 'Google Login Failed',
                description: 'An error occurred while logging in with Google. Please try again',
                type: 'error',
                duration: 5000,
            });
            console.error("Google login error:",error);
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
                <HStack my={4}>
                    <Separator orientation="vertical" />
                        <Text fontSize="sm" alignContent="center" whiteSpace="nowrap">OR</Text>
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