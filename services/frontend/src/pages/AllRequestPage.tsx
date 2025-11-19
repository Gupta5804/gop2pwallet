import { useState, useEffect, useCallback } from 'react';
import { Container, Heading, Spinner, Text, Stack, Center } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';
import { api, Transaction } from '@/services/api';
import PendingRequestList from '@/components/transactions/PendingRequestList';
import { toaster } from '@/components/ui/toaster';

const PAGE_LIMIT = 10;

export default function AllRequestsPage() {
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
    const [requests, setRequests] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // We need to be able to refresh the list when an item is approved/rejected
    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = (await api.getPendingTransactions(PAGE_LIMIT, 0)).data;
            setRequests(data);
            setOffset(PAGE_LIMIT);
            setHasMore(data.length >= PAGE_LIMIT);
        } catch (error) {
            toaster.error({ title: "Failed to load requests" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const data = (await api.getPendingTransactions(PAGE_LIMIT, offset)).data;
            setRequests(prev => [...prev, ...data]);
            setOffset(prev => prev + PAGE_LIMIT);
            setHasMore(data.length >= PAGE_LIMIT);
        } catch (error) {
            toaster.error({ title: "Failed to load more requests" });
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
            <Heading mb={6}>Pending Requests</Heading>
            <Stack gap={4}>
                {requests.length === 0 ? (
                    <Text color="gray.500" _dark={{ color: "gray.400" }}>No pending requests.</Text>
                ) : (
                    // Pass loadInitialData so approving/rejecting refreshes the list
                    <PendingRequestList requests={requests} onAction={loadInitialData} title="Pending Requests" />
                )}

                {hasMore && (
                    <Center ref={ref} py={4}>
                        <Spinner size="sm" color="gray.500" _dark={{ color: "gray.400" }} />
                    </Center>
                )}
                {!hasMore && requests.length > 0 && (
                    <Center py={4} color="gray.500" _dark={{ color: "gray.400" }} fontSize="sm">
                        No more requests
                    </Center>
                )}
            </Stack>
        </Container>
    );
}