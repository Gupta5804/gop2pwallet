// src/components/transactions/TransactionList.tsx

import { Transaction, User } from "@/services/api";
import { 
    Box,
    Heading,
    Text,
    Stack,
    StackSeparator,
    Badge,
    Flex,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
// Helper function to format paise to rupees
const formatCurrency = (amountInPaise: number) => {
    return (amountInPaise / 100).toFixed(2);
};

// Define the props 
interface TransactionListProps {
    transactions: Transaction[];
    currentUser: User | null;
    title: string;
}

export default function TransactionList({
    transactions,
    currentUser,
    title,
}: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <Box>
                <Heading size="md" mb={4}>{title}</Heading>
                <Text>No transactions found.</Text>
            </Box>
        );
    }
    return (
        <Box>
            <Heading size="md" mb={4}>{title}</Heading>
            <Stack separator={<StackSeparator />} gap={4}>
                {transactions.map((tx) =>{
                    const isSender = tx.sender_id === currentUser?.id;
                    const amount = parseFloat(formatCurrency(tx.amount));

                    const recepientName = tx.recipient_username ?? "System";
                    const senderName = tx.sender_username ?? "System";
                    
                    const TransactionLink = ({ username, children}: any) => (
                        <Link to={`/users/${username}`}>
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="blue.500"
                                _hover={{ textDecoration: "underline" }}
                            >
                                {children}
                            </Text>
                        </Link>
                    );
                    const transactionElement = isSender ? (
                        <>
                        Sent to
                        <TransactionLink username={recepientName}>
                             {recepientName}
                        </TransactionLink>
                        </>
                    ) : (
                        <>
                        Received from
                        <TransactionLink username={senderName}>
                             {senderName}
                        </TransactionLink>
                        </>
                    );
                    return (
                        <Flex
                            key={tx.id}
                            justify="space-between"
                            align="center"
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            boxShadow="sm"
                        >
                            <Box>
                                {transactionElement}
                                <Text fontSize="sm" color="gray.500">
                                    {format(new Date(tx.created_at), "MMM d, yyyy h:mm a")}
                                </Text>
                            </Box>
                            <Box textAlign="right">
                                <Text
                                    fontWeight="bold"
                                    fontSize="xl"
                                    color={isSender ? "red.500" : "green.500"}
                                >
                                    { isSender ? "-" : "+"}₹{amount.toFixed(2)} 
                                </Text>
                                <Badge
                                    colorPalette={
                                        tx.status === "completed"
                                            ? "green"
                                            : tx.status === "pending"
                                            ? "yellow"
                                            : "red"
                                    }
                                >
                                    {tx.status}
                                </Badge>
                            </Box>
                        </Flex>
                    );
                })}
            </Stack>
        </Box>
    );
}
