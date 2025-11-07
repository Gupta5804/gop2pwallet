// src/components/transactions/RequestMoneyDialog.tsx

import { useEffect, useState } from "react";
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
    prefilledUser?: User;
}

export const requestMoneyDialog = createOverlay<RequestMoneyDialogProps>((props) => {
    const { onRequestSuccess, onOpenChange,prefilledUser, ...rest} = props;

    // states
    const [selectedUser, setSelectedUser] = useState<User | null>( prefilledUser || null);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (prefilledUser) {
            setSelectedUser(prefilledUser);
        }
    }, [prefilledUser]);
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

        setIsLoading(true);
        try {

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
                                            <InputGroup
                                                flex="1"
                                                endElement={
                                                    !prefilledUser && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedUser(null)}
                                                        >
                                                            Change
                                                        </Button>
                                                    )
                                                }
                                            >
                                            <Input
                                                value={selectedUser.username}
                                                readOnly
                                                />
                                            </InputGroup>
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
                                    onClick={handleSubmit}
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