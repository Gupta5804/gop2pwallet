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
    Spacer,
} from '@chakra-ui/react';
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
export default function SignupPage(){
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect if user is alreeady logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/',{replace: true});
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Make the API call to the register endpoint
            const response = await apiClient.post('/auth/register', { username,firstName,lastName, email, password})
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
        } catch (error) {
            // 5. Show a user-friendly error message if signup fails
            toaster.create({
                title: 'Signup failed',
                description:'The username or email might already be taken. Please try again',
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
                toaster.create({
                    title: 'Google Sign-Up Failed',
                    description: 'Could not sign you up with Google. Please try again.',
                    type: 'error',
                });
                console.error("Google login error:", error);
            }
        }
    };
    return (
        <Container centerContent>
            <Box
                p={8}
                mt={20}
                maxWidth="400px"
                borderWidth={1}
                borderRadius={8}
                boxShadow="lg"
            >
                <VStack as="form" onSubmit={handleSubmit}>
                    <Heading as="h1" size = "lg" textAlign="center">
                        Create an Account
                    </Heading>
                    <Field.Root required>
                        <Field.Label>
                            Username
                            <Input
                                type="text"
                                value={username}
                                onChange={(e)=>setUsername(e.target.value)}
                                placeholder="Choose a username"
                            />
                        </Field.Label>
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            First Name
                            <Input
                                type="text"
                                value={firstName}
                                onChange={(e)=>setFirstName(e.target.value)}
                                placeholder="First Name"
                            />
                        </Field.Label>
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            Username
                            <Input
                                type="text"
                                value={lastName}
                                onChange={(e)=>setLastName(e.target.value)}
                                placeholder="Last Name"
                            />
                        </Field.Label>
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            Email Address
                            <Input
                                type="email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </Field.Label>
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            Password
                            <Input
                                type="password"
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
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
                        Sign up
                    </Button>
                    <Text>
                        Already have an account?{' '}
                        <ChakraLink color="teal.500" asChild>
                            <ReactRouterLink to="/login">
                                Login
                            </ReactRouterLink>
                        </ChakraLink>
                    </Text>
                </VStack>
                <HStack my={4}>
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