import { useState, useEffect, useCallback } from 'react';
import { Container, Heading, Spinner, Text, Stack, Center, Box, VStack, Icon } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';
import { api, Transaction } from '@/services/api';
import TransactionList from '@/components/transactions/TransactionList';
import { toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { LuTrendingUp } from 'react-icons/lu';

const PAGE_LIMIT = 10; // Can load more at once for a dedicated page

export default function AllTransactionsPage() {
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
    const { user } = useAuth(); // Get current user from auth context
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = (await api.getTransactionHistory(PAGE_LIMIT, 0)).data;
            setTransactions(data);
            setOffset(PAGE_LIMIT);
            setHasMore(data.length >= PAGE_LIMIT);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            toaster.error({ title: "Failed to load transactions" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { 
        loadInitialData(); 
    }, [loadInitialData]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const data = (await api.getTransactionHistory(PAGE_LIMIT, offset)).data;
            setTransactions(prev => [...prev, ...data]);
            setOffset(prev => prev + PAGE_LIMIT);
            setHasMore(data.length >= PAGE_LIMIT);
        } catch (error) {
            console.error('Failed to load more transactions:', error);
            toaster.error({ title: "Failed to load more transactions" });
        } finally {
            setIsLoadingMore(false);
        }
    }, [offset, hasMore, isLoadingMore]);

    useEffect(() => {
        if (inView && hasMore) loadMore();
    }, [inView, hasMore, loadMore]);

    if (isLoading) {
        return (
            <Container centerContent py={20}>
                <Spinner 
                    size="xl" 
                    color="teal.600"
                    thickness="4px"
                />
            </Container>
        );
    }

    return (
        <Container maxW="4xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
            <VStack align="stretch" gap={6}>
                {/* Header Section */}
                <VStack align="start" gap={2} width="100%">
                    <Heading 
                        size={{ base: "xl", md: "2xl" }}
                        fontWeight={700}
                        letterSpacing="-0.02em"
                    >
                        Transaction History
                    </Heading>
                    <Text
                        fontSize={{ base: "sm", md: "md" }}
                        color="gray.600"
                        _dark={{ color: "gray.400" }}
                        fontWeight={500}
                    >
                        {transactions.length === 0 
                            ? "No transactions yet. Send or request money to get started."
                            : `Showing all your transactions (${transactions.length} total)`
                        }
                    </Text>
                </VStack>

                {/* Transactions List */}
                <Box width="100%">
                    {transactions.length === 0 ? (
                        <Center p={12}>
                            <VStack gap={3} align="center">
                                <Icon 
                                    as={LuTrendingUp} 
                                    boxSize={12} 
                                    color="gray.300"
                                    _dark={{ color: "gray.600" }}
                                />
                                <Text 
                                    color="gray.500"
                                    _dark={{ color: "gray.400" }}
                                    fontWeight={600}
                                    fontSize="lg"
                                >
                                    No transactions found
                                </Text>
                                <Text 
                                    fontSize="sm" 
                                    color="gray.400"
                                    _dark={{ color: "gray.500" }}
                                    textAlign="center"
                                >
                                    Your transaction history will appear here
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <TransactionList 
                            transactions={transactions}  
                            currentUser={user} // Pass current user from auth context
                            title="All Transactions"
                        />
                    )}
                </Box>
                
                {/* Sentinel for infinite scroll */}
                {hasMore && (
                    <Center ref={ref} py={8}>
                        <Spinner 
                            size="md" 
                            color="teal.600"
                            thickness="3px"
                        />
                    </Center>
                )}
                {!hasMore && transactions.length > 0 && (
                    <Center py={6} color="fg.subtle" fontSize="sm">
                        <Text fontWeight={500} color="gray.500" _dark={{ color: "gray.400" }}>
                            ✓ No more transactions to load
                        </Text>
                    </Center>
                )}
            </VStack>
        </Container>
    );
}
