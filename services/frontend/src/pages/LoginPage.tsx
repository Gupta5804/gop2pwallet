// src/pages/LoginPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from "@chakra-ui/react";
import { Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, isAuthenticated, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };
    useEffect(() => {
        if(isAuthenticated){
            navigate('/',{ replace: true});
        }
    }, [isAuthenticated, navigate]);

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
                        <Field.Label>Password</Field.Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </Field.Root>
                    <Button
                        variant="subtle"
                        type="submit"
                        colorScheme="teal"
                        width="full"
                        loading={loading}
                    >
                        Login
                    </Button>
                    <Text>
                        Don't have an account?{' '}
                        <ChakraLink as={ReactRouterLink} href="/signup" color="teal.500">
                            Sign Up
                        </ChakraLink>
                    </Text>
                </VStack>

            </Box>
        </Container>
    );
}