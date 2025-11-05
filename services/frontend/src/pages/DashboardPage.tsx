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
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import TransactionList from "@/components/transactions/TransactionList";
import { sendMoneyDialog } from "@/components/transactions/SendMoneyDialog";
import { requestMoneyDialog } from "@/components/transactions/RequestMoneyDialog";
import PendingRequestList from "@/components/transactions/PendingRequestList";
export default function DashboardPage() {
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
    const [pendingLoading, setPendingLoading] = useState(true);
    const [pendingError, setPendingError] = useState<string | null>(null);
    // Get User 
    const { user, subscribeToRefresh, unsubscribeFromRefresh } = useAuth(); // to get the user from the context
    const fetchBalance = useCallback(async () => {
        try {
            setBalanceLoading(true);
            setBalanceError(null);
            const response = await api.getBalance();
            setBalance(response.data);
        } catch (err) {
            const errorMessage = "Failed to fetch Balance. Please try again later.";
            setBalanceError(errorMessage);
            // toaster error
            toaster.error({
                title:"Error",
                description: errorMessage,
            });
        } finally {
            setBalanceLoading(false);
        }
    },[]);
    const fetchTransactions = useCallback(async () => {
        try {
            setTxLoading(true);
            setTxError(null);
            const response = await api.getTransactionHistory(5);
            setTransactions(response.data);
        } catch (err) {
            const errorMessage = "Failed to fetch recent transactions.";
            setTxError(errorMessage);
            toaster.error({
                title:"Error",
                description: errorMessage,
            });
        } finally {
            setTxLoading(false);
        }
    },[]);
    const fetchPendingRequests = useCallback(async () => {
        try {
            setPendingLoading(true);
            setPendingError(null);
            const response = await api.getPendingTransactions(5);
            setPendingRequests(response.data);
        } catch(err) {
            const errorMessage = "Failed to fetch pending requests.";
            setPendingError(errorMessage);
            toaster.error({ title: "Error", description: errorMessage });
        } finally {
            setPendingLoading(false);
        }
    },[]);
    const refreshAllData = useCallback(() => {
        fetchBalance();
        fetchTransactions();
        fetchPendingRequests();
    },[fetchBalance, fetchTransactions, fetchPendingRequests]);
    // Data fetching hook
    useEffect(() => {
        refreshAllData();
    }, [refreshAllData]);
    useEffect(() => {
        subscribeToRefresh(refreshAllData);
        return () => unsubscribeFromRefresh(refreshAllData);
    },[refreshAllData, subscribeToRefresh, unsubscribeFromRefresh]);
    const handleTransactionSuccess = useCallback(()=>{
        fetchBalance();
        fetchTransactions();
    },[fetchBalance, fetchTransactions]);

    const handleRequestSuccess = useCallback(() => {
        // for now, it doesnt need to do anything
        // but we will update it to refrest the pending list
    },[]);
    // helper function for rendering
    const renderBalance = () => {
        if (balanceLoading) {
            return <Spinner size="xl"/>;
        }
        if (balanceError) {
            return <Text color="red.500">{balanceError}</Text>;
        }
        if (balance) {
            // formatting paise to rupees
            const formattedBalance = (balance.balance / 100 || 0).toFixed(2);

            return (
                <Stat.Root
                    p={6}
                    borderWidth="1px"
                    borderRadius="lg"
                    boxShadow = "md"
                    maxW="sm"
                >
                    <Stat.Label fontSize="md" color="gray.500">Current Balance</Stat.Label>
                    <Stat.ValueText fontSize="4xl" fontWeight="bold">
                        ₹{formattedBalance} 
                    </Stat.ValueText>
                    <Stat.HelpText>{balance.currency.toUpperCase()}</Stat.HelpText>
                </Stat.Root>

            );
        }
        return null;
    };
    // helper to render transactions
    const renderTransactions = () => {
        if(txLoading) return <Spinner />;
        if (txError) return <Text color="red.500">{txError}</Text>
        // passing the fetched data to the TransactionList component
        return (
            <TransactionList
                transactions={transactions}
                currentUser={user}
                title="Recent Transactions"
            />
        );
    };
    const renderPendingRequests = () => {
        if (pendingLoading) return <Spinner />;
        if (pendingError) return <Text color="red.500">{pendingError}</Text>;
        return (
            <PendingRequestList
                requests={pendingRequests}
                title="Incoming Requests"
                onAction={refreshAllData}
            />
        );
    };
    return (
        <VStack p={4} align="stretch" gap={6}>

            <Box p={4}>
                <Heading mb={4}>
                    Welcome to your Dashboard{user ? `, ${user.username}` : ""}!
                </Heading>
            </Box>
            <HStack align="start" gap={6} flexWrap="wrap">
                <VStack gap={6} flex={1} minW="300px">
                    <Heading size="lg">Actions</Heading>
                    <Button
                        colorPalette="green"
                        size="lg"
                        onClick={()=>{
                            sendMoneyDialog.open("send-money", {
                                onTransactionSuccess: refreshAllData,
                            });
                        }}
                    >
                        Send Money
                    </Button>
                    <Button
                        colorPalette="blue"
                        size="lg"
                        onClick={() => {
                            requestMoneyDialog.open("request-money", {
                                onRequestSuccess: refreshAllData,
                            });
                        }}
                    >
                        Request Money
                    </Button>
                </VStack>
                <VStack gap={6} flex={1} minW="300px">
                    <Heading size="lg">Your Wallet</Heading>
                    {renderBalance()}
                </VStack>
            </HStack>

            <Separator />
            <Box>
                <Tabs.Root defaultValue="activity" fitted>
                    <Tabs.List>
                        <Tabs.Trigger value="activity">Recent Activity</Tabs.Trigger>
                        <Tabs.Trigger value="pending">
                            Pending Requests
                            {pendingRequests.length > 0 && (
                                <Badge colorPalette="red">
                                    {pendingRequests.length}
                                </Badge>
                            )}
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="activity">
                        {renderTransactions()}
                    </Tabs.Content>
                    <Tabs.Content value="pending">
                        {renderPendingRequests()}
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
            
            <sendMoneyDialog.Viewport/>
            <requestMoneyDialog.Viewport/>
        </VStack>
    );
}