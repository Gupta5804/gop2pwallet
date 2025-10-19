// src/components/layout/AppLayout.tsx

import { Box,Container, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavBar from './Navbar';

export default function AppLayout() {
    return (
        <Flex 
            direction="column"
            minH="100vh">
            <NavBar/>

            <Box as="main" flex="1" bg="gray.200" py={8}>
            <Container maxW="container.xl">
                <Outlet />
            </Container>
            
            </Box>
        </Flex>
    );
}