import { useEffect, useState, useCallback } from "react";
import { BalanceResponse, Transaction, api } from "@/services/api";
import { toaster } from "@/components/ui/toaster";
import { 
    Heading,
    Box,
    Text,
    Spinner,
    Stat,
    VStack,
    HStack,
    Button,
    Badge,
    Tabs,
    Card,
    Flex,
    Center,
    Icon,
    Grid,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import TransactionList from "@/components/transactions/TransactionList";
import { sendMoneyDialog } from "@/components/transactions/SendMoneyDialog";
import { requestMoneyDialog } from "@/components/transactions/RequestMoneyDialog";
import PendingRequestList from "@/components/transactions/PendingRequestList";
import { Link as RouterLink } from "react-router-dom";
import { GradientCard } from "@/components/ui/shared/GradientCard";
import { SkeletonCard } from "@/components/ui/shared/SkeletonCard";
import { LuSend, LuArrowDownLeft, LuTrendingUp, LuArrowRight } from "react-icons/lu";

export default function DashboardPage() {
    const { user, subscribeToRefresh, unsubscribeFromRefresh } = useAuth();

    // --- State Variables ---//
    const [balance, setBalance] = useState<BalanceResponse | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    // -- state for transactions---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState<string | null>(null);

    // state for pending requests
    const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestsError, setRequestsError] = useState<string | null>(null);

    /**
     * Calculate real statistics from actual transaction data
     * This replaces hardcoded percentages with real calculations
     */
    const calculateStats = useCallback(() => {
        if (!user || transactions.length === 0) {
            return { sent: 0, received: 0, sentTx: 0, receivedTx: 0 };
        }

        const sentTotal = transactions
            .filter(tx => tx.sender_id === user.id && tx.status === 'completed')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const receivedTotal = transactions
            .filter(tx => tx.recipient_id === user.id && tx.status === 'completed')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const sentTx = transactions.filter(tx => tx.sender_id === user.id).length;
        const receivedTx = transactions.filter(tx => tx.recipient_id === user.id).length;

        return {
            sent: sentTotal / 100, // Convert from paise to rupees
            received: receivedTotal / 100,
            sentTx,
            receivedTx,
        };
    }, [user, transactions]);

    /**
     * Fetch all dashboard data in parallel
     * Uses Promise.all to prevent race conditions
     * Each error is handled independently while others continue
     */
    const fetchDashboardData = useCallback(async () => {
        setBalanceLoading(true);
        setTxLoading(true);
        setRequestsLoading(true);
        setBalanceError(null);
        setTxError(null);
        setRequestsError(null);

        try {
            // Fetch all data in parallel using Promise.all for better performance
            const results = await Promise.allSettled([
                api.getBalance(),
                api.getTransactionHistory(5),
                api.getPendingTransactions(),
            ]);

            // Handle each result independently
            if (results[0].status === 'fulfilled') {
                setBalance(results[0].value.data);
            } else {
                const error = results[0].reason;
                console.error("Failed to fetch balance:", error);
                setBalanceError(error?.response?.data?.error || "Failed to load balance");
            }

            if (results[1].status === 'fulfilled') {
                setTransactions(results[1].value.data);
            } else {
                const error = results[1].reason;
                console.error("Failed to fetch transactions:", error);
                setTxError(error?.response?.data?.error || "Failed to load transactions");
            }

            if (results[2].status === 'fulfilled') {
                setPendingRequests(results[2].value.data);
            } else {
                const error = results[2].reason;
                console.error("Failed to fetch pending requests:", error);
                setRequestsError(error?.response?.data?.error || "Failed to load pending requests");
            }

        } catch (error) {
            console.error("An unexpected error occurred in fetchDashboardData:", error);
        } finally {
            setBalanceLoading(false);
            setTxLoading(false);
            setRequestsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Subscribe to realtime updates
    useEffect(() => {
        subscribeToRefresh(fetchDashboardData);
        return () => {
            unsubscribeFromRefresh(fetchDashboardData);
        };
    }, [subscribeToRefresh, unsubscribeFromRefresh, fetchDashboardData]);

    // --- Render Helpers --- //

    const renderBalance = () => {
        if (balanceLoading) {
            return <SkeletonCard />;
        }
        if (balanceError || !balance) {
            return (
                <Center p={8}>
                    <Text color="red.500" fontWeight={600}>
                        ⚠️ {balanceError || "Error loading balance"}
                    </Text>
                </Center>
            );
        }

        return (
            <GradientCard
                gradient="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                minH="200px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                position="relative"
                zIndex={1}
            >
                <Text
                    fontSize="sm"
                    fontWeight={600}
                    opacity={0.9}
                    mb={2}
                    letterSpacing="0.5px"
                >
                    Current Balance
                </Text>
                <Heading
                    size="3xl"
                    fontWeight={700}
                    letterSpacing="-0.02em"
                >
                    {balance.currency} {(balance.balance / 100).toFixed(2)}
                </Heading>
                <Text
                    fontSize="xs"
                    opacity={0.8}
                    mt={4}
                >
                    Available to spend
                </Text>
            </GradientCard>
        );
    };

    const renderQuickStats = () => {
        const stats = calculateStats();

        if (txLoading || requestsLoading) {
            return (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <SkeletonCard />
                    <SkeletonCard />
                </Grid>
            );
        }

        return (
            <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
                width="100%"
            >
                {/* Sent Stats */}
                <Card.Root
                    bg="white"
                    _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.200"
                    transition="all 0.3s ease"
                    _hover={{
                        boxShadow: "md",
                        transform: "translateY(-2px)",
                    }}
                >
                    <Card.Body p={6}>
                        <Flex justify="space-between" align="start">
                            <VStack align="start" gap={1}>
                                <Text
                                    fontSize="sm"
                                    fontWeight={600}
                                    color="gray.600"
                                    _dark={{ color: "gray.400" }}
                                >
                                    Total Sent
                                </Text>
                                <Text fontSize="2xl" fontWeight={700}>
                                    {balance?.currency} {stats.sent.toFixed(2)}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="green.600"
                                    _dark={{ color: "green.400" }}
                                    fontWeight={500}
                                >
                                    {stats.sentTx} transaction{stats.sentTx !== 1 ? 's' : ''}
                                </Text>
                            </VStack>
                            <Box
                                p={3}
                                bg="green.50"
                                _dark={{ bg: "rgba(34, 197, 94, 0.1)" }}
                                rounded="lg"
                            >
                                <Icon
                                    as={LuSend}
                                    boxSize={6}
                                    color="green.600"
                                    _dark={{ color: "green.400" }}
                                />
                            </Box>
                        </Flex>
                    </Card.Body>
                </Card.Root>

                {/* Received Stats */}
                <Card.Root
                    bg="white"
                    _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.200"
                    transition="all 0.3s ease"
                    _hover={{
                        boxShadow: "md",
                        transform: "translateY(-2px)",
                    }}
                >
                    <Card.Body p={6}>
                        <Flex justify="space-between" align="start">
                            <VStack align="start" gap={1}>
                                <Text
                                    fontSize="sm"
                                    fontWeight={600}
                                    color="gray.600"
                                    _dark={{ color: "gray.400" }}
                                >
                                    Total Received
                                </Text>
                                <Text fontSize="2xl" fontWeight={700}>
                                    {balance?.currency} {stats.received.toFixed(2)}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="blue.600"
                                    _dark={{ color: "blue.400" }}
                                    fontWeight={500}
                                >
                                    {stats.receivedTx} transaction{stats.receivedTx !== 1 ? 's' : ''}
                                </Text>
                            </VStack>
                            <Box
                                p={3}
                                bg="blue.50"
                                _dark={{ bg: "rgba(59, 130, 246, 0.1)" }}
                                rounded="lg"
                            >
                                <Icon
                                    as={LuArrowDownLeft}
                                    boxSize={6}
                                    color="blue.600"
                                    _dark={{ color: "blue.400" }}
                                />
                            </Box>
                        </Flex>
                    </Card.Body>
                </Card.Root>
            </Grid>
        );
    };

    const renderTransactions = () => {
        if (txLoading) {
            return (
                <Card.Root>
                    <Card.Body p={8}>
                        <Center>
                            <Spinner />
                        </Center>
                    </Card.Body>
                </Card.Root>
            );
        }
        if (txError) {
            return (
                <Card.Root bg="red.50" _dark={{ bg: "rgba(239, 68, 68, 0.1)" }}>
                    <Card.Body p={6}>
                        <Text color="red.600" _dark={{ color: "red.400" }} fontWeight={600}>
                            ⚠️ {txError}
                        </Text>
                    </Card.Body>
                </Card.Root>
            );
        }

        return (
            <Card.Root
                bg="white"
                _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
            >
                <Card.Header
                    borderBottomWidth="1px"
                    borderBottomColor="gray.200"
                    _dark={{ borderBottomColor: "gray.700" }}
                    p={6}
                >
                    <Flex justify="space-between" align="center">
                        <Heading size="md" fontWeight={700}>
                            Recent Activity
                        </Heading>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            color="teal.600"
                            px={4}
                            py={2}
                            h="auto"
                            _dark={{ color: "teal.400" }}
                            _hover={{
                                bg: "teal.50",
                                _dark: { bg: "rgba(20, 184, 166, 0.1)" },
                            }}
                        >
                            <RouterLink to="/transactions">
                                <Icon as={LuArrowRight} me={2} boxSize={4} />
                                View All
                            </RouterLink>
                        </Button>
                    </Flex>
                </Card.Header>
                <Card.Body p={6}>
                    {transactions.length === 0 ? (
                        <Center p={8}>
                            <VStack gap={2} align="center">
                                <Icon as={LuTrendingUp} boxSize={8} color="gray.300" />
                                <Text
                                    color="gray.500"
                                    _dark={{ color: "gray.400" }}
                                    fontWeight={500}
                                >
                                    No recent transactions
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                    Send or request money to get started
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <TransactionList
                            transactions={transactions.slice(0, 5)}
                            currentUser={user}
                            title="Recent Activity"
                        />
                    )}
                </Card.Body>
            </Card.Root>
        );
    };

    const renderPendingRequests = () => {
        if (requestsLoading) {
            return (
                <Card.Root>
                    <Card.Body p={8}>
                        <Center>
                            <Spinner />
                        </Center>
                    </Card.Body>
                </Card.Root>
            );
        }
        if (requestsError) {
            return (
                <Card.Root bg="red.50" _dark={{ bg: "rgba(239, 68, 68, 0.1)" }}>
                    <Card.Body p={6}>
                        <Text color="red.600" _dark={{ color: "red.400" }} fontWeight={600}>
                            ⚠️ {requestsError}
                        </Text>
                    </Card.Body>
                </Card.Root>
            );
        }

        return (
            <Card.Root
                bg="white"
                _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
            >
                <Card.Header
                    borderBottomWidth="1px"
                    borderBottomColor="gray.200"
                    _dark={{ borderBottomColor: "gray.700" }}
                    p={6}
                >
                    <Flex justify="space-between" align="center">
                        <Heading size="md" fontWeight={700}>
                            Pending Requests
                        </Heading>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            color="teal.600"
                            px={4}
                            py={2}
                            h="auto"
                            _dark={{ color: "teal.400" }}
                            _hover={{
                                bg: "teal.50",
                                _dark: { bg: "rgba(20, 184, 166, 0.1)" },
                            }}
                        >
                            <RouterLink to="/requests">
                                <Icon as={LuArrowRight} me={2} boxSize={4} />
                                View All
                            </RouterLink>
                        </Button>
                    </Flex>
                </Card.Header>
                <Card.Body p={6}>
                    {pendingRequests.length === 0 ? (
                        <Center p={8}>
                            <VStack gap={2} align="center">
                                <Icon as={LuArrowDownLeft} boxSize={8} color="gray.300" />
                                <Text
                                    color="gray.500"
                                    _dark={{ color: "gray.400" }}
                                    fontWeight={500}
                                >
                                    No pending requests
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                    You're all caught up!
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <PendingRequestList
                            requests={pendingRequests.slice(0, 5)}
                            onAction={fetchDashboardData}
                            title="Pending Requests"
                        />
                    )}
                </Card.Body>
            </Card.Root>
        );
    };

    return (
        <Box
            minH="100vh"
            bg={{ base: "white", _dark: "gray.900" }}
            py={{ base: 6, md: 8 }}
            px={{ base: 4, md: 8 }}
        >
            <VStack gap={{ base: 8, md: 10 }} align="stretch" maxW="container.2xl" mx="auto">
                {/* Header Section */}
                <VStack align="start" gap={6} width="100%">
                    <VStack align="start" gap={2} width="100%">
                        <Heading
                            size={{ base: "xl", md: "2xl" }}
                            fontWeight={700}
                            letterSpacing="-0.02em"
                        >
                            Welcome back, {user?.firstName}! 👋
                        </Heading>
                        <Text
                            fontSize={{ base: "sm", md: "md" }}
                            color="gray.600"
                            _dark={{ color: "gray.400" }}
                            fontWeight={500}
                        >
                            {user?.email}
                        </Text>
                        <Text
                            fontSize={{ base: "sm", md: "md" }}
                            color="gray.500"
                            _dark={{ color: "gray.500" }}
                        >
                            Here's an overview of your wallet and recent activity.
                        </Text>
                    </VStack>

                    {/* Action Buttons - Send Money & Request Money */}
                    <HStack
                        gap={{ base: 3, md: 4 }}
                        wrap="wrap"
                        pt={{ base: 2, md: 4 }}
                    >
                        <Button
                            size={{ base: "md", md: "lg" }}
                            bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                            color="white"
                            fontWeight={600}
                            px={{ base: 6, md: 8 }}
                            py={{ base: 3, md: 4 }}
                            h="auto"
                            onClick={() => {
                                sendMoneyDialog.open("send-money", {
                                    onTransactionSuccess: fetchDashboardData,
                                });
                            }}
                            transition="all 0.3s ease"
                            _hover={{
                                opacity: 0.9,
                                transform: "translateY(-2px)",
                                boxShadow: "lg",
                            }}
                        >
                            <Icon as={LuSend} me={2} />
                            Send Money
                        </Button>
                        <Button
                            size={{ base: "md", md: "lg" }}
                            variant="outline"
                            borderColor="teal.600"
                            color="teal.600"
                            px={{ base: 6, md: 8 }}
                            py={{ base: 3, md: 4 }}
                            h="auto"
                            _dark={{ borderColor: "teal.400", color: "teal.400" }}
                            fontWeight={600}
                            onClick={() => {
                                requestMoneyDialog.open("request-money", {
                                    onRequestSuccess: fetchDashboardData,
                                });
                            }}
                            transition="all 0.3s ease"
                            _hover={{
                                bg: "teal.50",
                                _dark: { bg: "rgba(20, 184, 166, 0.1)" },
                            }}
                        >
                            <Icon as={LuArrowDownLeft} me={2} />
                            Request Money
                        </Button>
                    </HStack>
                </VStack>

                {/* Balance Card - Full Width */}
                <Box width="100%">
                    {renderBalance()}
                </Box>

                {/* Quick Stats */}
                <Box width="100%">
                    {renderQuickStats()}
                </Box>

                {/* Tabs for Activity and Requests */}
                <Box width="100%">
                    <Tabs.Root defaultValue="activity" variant="enclosed">
                        <Tabs.List
                            borderBottomWidth="2px"
                            borderBottomColor="gray.200"
                            _dark={{ borderBottomColor: "gray.700" }}
                            gap={0}
                            bg="transparent"
                        >
                            <Tabs.Trigger
                                value="activity"
                                fontWeight={600}
                                fontSize={{ base: "sm", md: "md" }}
                                pb={4}
                                px={4}
                                py={2}
                                borderBottomWidth="2px"
                                borderBottomColor="transparent"
                                _selected={{
                                    borderBottomColor: "teal.600",
                                    color: "teal.600",
                                    _dark: {
                                        borderBottomColor: "teal.400",
                                        color: "teal.400",
                                    },
                                }}
                                transition="all 0.2s ease"
                            >
                                Recent Activity
                                {transactions.length > 0 && (
                                    <Badge
                                        colorPalette="teal"
                                        ms={2}
                                        fontSize="xs"
                                        fontWeight={600}
                                    >
                                        {transactions.length}
                                    </Badge>
                                )}
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="pending"
                                fontWeight={600}
                                fontSize={{ base: "sm", md: "md" }}
                                pb={4}
                                px={4}
                                py={2}
                                borderBottomWidth="2px"
                                borderBottomColor="transparent"
                                _selected={{
                                    borderBottomColor: "red.600",
                                    color: "red.600",
                                    _dark: {
                                        borderBottomColor: "red.400",
                                        color: "red.400",
                                    },
                                }}
                                transition="all 0.2s ease"
                            >
                                Pending Requests
                                {pendingRequests.length > 0 && (
                                    <Badge
                                        colorPalette="red"
                                        ms={2}
                                        fontSize="xs"
                                        fontWeight={600}
                                    >
                                        {pendingRequests.length}
                                    </Badge>
                                )}
                            </Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="activity" pt={{ base: 6, md: 8 }}>
                            {renderTransactions()}
                        </Tabs.Content>
                        <Tabs.Content value="pending" pt={{ base: 6, md: 8 }}>
                            {renderPendingRequests()}
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            </VStack>

            {/* Dialog Viewports */}
            <sendMoneyDialog.Viewport />
            <requestMoneyDialog.Viewport />
        </Box>
    );
}
