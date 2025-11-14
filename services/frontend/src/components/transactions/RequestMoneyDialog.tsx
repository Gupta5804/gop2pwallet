// src/components/transactions/RequestMoneyDialog.tsx

import { useEffect, useState } from "react";
import { api, User } from "@/services/api";
import UserSearch from "@/components/ui/UserSearch";
import { toaster } from "../ui/toaster";
import {
    Box,
    Button,
    Field,
    NumberInput,
    VStack,
    createOverlay,
    Dialog,
    Portal,
    InputGroup,
    Text,
    HStack,
    Icon,
    IconButton,
} from "@chakra-ui/react";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { LuArrowDownLeft, LuX } from "react-icons/lu";

interface RequestMoneyDialogProps {
    onRequestSuccess: () => void;
    prefilledUser?: User;
}

export const requestMoneyDialog = createOverlay<RequestMoneyDialogProps>((props) => {
    const { onRequestSuccess, onOpenChange, open, prefilledUser, ...rest } = props;

    // states
    const [selectedUser, setSelectedUser] = useState<User | null>(prefilledUser || null);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (prefilledUser) {
            setSelectedUser(prefilledUser);
        }
    }, [prefilledUser]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            // Reset form state when dialog closes
            setAmount("");
            setSelectedUser(prefilledUser || null);
        }
    }, [open, prefilledUser]);

    const handleUserSelected = (user: User) => {
        setSelectedUser(user);
    };

    const handleSubmit = async () => {
        if (!selectedUser) {
            toaster.error({ title: "Please select a user" });
            return;
        }
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
            toaster.error({ title: "Please enter a valid amount" });
            return;
        }
        const amountInPaise = Math.round(amountFloat * 100);

        setIsLoading(true);
        try {
            await api.requestMoney({
                requestee_id: selectedUser.id,
                amount: amountInPaise,
            });

            toaster.success({
                title: "Request sent successfully! ✋",
                description: `Requested ₹${amountFloat.toFixed(2)} from @${selectedUser.username}`,
            });

            onRequestSuccess();
            
            // Reset form state
            setAmount("");
            setSelectedUser(prefilledUser || null);
            
            // Close dialog
            onOpenChange?.({ open: false });
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Request failed";
            toaster.error({ title: "Error", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root 
            open={open}
            onOpenChange={onOpenChange}
            {...rest}
        >
            <Portal>
                <Dialog.Backdrop
                    animation="fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                />
                <Dialog.Positioner>
                    <Dialog.Content
                        maxW="md"
                        bg="white"
                        _dark={{ bg: "gray.800" }}
                        boxShadow="lg"
                        animation="scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                        transformOrigin="center"
                        borderRadius="lg"
                    >
                        {/* Header */}
                        <Box
                            bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                            color="white"
                            p={6}
                            borderTopRadius="lg"
                            animation="slideInDown 250ms cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                        >
                            <HStack gap={3} width="100%" justify="space-between">
                                <HStack gap={3} flex={1}>
                                    <Icon 
                                        as={LuArrowDownLeft} 
                                        boxSize={6}
                                        animation="slideInLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                                    />
                                    <Text
                                        fontSize="lg"
                                        fontWeight={700}
                                        animation="slideInLeft 350ms cubic-bezier(0.4, 0, 0.2, 1)"
                                    >
                                        Request Money
                                    </Text>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <IconButton
                                        variant="ghost"
                                        size="sm"
                                        aria-label="Close dialog"
                                        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                                        _hover={{ 
                                            transform: "rotate(90deg) scale(1.1)",
                                            bg: "rgba(255, 255, 255, 0.2)",
                                        }}
                                        _active={{ 
                                            transform: "scale(0.95)",
                                        }}
                                    >
                                        <Icon as={LuX} boxSize={5} />
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </HStack>
                        </Box>

                        {/* Body */}
                        <Box 
                            p={6}
                            animation="slideInUp 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                        >
                            <VStack
                                gap={6}
                                align="stretch"
                                as="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                            >
                                {/* Requestee Field */}
                                <Field.Root
                                    animation="slideInUp 350ms cubic-bezier(0.4, 0, 0.2, 1)"
                                >
                                    <Field.Label fontWeight={600} mb={2}>
                                        Request From
                                    </Field.Label>
                                    {selectedUser ? (
                                        <HStack
                                            p={3}
                                            bg="blue.50"
                                            rounded="lg"
                                            border="1px solid"
                                            borderColor="blue.200"
                                            justify="space-between"
                                            _dark={{
                                                bg: "rgba(59, 130, 246, 0.1)",
                                                borderColor: "blue.900"
                                            }}
                                            transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                                            _hover={{
                                                boxShadow: "sm",
                                                borderColor: "blue.300",
                                            }}
                                        >
                                            <Box>
                                                <Text fontWeight={600} color="blue.700" _dark={{ color: "blue.400" }}>
                                                    @{selectedUser.username}
                                                </Text>
                                                <Text fontSize="xs" color="blue.600" _dark={{ color: "blue.500" }}>
                                                    {selectedUser.email}
                                                </Text>
                                            </Box>
                                            {!prefilledUser && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedUser(null)}
                                                    color="blue.600"
                                                    _dark={{ color: "blue.400" }}
                                                    transition="all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                                                    _hover={{
                                                        bg: "blue.100",
                                                        _dark: { bg: "rgba(59, 130, 246, 0.2)" },
                                                        transform: "scale(1.05)",
                                                    }}
                                                    _active={{
                                                        transform: "scale(0.95)",
                                                    }}
                                                    px={4}
                                                    py={2}
                                                >
                                                    Change
                                                </Button>
                                            )}
                                        </HStack>
                                    ) : (
                                        <UserSearch onUserSelected={handleUserSelected} zIndex="toast" />
                                    )}
                                </Field.Root>

                                {/* Amount Field */}
                                <Field.Root
                                    animation="slideInUp 400ms cubic-bezier(0.4, 0, 0.2, 1)"
                                >
                                    <Field.Label fontWeight={600} mb={2}>
                                        Amount (₹)
                                    </Field.Label>
                                    <NumberInput.Root
                                        value={amount}
                                        onValueChange={(details) => setAmount(details.value)}
                                        step={0.01}
                                        min={0.01}
                                    >
                                        <InputGroup
                                            startElement={
                                                <Icon as={MdOutlineCurrencyRupee} boxSize={5} color="gray.500" />
                                            }
                                        >
                                            <NumberInput.Input
                                                placeholder="Enter amount"
                                                fontSize="lg"
                                                fontWeight={500}
                                                px={4}
                                                py={2}
                                                transition="all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                                                _focus={{
                                                    borderColor: "teal.500",
                                                    boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                                                }}
                                            />
                                        </InputGroup>
                                    </NumberInput.Root>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Minimum: ₹0.01
                                    </Text>
                                </Field.Root>

                                {/* Request Button */}
                                <Button
                                    type="submit"
                                    width="100%"
                                    size="lg"
                                    bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                                    color="white"
                                    fontWeight={600}
                                    loading={isLoading}
                                    disabled={!selectedUser || !amount || isLoading}
                                    transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                                    _hover={{
                                        opacity: 0.9,
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg",
                                    }}
                                    _active={{
                                        transform: "scale(0.98)",
                                        transition: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    _disabled={{
                                        opacity: 0.5,
                                        cursor: "not-allowed",
                                        transform: "none",
                                    }}
                                    onClick={handleSubmit}
                                    animation="slideInUp 450ms cubic-bezier(0.4, 0, 0.2, 1)"
                                    px={6}
                                    py={3}
                                >
                                    {isLoading ? "Sending request..." : `Request ₹${amount || "0"}`}
                                </Button>
                            </VStack>
                        </Box>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
});
