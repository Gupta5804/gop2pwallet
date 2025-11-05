// src/components/transactions/PendingRequestList.tsx

import { Transaction, api } from "@/services/api";
import { 
    Box,
    Heading,
    Text,
    Stack,
    StackSeparator,
    Badge,
    Flex,
    Button,
    HStack,
    Spinner,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import { useState } from "react";

const formatCurrency = (amountInPaise: number) => {
    return (amountInPaise / 100).toFixed(2);
};

interface PendingRequestListProps {
    requests: Transaction[];
    title: string;
    onAction:() => void; // callback to refrest all dashboard data
}

export default function PendingRequestList({
    requests,
    title,
    onAction,
}: PendingRequestListProps) {
    const [loadingTxId, setLoadingTxId] = useState<string | null>(null);

    const handleApprove = async (txId: string) => {
        setLoadingTxId(txId);
        try {
            await api.approveTransaction(txId);
            toaster.success({ title: "Request Approved!" });
            onAction(); // refresh dashboard data
        } catch (err: any) {
            toaster.error({
                title: "Failed to approve request",
                description: err.response?.data?.error || "An error occurred",
            });
        } finally {
            setLoadingTxId(null);
        }
    };

    const handleReject = async (txId: string) => {
        setLoadingTxId(txId);
        try {
            await api.rejectTransaction(txId);
            toaster.info({ title: "Request Rejected!" });
            onAction(); // refresh dashboard data
        } catch (err: any) {
            toaster.error({
                title:"Failed to reject request",
                description: err.response?.data?.error || "An error occurred",
            });
        } finally {
            setLoadingTxId(null);
        }
    
    };
    if (requests.length === 0) {
        return (
            <Box>
                <Heading size="md" mb={4}>{title}</Heading>
                <Text>No pending requests.</Text>
            </Box>
        );
    }
    return (
        <Box>
            <Heading size="md" mb={4}>
                {title}
            </Heading>
            <Stack separator={<StackSeparator />} gap={4}>
                {requests.map((tx) => {
                    const amount = parseFloat(formatCurrency(tx.amount));
                    const senderName = tx.sender_username ?? "System";
                    const isLoading = loadingTxId === tx.id;
                    return (
                        <Flex
                            key={tx.id}
                            justify="space-between"
                            align="center"
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            boxShadow="sm"
                            opacity={isLoading ? 0.5 : 1}
                        >
                            <Box>
                                <HStack>
                                    <Text fontWeight="bold" fontSize="lg">
                                        Request from:
                                    </Text>
                                    <Link to={`/users/${senderName}`}>
                                        <Text
                                            fontWeight="bold"
                                            fontSize="lg"
                                            color="blue.500"
                                            _hover={{ textDecoration: "underline" }}
                                        >
                                            {senderName}
                                        </Text>
                                    </Link>
                                </HStack>
                            </Box>
                            <HStack gap={4}>
                                <Text fontWeight="bold" fontSize="xl" color="blue.500">
                                    ₹{amount}
                                </Text>
                                {isLoading ? (
                                    <Spinner />
                                ): (
                                    <HStack>
                                        <Button
                                            colorPalette="green"
                                            size="sm"
                                            onClick={() => handleApprove(tx.id)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            colorPalette="red"
                                            size="sm"
                                            onClick={() => handleReject(tx.id)}
                                        >
                                            Reject
                                        </Button>
                                    </HStack>
                                )}
                            </HStack>

                        </Flex>
                    );
                })}
            </Stack>
        </Box>
    );
}