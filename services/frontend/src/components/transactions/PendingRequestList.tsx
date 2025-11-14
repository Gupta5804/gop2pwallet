// src/components/transactions/PendingRequestList.tsx

import { Transaction, api } from "@/services/api";
import { 
    Box,
    Text,
    Stack,
    Badge,
    Flex,
    Button,
    HStack,
    Spinner,
    Card,
    Center,
    VStack,
    Icon,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { LuCheck, LuX, LuArrowDownLeft } from "react-icons/lu";

const formatCurrency = (amountInPaise: number) => {
    return (amountInPaise / 100).toFixed(2);
};

interface PendingRequestListProps {
    requests: Transaction[];
    title: string;
    onAction: () => void; // callback to refresh all dashboard data
}

export default function PendingRequestList({
    requests,
    title,
    onAction,
}: PendingRequestListProps) {
    const [loadingTxId, setLoadingTxId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

    const handleApprove = async (txId: string) => {
        setLoadingTxId(txId);
        setActionType("approve");
        try {
            await api.approveTransaction(txId);
            toaster.success({
                title: "Request approved! 🎉",
                description: "Money transferred successfully",
            });
            onAction(); // refresh dashboard data
        } catch (err: any) {
            toaster.error({
                title: "Failed to approve request",
                description: err.response?.data?.error || "An error occurred",
            });
        } finally {
            setLoadingTxId(null);
            setActionType(null);
        }
    };

    const handleReject = async (txId: string) => {
        setLoadingTxId(txId);
        setActionType("reject");
        try {
            await api.rejectTransaction(txId);
            toaster.info({
                title: "Request rejected",
                description: "The money request has been declined",
            });
            onAction(); // refresh dashboard data
        } catch (err: any) {
            toaster.error({
                title: "Failed to reject request",
                description: err.response?.data?.error || "An error occurred",
            });
        } finally {
            setLoadingTxId(null);
            setActionType(null);
        }
    };

    if (requests.length === 0) {
        return (
            <Center p={8}>
                <VStack gap={2} align="center">
                    <Icon as={LuArrowDownLeft} boxSize={8} color="gray.300" />
                    <Text
                        fontWeight={600}
                        color="gray.500"
                        _dark={{ color: "gray.400" }}
                    >
                        No pending requests
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        You're all caught up! 🎉
                    </Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Stack gap={3} width="100%">
            {requests.map((tx) => {
                const amount = parseFloat(formatCurrency(tx.amount));
                const senderName = tx.sender_username ?? "System";
                const isLoading = loadingTxId === tx.id;

                return (
                    <Card.Root
                        key={tx.id}
                        bg="white"
                        border="1px solid"
                        borderColor="blue.200"
                        boxShadow="sm"
                        transition="all 0.2s ease"
                        _dark={{ 
                            bg: "gray.800",
                            borderColor: "blue.900"
                        }}
                        _hover={{
                            boxShadow: "md",
                            transform: "translateY(-1px)",
                        }}
                        opacity={isLoading ? 0.7 : 1}
                    >
                        <Card.Body p={4}>
                            <Flex justify="space-between" align="center" width="100%">
                                {/* Left: Icon + Details */}
                                <Flex gap={4} align="center" flex={1}>
                                    {/* Request Icon */}
                                    <Box
                                        p={3}
                                        bg="blue.50"
                                        _dark={{ bg: "rgba(59, 130, 246, 0.1)" }}
                                        rounded="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        minW="44px"
                                        h="44px"
                                    >
                                        <Icon
                                            as={LuArrowDownLeft}
                                            boxSize={6}
                                            color="blue.600"
                                            _dark={{ color: "blue.400" }}
                                        />
                                    </Box>

                                    {/* Request Details */}
                                    <VStack align="start" gap={1} flex={1}>
                                        <HStack gap={2}>
                                            <Text fontWeight={600}>Request from</Text>
                                            <Link to={`/users/${senderName}`}>
                                                <Text
                                                    fontWeight={600}
                                                    color="blue.600"
                                                    _dark={{ color: "blue.400" }}
                                                    _hover={{ textDecoration: "underline" }}
                                                >
                                                    @{senderName}
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

                                {/* Right: Amount + Actions */}
                                <VStack align="end" gap={2}>
                                    <Text fontWeight={700} fontSize="lg" color="blue.600" _dark={{ color: "blue.400" }}>
                                        ₹{amount.toFixed(2)}
                                    </Text>

                                    {isLoading ? (
                                        <HStack gap={2}>
                                            <Spinner size="sm" />
                                            <Text fontSize="xs" color="gray.500">
                                                {actionType === "approve"
                                                    ? "Approving..."
                                                    : "Rejecting..."}
                                            </Text>
                                        </HStack>
                                    ) : (
                                        <HStack gap={2}>
                                            <Button
                                                size="sm"
                                                bg="green.600"
                                                color="white"
                                                _hover={{
                                                    bg: "green.700",
                                                    transform: "scale(1.02)",
                                                }}
                                                _dark={{
                                                    bg: "green.700",
                                                    _hover: { bg: "green.800" },
                                                }}
                                                fontWeight={600}
                                                onClick={() => handleApprove(tx.id)}
                                                transition="all 0.2s ease"
                                            >
                                                <Icon as={LuCheck} boxSize={4} />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                borderColor="red.600"
                                                color="red.600"
                                                _dark={{
                                                    borderColor: "red.400",
                                                    color: "red.400",
                                                }}
                                                _hover={{
                                                    bg: "red.50",
                                                    _dark: { bg: "rgba(239, 68, 68, 0.1)" },
                                                    transform: "scale(1.02)",
                                                }}
                                                fontWeight={600}
                                                onClick={() => handleReject(tx.id)}
                                                transition="all 0.2s ease"
                                            >
                                                <Icon as={LuX} boxSize={4} />
                                                Reject
                                            </Button>
                                        </HStack>
                                    )}
                                </VStack>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                );
            })}
        </Stack>
    );
}
