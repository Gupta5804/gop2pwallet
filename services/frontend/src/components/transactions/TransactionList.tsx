// src/components/transactions/TransactionList.tsx

import { Transaction, User } from "@/services/api";
import { 
    Box,
    Heading,
    Text,
    Stack,
    Badge,
    Flex,
    Center,
    VStack,
    Card,
    Icon,
    HStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { LuArrowUpRight, LuArrowDownLeft } from "react-icons/lu";

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
            <Center p={8}>
                <VStack gap={2} align="center">
                    <Icon as={LuArrowUpRight} boxSize={8} color="gray.300" />
                    <Text
                        fontWeight={600}
                        color="gray.500"
                        _dark={{ color: "gray.400" }}
                    >
                        No transactions found
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        Your transaction history will appear here
                    </Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Stack gap={3} width="100%">
            {transactions.map((tx) => {
                const isSender = tx.sender_id === currentUser?.id;
                const amount = parseFloat(formatCurrency(tx.amount));

                const recipientName = tx.recipient_username ?? "System";
                const senderName = tx.sender_username ?? "System";
                
                const otherUserName = isSender ? recipientName : senderName;
                const otherUsername = isSender ? recipientName : senderName;

                const statusColorMap: Record<string, string> = {
                    completed: "green",
                    pending: "yellow",
                    failed: "red",
                };

                const statusColor = statusColorMap[tx.status] || "gray";

                return (
                    <Card.Root
                        key={tx.id}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        boxShadow="sm"
                        transition="all 0.2s ease"
                        _dark={{ 
                            bg: "gray.800",
                            borderColor: "gray.700"
                        }}
                        _hover={{
                            boxShadow: "md",
                            transform: "translateY(-1px)",
                        }}
                    >
                        <Card.Body p={4}>
                            <Flex justify="space-between" align="center" width="100%">
                                {/* Left: Icon + Details */}
                                <Flex gap={4} align="center" flex={1}>
                                    {/* Direction Icon */}
                                    <Box
                                        p={3}
                                        bg={isSender ? "red.50" : "green.50"}
                                        _dark={{
                                            bg: isSender
                                                ? "rgba(239, 68, 68, 0.1)"
                                                : "rgba(34, 197, 94, 0.1)",
                                        }}
                                        rounded="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        minW="44px"
                                        h="44px"
                                    >
                                        <Icon
                                            as={isSender ? LuArrowUpRight : LuArrowDownLeft}
                                            boxSize={6}
                                            color={isSender ? "red.600" : "green.600"}
                                            _dark={{
                                                color: isSender ? "red.400" : "green.400",
                                            }}
                                        />
                                    </Box>

                                    {/* Transaction Details */}
                                    <VStack align="start" gap={1} flex={1}>
                                        <HStack gap={2}>
                                            <Text fontWeight={600}>
                                                {isSender ? "Sent to" : "Received from"}
                                            </Text>
                                            <Link to={`/users/${otherUsername}`}>
                                                <Text
                                                    fontWeight={600}
                                                    color="teal.600"
                                                    _dark={{ color: "teal.400" }}
                                                    _hover={{ textDecoration: "underline" }}
                                                >
                                                    @{otherUserName}
                                                </Text>
                                            </Link>
                                        </HStack>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            _dark={{ color: "gray.400" }}
                                        >
                                            {format(
                                                new Date(tx.created_at),
                                                "MMM d, yyyy • h:mm a"
                                            )}
                                        </Text>
                                    </VStack>
                                </Flex>

                                {/* Right: Amount + Status */}
                                <VStack align="end" gap={2}>
                                    <Text
                                        fontWeight={700}
                                        fontSize="lg"
                                        color={isSender ? "red.600" : "green.600"}
                                        _dark={{
                                            color: isSender ? "red.400" : "green.400",
                                        }}
                                    >
                                        {isSender ? "-" : "+"}₹{amount.toFixed(2)}
                                    </Text>
                                    <Badge
                                        colorPalette={statusColor}
                                        variant="solid"
                                        fontSize="xs"
                                        fontWeight={600}
                                    >
                                        {tx.status.charAt(0).toUpperCase() +
                                            tx.status.slice(1)}
                                    </Badge>
                                </VStack>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                );
            })}
        </Stack>
    );
}
