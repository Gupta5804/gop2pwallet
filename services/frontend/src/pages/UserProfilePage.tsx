// src/pages/UserProfilePage.tsx
import { useState, useEffect } from 'react';
import {Box, Container, Heading, Spinner, Text} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
//import { useAsync } from 'react-use';
import apiClient from '@/services/api';

interface UserProfile{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
}

export default function UserProfilePage() {
    const {username} = useParams();
    
    // 1. Use standart React state for loading, user data and error
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Use useEffect to fetch user data when the username changes
    useEffect(()=>{
        if (!username){
            setLoading(false);
            setError("No username provided");
            return;
        }

        setLoading(true);
        setError(null);
        setUser(null);

        apiClient.get(`/users/${username}`)
        .then(response => {
            setUser(response.data as UserProfile); 
        })
        .catch(err => {
            console.error("Failed to fetch user data", err);
            setError("Could not load user data");
        })
        .finally(() => setLoading(false));
    }, [username]);


    if (loading) {
        return (
            <Container centerContent>
                <Spinner size="xl"/>
            </Container>
        )
    }
    if (error || !user) {
        return (
            <Heading> User Not find</Heading>
        );
    }
    return (
        <Box>
            <Heading>{user.firstName}'s Profile</Heading>
            <Text> First Name: {user.firstName} </Text>
            <Text> Last Name: {user.lastName} </Text>
        </Box>
    );
}