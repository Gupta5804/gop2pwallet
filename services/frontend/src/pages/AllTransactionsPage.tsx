import { useState, useEffect, useCallback } from 'react';
import { Container, Heading, Spinner, Text, Stack, Center, Box } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';
import { api, Transaction } from '@/services/api';
import TransactionList from '@/components/transactions/TransactionList';
import { toaster } from '@/components/ui/toaster';

const PAGE_LIMIT = 10; // Can load more at once for a dedicated page

export default function AllTransactionsPage() {
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
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
            toaster.error({ title: "Failed to load transactions" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const data = (await api.getTransactionHistory(PAGE_LIMIT, offset)).data;
            setTransactions(prev => [...prev, ...data]);
            setOffset(prev => prev + PAGE_LIMIT);
            setHasMore(data.length >= PAGE_LIMIT);
        } catch (error) {
            toaster.error({ title: "Failed to load more transactions" });
        } finally {
            setIsLoadingMore(false);
        }
    }, [offset, hasMore, isLoadingMore]);

    useEffect(() => {
        if (inView && hasMore) loadMore();
    }, [inView, hasMore, loadMore]);

    if (isLoading) return <Container centerContent py={20}><Spinner size="xl" /></Container>;

    return (
        <Container maxW="4xl" py={8}>
            <Heading mb={6}>All Transactions</Heading>
            <Stack gap={4}>
                {transactions.length === 0 ? (
                    <Text color="fg.muted">No transactions found.</Text>
                ) : (
                    <TransactionList transactions={transactions}  currentUser={null} title="All Transactions"/>
                )}
                
                {/* Sentinel for infinite scroll */}
                {hasMore && (
                    <Center ref={ref} py={4}>
                        <Spinner size="sm" color="fg.muted" />
                    </Center>
                )}
                {!hasMore && transactions.length > 0 && (
                    <Center py={4} color="fg.subtle" fontSize="sm">
                        No more transactions
                    </Center>
                )}
            </Stack>
        </Container>
    );
}