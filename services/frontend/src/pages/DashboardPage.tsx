import { useEffect, useState, useCallback } from "react";
import apiClient, { BalanceResponse, Transaction, api } from "@/services/api";
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
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import TransactionList from "@/components/transactions/TransactionList";
import { sendMoneyDialog } from "@/components/transactions/SendMoneyDialog";
import { requestMoneyDialog } from "@/components/transactions/RequestMoneyDialog";
export default function DashboardPage() {
    // --- State Variables ---//
    const [balance, setBalance] = useState<BalanceResponse | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [balanceError, setBalanceError] = useState<string | null>(null);


    // -- state for transactions---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState<string | null>(null);

    // Get User 
    const { user } = useAuth(); // to get the user from the context
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
    // Data fetching hook
    useEffect(() => {
        fetchBalance();
        fetchTransactions();
    }, [fetchBalance, fetchTransactions]);

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
                                onTransactionSuccess: handleTransactionSuccess,
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
                                onRequestSuccess: handleRequestSuccess,
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
                {renderTransactions()}
            </Box>
            <sendMoneyDialog.Viewport/>
            <requestMoneyDialog.Viewport/>
        </VStack>
    );
}