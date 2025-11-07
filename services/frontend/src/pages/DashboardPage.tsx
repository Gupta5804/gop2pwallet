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
    Separator,
    HStack,
    Button,
    Badge,
    Tabs,
    Card,
    Flex,
    Center
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import TransactionList from "@/components/transactions/TransactionList";
import { sendMoneyDialog } from "@/components/transactions/SendMoneyDialog";
import { requestMoneyDialog } from "@/components/transactions/RequestMoneyDialog";
import PendingRequestList from "@/components/transactions/PendingRequestList";
import { Link as RouterLink } from "react-router-dom";

export default function DashboardPage() {
    const { user, subscribeToRefresh, unsubscribeFromRefresh } = useAuth();

    // --- State Variables ---//
    const [balance, setBalance] = useState<BalanceResponse | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [balanceError, setBalanceError] = useState<string | null>(null);


    // -- state for transactions---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState<string | null>(null);

    // state for pending requests
    const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestsError, setRequestsError] = useState<string | null>(null);


    const fetchDashboardData = useCallback(async () => {
        setBalanceLoading(true);
        setTxLoading(true);
        setRequestsLoading(true);
        // reset errors
        setBalanceError(null);
        setTxError(null);
        setRequestsError(null);

        try {
            // 1. Fetch Balance
             api.getBalance()
                .then(res => setBalance(res.data))
                .catch(err => {
                    console.error("Failed to fetch balance", err);
                    setBalanceError("Failed to load balance");
                })
                .finally(() => setBalanceLoading(false));

            // 2. Fetch Transactions (Recent 5)
            api.getTransactionHistory(5)
                .then(res => setTransactions(res.data))
                .catch(err => {
                     console.error("Failed to fetch transactions", err);
                     setTxError("Failed to load transactions");
                })
                .finally(() => setTxLoading(false));

            // 3. Fetch Pending requests
            api.getPendingTransactions()
                .then(res => setPendingRequests(res.data))
                .catch(err => {
                    console.error("Failed to fetch pending requests", err);
                    setRequestsError("Failed to load pending requests");
                })
                .finally(() => setRequestsLoading(false));

        } catch (error) {
             console.error("An unexpected error occurred", error);
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
            return <Spinner />;
        }
        if (balanceError || !balance) {
             return <Text color="red.500">Error loading balance</Text>;
        }

        return (
             <Stat.Root size="lg">
                <Stat.Label>Current Balance</Stat.Label>
                <Stat.ValueText>
                     {balance.currency} {(balance.balance / 100).toFixed(2)}
                </Stat.ValueText>
            </Stat.Root>
        );
    };

    const renderTransactions = () => {
        if (txLoading) return <Center p={4}><Spinner /></Center>;
        if (txError) return <Text color="red.500">{txError}</Text>;

        return (
            <Card.Root variant={"elevated"}>
                <Card.Header>
                    <Flex justify="space-between" align="center">
                        <Heading size="md">Recent Activity</Heading>
                        <Button asChild variant="ghost" size="sm">
                            <RouterLink to="/transactions">View All</RouterLink>
                        </Button>
                    </Flex>
                </Card.Header>
                <Card.Body>
                     {transactions.length === 0 ? (
                         <Text color="fg.muted">No recent transactions.</Text>
                     ) : (
                         // Show only the top 5 on the dashboard
                         <TransactionList transactions={transactions.slice(0, 5)} currentUser={user} title="Recent Activity" />
                     )}
                </Card.Body>
            </Card.Root>
        );
    };

    const renderPendingRequests = () => {
        if (requestsLoading) return <Center p={4}><Spinner /></Center>;
        if (requestsError) return <Text color="red.500">{requestsError}</Text>;

        return (
            <Card.Root variant={"elevated"}>
                <Card.Header>
                    <Flex justify="space-between" align="center">
                        <Heading size="md">Pending Requests</Heading>
                        <Button asChild variant="ghost" size="sm">
                            <RouterLink to="/requests">View All</RouterLink>
                        </Button>
                    </Flex>
                </Card.Header>
                <Card.Body>
                    {pendingRequests.length === 0 ? (
                        <Text color="fg.muted">No pending requests.</Text>
                    ) : (
                        // Show only top 5 and pass refresh handler
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
        <VStack gap={8} align="stretch" py={8}>
            <HStack justify="space-between" wrap="wrap" gap={4}>
                <VStack align="start" gap={2}>
                    <Heading size="2xl">Welcome back, {user?.firstName} {user?.lastName || 'User'}!</Heading>
                    <Heading size="xl">{user?.email}</Heading>
                    <Text color="fg.muted">Here's an overview of your wallet.</Text>
                    
                     {/* Action Buttons */}
                    <HStack pt={4}>
                        <Button
                            size="lg"
                            colorPalette="green"
                            onClick={() => {
                                sendMoneyDialog.open("send-money", {
                                    onTransactionSuccess: fetchDashboardData,
                                });
                            }}
                        >
                            Send Money
                        </Button>
                        <Button
                            size="lg"
                            colorPalette="blue"
                            variant="outline"
                             onClick={() => {
                                requestMoneyDialog.open("request-money", {
                                    onRequestSuccess: fetchDashboardData,
                                });
                            }}
                        >
                            Request Money
                        </Button>
                    </HStack>
                </VStack>
                
                {/* Balance Card */}
                <Card.Root minW="300px" variant="subtle">
                    <Card.Body>
                        {renderBalance()}
                    </Card.Body>
                </Card.Root>
            </HStack>

            <Separator />
            
            {/* Tabs for Activity and Requests */}
            <Box>
                <Tabs.Root defaultValue="activity" variant="enclosed">
                    <Tabs.List>
                        <Tabs.Trigger value="activity">
                            Recent Activity
                        </Tabs.Trigger>
                        <Tabs.Trigger value="pending">
                            Pending Requests
                            {pendingRequests.length > 0 && (
                                <Badge colorPalette="red" ms={2} variant="solid">
                                    {pendingRequests.length}
                                </Badge>
                            )}
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="activity" pt={4}>
                        {renderTransactions()}
                    </Tabs.Content>
                    <Tabs.Content value="pending" pt={4}>
                        {renderPendingRequests()}
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
            
            {/* Dialog Viewports */}
            <sendMoneyDialog.Viewport/>
            <requestMoneyDialog.Viewport/>
        </VStack>
    );
}