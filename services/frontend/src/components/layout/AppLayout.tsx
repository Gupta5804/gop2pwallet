// src/components/layout/AppLayout.tsx

import { Box, Container, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavBar from './Navbar';

export default function AppLayout() {
    return (
        <Flex 
            direction="column"
            minH="100vh"
            bg="#F8FAFB"
            _dark={{ bg: "gray.900" }}
        >
            <NavBar/>

            <Box 
                as="main" 
                flex="1" 
                py={{ base: 6, md: 8 }}
                width="100%"
            >
                <Container 
                    maxW="container.xl"
                    px={{ base: 4, md: 6, lg: 8 }}
                    mx="auto"
                    width="100%"
                >
                    <Outlet />
                </Container>
            </Box>
        </Flex>
    );
}
