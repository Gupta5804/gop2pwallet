// src/pages/UserProfilePage.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    Box, 
    Container, 
    Heading, 
    Spinner, 
    Text,
    Flex,
    Card,
    Stack,
    Avatar,
    HStack,
    Button,
    Separator,
    Center,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
//import { useAsync } from 'react-use';
import apiClient from '@/services/api';
import { LuSend, LuDownload } from 'react-icons/lu';
import { api, User, Transaction } from '@/services/api';
import { useInView } from 'react-intersection-observer';
import TransactionList from '@/components/transactions/TransactionList';
import { sendMoneyDialog } from '@/components/transactions/SendMoneyDialog';
import { requestMoneyDialog } from '@/components/transactions/RequestMoneyDialog';
import { toaster } from '@/components/ui/toaster';
import { set } from 'date-fns';

const PAGE_LIMIT = 5;
// interface UserProfile{
//     id: string;
//     username: string;
//     firstName: string;
//     lastName: string;
// }

export default function UserProfilePage() {
    const {username} = useParams<{username: string}>();
    
    const {ref, inView} = useInView({
        threshold: 0,
        rootMargin: "200px",
    });
    // 1. Use standart React state for loading, user data and error
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingTxns, setIsLoadingTxns] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loadProfileAndFirstPage = useCallback(async () => {
       if (!username) return;
       setIsLoadingProfile(true);
       try {
        const userProfile = (await api.getUserProfile(username)).data;
        setUser(userProfile);
        setOffset(0);
        setHasMore(true);
        setTransactions([]);

        setIsLoadingTxns(true);
        const history = (await api.getTransactionHistory(PAGE_LIMIT, 0, userProfile.id)).data;
        setTransactions(history);
        if (history.length < PAGE_LIMIT) {
            setHasMore(false);
        } else {
            setOffset(PAGE_LIMIT);
        }
       } catch ( err: any) {
           toaster.error({
               title: "Error",
               description: err.response?.data?.error || "User not found",
           })
       } finally {
           setIsLoadingProfile(false);
           setIsLoadingTxns(false);
       }
    }, [username]);
    useEffect(() => {
        loadProfileAndFirstPage();
    }, [loadProfileAndFirstPage]);
    const loadMoreTransactions = useCallback(async () => {
       if (!user || isLoadingTxns || !hasMore) return;

       setIsLoadingTxns(true);
       try {
        const nextTxns = (await api.getTransactionHistory(PAGE_LIMIT, offset, user.id)).data;
        if (nextTxns.length < PAGE_LIMIT) {
            setHasMore(false);
        }
        setTransactions(prev => [...prev, ...nextTxns]);
        setOffset(prev => prev + PAGE_LIMIT);
       } catch (err) {
        toaster.error({ title: "Failed to load more transactions"});
       } finally {
        setIsLoadingTxns(false);
       }
    }, [user, isLoadingTxns, hasMore, offset]);
    useEffect(() => {
        if (inView && hasMore && !isLoadingTxns) {
            loadMoreTransactions();
        }
    }, [inView, hasMore, isLoadingTxns, loadMoreTransactions]);
    
    
    const handleOpenSend = () => {
        if (!user) return;
        sendMoneyDialog.open("send-money-profile", {
            onTransactionSuccess: loadProfileAndFirstPage,
            prefilledUser: user
        });
    }
    const handleOpenRequest = () => {
        if (!user) return;
        requestMoneyDialog.open("request-money-profile",{
            onRequestSuccess: loadProfileAndFirstPage,
            prefilledUser: user
        });
    }
    if (isLoadingProfile) {
        return (
            <Container centerContent py={20}>
                <Spinner size="xl"/>
            </Container>
        );
    }
    if(!user) {
        return (
            <Container centerContent py={20}>
                <Text color="red.500">User not found</Text>
            </Container>
        );
    }
    
    return (
        <Container maxW="4xl" py={8}>
            <Stack gap={8}>
                <Card.Root variant={"elevated"}>
                    <Card.Body>
                        <Flex direction={{base: 'column', sm:'row'}} align="center" gap={6}>
                            <Avatar.Root size="xl">
                                <Avatar.Fallback name={user.username}/>
                            </Avatar.Root>
                            <Box flex="1" textAlign={{base: 'center', sm: 'left'}}>
                                <Heading size="xl">{user.firstName} {user.lastName}</Heading>
                                <Heading size="md">({user.username})</Heading>
                                <Text color="fg.muted">{user.email}</Text>
                                <Text color="fg.subtle" fontSize="sm">
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </Text>
                            </Box>
                            <HStack>
                                <Button colorPalette="blue" variant="solid" onClick={handleOpenRequest}>
                                    <LuDownload/> Request
                                </Button>
                                <Button colorPalette="green" variant="solid" onClick={handleOpenSend}>
                                    <LuSend/> Send
                                </Button>
                            </HStack>
                        </Flex>
                    </Card.Body>
                </Card.Root>
                <Separator/>
                <Box>
                    <Heading size="lg" mb={4}>Transaction History with {user.username}</Heading>
                    {transactions.length === 0 && !isLoadingTxns ? (
                        <Text color="fg.muted">No Transactions yet with this user.</Text>
                    ):(
                        <Stack gap={4}>
                            <TransactionList transactions={transactions} currentUser={user} title="Transactions with this user"/>
                            {hasMore && (
                                <Center ref={ref} py={4}>
                                    <Spinner size="sm" color="fg.muted"/>
                                </Center>
                            )}
                            {!hasMore && transactions.length > 0 && (
                                <Center py={4}>
                                    <Text color="fg.subtle" fontSize="sm">No more transactions</Text>
                                </Center>
                            )}
                        </Stack>
                    )}
                </Box>
            </Stack>
            <sendMoneyDialog.Viewport/>
            <requestMoneyDialog.Viewport/>
        </Container>
    );
}