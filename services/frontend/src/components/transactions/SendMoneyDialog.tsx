// src/components/transactions/SendMoneyDialog.tsx

import { useState, useEffect } from "react";
import { api, User } from "@/services/api";
import UserSearch from "../ui/UserSearch";
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
    CloseButton,
} from "@chakra-ui/react";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { LuSend } from "react-icons/lu";

// Define props
interface SendMoneyDialogProps {
    onTransactionSuccess: () => void;
    prefilledUser?: User;
}

// create overlay
export const sendMoneyDialog = createOverlay<SendMoneyDialogProps>((props) => {
    const { onTransactionSuccess, onOpenChange, open, prefilledUser, ...rest } = props;

    // state
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

    // Handle close - this is the proper way to close the overlay
    const handleClose = () => {
        setAmount("");
        setSelectedUser(prefilledUser || null);
        onOpenChange?.({ open: false });
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
            await api.sendMoney({
                recipient_id: selectedUser.id,
                amount: amountInPaise,
            });

            toaster.success({
                title: "Money sent successfully! 🎉",
                description: `₹${amountFloat.toFixed(2)} sent to @${selectedUser.username}`,
            });

            onTransactionSuccess();
            
            // Close dialog after success
            handleClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Failed to send money";
            toaster.error({ title: "Error", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root 
            open={open}
            onOpenChange={onOpenChange}
            closeOnEsc={true}
            closeOnInteractOutside={true}
            {...rest}
        >
            <Portal>
                <Dialog.Backdrop 
                    bg="rgba(0, 0, 0, 0.5)"
                    onClick={() => handleClose()}
                />
                <Dialog.Positioner pointerEvents="auto">
                    <Dialog.Content
                        maxW="md"
                        bg="white"
                        _dark={{ bg: "gray.800" }}
                        boxShadow="lg"
                        borderRadius="lg"
                    >
                        {/* Header */}
                        <Box
                            bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                            color="white"
                            p={6}
                            borderTopRadius="lg"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <HStack gap={3}>
                                <Icon 
                                    as={LuSend} 
                                    boxSize={6}
                                />
                                <Text
                                    fontSize="lg"
                                    fontWeight={700}
                                >
                                    Send Money
                                </Text>
                            </HStack>
                            <CloseButton 
                                size="lg"
                                onClick={handleClose}
                                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                            />
                        </Box>

                        {/* Body */}
                        <Box 
                            p={6}
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
                                {/* Recipient Field */}
                                <Field.Root>
                                    <Field.Label fontWeight={600} mb={2}>
                                        Recipient
                                    </Field.Label>
                                    {selectedUser ? (
                                        <HStack
                                            p={3}
                                            bg="green.50"
                                            rounded="lg"
                                            border="1px solid"
                                            borderColor="green.200"
                                            justify="space-between"
                                            _dark={{
                                                bg: "rgba(34, 197, 94, 0.1)",
                                                borderColor: "green.900"
                                            }}
                                            transition="all 200ms ease"
                                            _hover={{
                                                boxShadow: "sm",
                                                borderColor: "green.300",
                                            }}
                                        >
                                            <Box>
                                                <Text fontWeight={600} color="green.700" _dark={{ color: "green.400" }}>
                                                    @{selectedUser.username}
                                                </Text>
                                                <Text fontSize="xs" color="green.600" _dark={{ color: "green.500" }}>
                                                    {selectedUser.email}
                                                </Text>
                                            </Box>
                                            {!prefilledUser && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedUser(null)}
                                                    color="green.600"
                                                    _dark={{ color: "green.400" }}
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
                                <Field.Root>
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
                                                py={3}
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

                                {/* Send Button */}
                                <Button
                                    type="submit"
                                    width="100%"
                                    size="lg"
                                    bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                                    color="white"
                                    fontWeight={600}
                                    loading={isLoading}
                                    disabled={!selectedUser || !amount || isLoading}
                                    _hover={{
                                        opacity: 0.9,
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg",
                                    }}
                                    _active={{
                                        transform: "scale(0.98)",
                                    }}
                                    _disabled={{
                                        opacity: 0.5,
                                        cursor: "not-allowed",
                                        transform: "none",
                                    }}
                                    onClick={handleSubmit}
                                    px={6}
                                    py={4}
                                >
                                    {isLoading ? "Sending..." : `Send ₹${amount || "0"}`}
                                </Button>
                            </VStack>
                        </Box>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
});
