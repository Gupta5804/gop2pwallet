// src/components/transactions/RequestMoneyDialog.tsx

import { useState } from "react";
import { api, User } from "@/services/api";
import UserSearch from "@/components/ui/UserSearch";
import { toaster } from "../ui/toaster";
import {
    Box,
    Button,
    Field,
    Input,
    NumberInput,
    VStack,
    createOverlay,
    Dialog,
    Portal,
    InputGroup
} from "@chakra-ui/react";

import { MdOutlineCurrencyRupee } from "react-icons/md";
interface RequestMoneyDialogProps {
    onRequestSuccess: () => void;
}

export const requestMoneyDialog = createOverlay<RequestMoneyDialogProps>((props) => {
    const { onRequestSuccess, onOpenChange, ...rest} = props;

    // states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleUserSelected = (user: User) => {
        setSelectedUser(user);
    };
    const handleSubmit = async () => {
        if (!selectedUser) {
            toaster.error({ title: "Please Select a user." });
            return;
        }
        const amountFloat = parseFloat(amount);
        if(isNaN(amountFloat) || amountFloat <= 0) {
            toaster.error({ title: "Please enter a valid amount." });
            return;
        }
        const amountInPaise = Math.round(amountFloat * 100);

        try {
            setIsLoading(true);

            await api.requestMoney({
                requestee_id: selectedUser.id,
                amount: amountInPaise,
            });

            toaster.success({
                title: "Request Sent !",
                description: `Requested ₹${amountFloat.toFixed(2)} from ${selectedUser.username}.`,
            });
            onRequestSuccess();
            onOpenChange?.({ open: false }); // close the dialog

            setSelectedUser(null);
            setAmount("");
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Request failed";
            toaster.error({ title: "Error", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Dialog.Root {...rest} onOpenChange={onOpenChange}>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="md">
                        <Dialog.Header>
                            <Dialog.Title>Request Money</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack
                                gap={4}
                                align="stretch"
                                as="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                            >
                                <Field.Root>
                                    <Field.Label>Request from</Field.Label>
                                    {selectedUser ? (
                                        <Box>
                                            <Input
                                                value={`${selectedUser.username} (${selectedUser.email})`}
                                                disabled
                                                mr={2}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedUser(null)}
                                                mt={2}
                                            >
                                                Change User
                                            </Button>
                                        </Box>
                                    ):(
                                        <UserSearch onUserSelected={handleUserSelected} zIndex="toast"/>
                                    )}
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Amount:</Field.Label>
                                    <NumberInput.Root
                                        value={amount}
                                        onValueChange={(details) => setAmount(details.value)}
                                        step={0.01}
                                        min={0.01}
                                    >
                                        <InputGroup startElement={<MdOutlineCurrencyRupee/>}>
                                        <NumberInput.Input placeholder="e.g., 50.25"/>
                                        </InputGroup>
                                    </NumberInput.Root>
                                </Field.Root>
                                <Button
                                    type="submit"
                                    colorPalette="blue"
                                    loading={isLoading}
                                    disabled ={!selectedUser || isLoading}
                                >
                                    Request Money
                                </Button>

                            </VStack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
});