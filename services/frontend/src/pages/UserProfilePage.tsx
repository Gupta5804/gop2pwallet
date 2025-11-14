// src/pages/UserProfilePage.tsx

import { useState, useEffect, useCallback } from 'react';
import {
    Box, 
    Container, 
    Heading, 
    Spinner, 
    Text,
    Flex,
    Card,
    Stack,
    Avatar,
    HStack,
    Button,
    Separator,
    Center,
    VStack,
    Grid,
    Badge,
    Icon,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { api, User, Transaction } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useInView } from 'react-intersection-observer';
import TransactionList from '@/components/transactions/TransactionList';
import { sendMoneyDialog } from '@/components/transactions/SendMoneyDialog';
import { requestMoneyDialog } from '@/components/transactions/RequestMoneyDialog';
import { toaster } from '@/components/ui/toaster';
import { LuSend, LuArrowDownLeft, LuCalendar, LuUser, LuArrowUpRight } from 'react-icons/lu';

const PAGE_LIMIT = 5;

interface ProfileStats {
    totalSent: number;
    totalReceived: number;
    sentCount: number;
    receivedCount: number;
}

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user: loggedInUser } = useAuth();
    
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
    });

    // State management
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingTxns, setIsLoadingTxns] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [stats, setStats] = useState<ProfileStats>({
        totalSent: 0,
        totalReceived: 0,
        sentCount: 0,
        receivedCount: 0,
    });

    // Determine if viewing own profile
    const isOwnProfile = loggedInUser && profileUser && loggedInUser.id === profileUser.id;

    // Load profile and first page of transactions
    const loadProfileAndFirstPage = useCallback(async () => {
        if (!username) return;
        setIsLoadingProfile(true);
        setError(null);
        
        try {
            let userProfile: User;
            
            // Check if viewing own profile - if so, use loggedInUser data if available
            if (loggedInUser && loggedInUser.username === username) {
                userProfile = loggedInUser;
                console.log("Loading own profile from auth context");
            } else {
                // Fetch other user's profile
                console.log("Fetching profile for user:", username);
                userProfile = (await api.getUserProfile(username)).data;
            }
            
            if (!userProfile || !userProfile.id) {
                throw new Error("Invalid user profile data");
            }
            
            setProfileUser(userProfile);
            setOffset(0);
            setHasMore(true);
            setTransactions([]);

            // Load transactions
            setIsLoadingTxns(true);
            const history = (await api.getTransactionHistory(PAGE_LIMIT, 0, userProfile.id)).data;
            setTransactions(history || []);
            
            // Calculate stats from first page
            calculateStats(history || [], userProfile.id);
            
            if (!history || history.length < PAGE_LIMIT) {
                setHasMore(false);
            } else {
                setOffset(PAGE_LIMIT);
            }
        } catch (err: any) {
            console.error("Error loading profile:", err);
            const errorMsg = err.response?.data?.error || err.message || "User not found";
            setError(errorMsg);
            toaster.error({
                title: "Error Loading Profile",
                description: errorMsg,
            });
        } finally {
            setIsLoadingProfile(false);
            setIsLoadingTxns(false);
        }
    }, [username, loggedInUser]);

    // Calculate transaction statistics
    const calculateStats = (txns: Transaction[], userId: string) => {
        let totalSent = 0;
        let totalReceived = 0;
        let sentCount = 0;
        let receivedCount = 0;

        txns.forEach(tx => {
            if (tx.status === 'completed') {
                if (tx.sender_id === userId) {
                    totalSent += tx.amount;
                    sentCount++;
                } else if (tx.recipient_id === userId) {
                    totalReceived += tx.amount;
                    receivedCount++;
                }
            }
        });

        setStats({
            totalSent: totalSent / 100,
            totalReceived: totalReceived / 100,
            sentCount,
            receivedCount,
        });
    };

    // Load more transactions
    const loadMoreTransactions = useCallback(async () => {
        if (!profileUser || isLoadingTxns || !hasMore) return;

        setIsLoadingTxns(true);
        try {
            const nextTxns = (await api.getTransactionHistory(PAGE_LIMIT, offset, profileUser.id)).data;
            if (!nextTxns || nextTxns.length < PAGE_LIMIT) {
                setHasMore(false);
            }
            setTransactions(prev => [...prev, ...(nextTxns || [])]);
            setOffset(prev => prev + PAGE_LIMIT);
        } catch (err) {
            console.error("Error loading more transactions:", err);
            toaster.error({ title: "Failed to load more transactions" });
        } finally {
            setIsLoadingTxns(false);
        }
    }, [profileUser, isLoadingTxns, hasMore, offset]);

    useEffect(() => {
        loadProfileAndFirstPage();
    }, [loadProfileAndFirstPage]);

    useEffect(() => {
        if (inView && hasMore && !isLoadingTxns) {
            loadMoreTransactions();
        }
    }, [inView, hasMore, isLoadingTxns, loadMoreTransactions]);

    // Handle send money
    const handleOpenSend = () => {
        if (!profileUser) return;
        sendMoneyDialog.open("send-money-profile", {
            onTransactionSuccess: loadProfileAndFirstPage,
            prefilledUser: profileUser
        });
    };

    // Handle request money
    const handleOpenRequest = () => {
        if (!profileUser) return;
        requestMoneyDialog.open("request-money-profile", {
            onRequestSuccess: loadProfileAndFirstPage,
            prefilledUser: profileUser
        });
    };

    // Loading state
    if (isLoadingProfile) {
        return (
            <Container centerContent py={{ base: 12, md: 20 }}>
                <VStack gap={4}>
                    <Spinner size="xl" color="teal.600" thickness="4px" />
                    <Text color="gray.500" _dark={{ color: "gray.400" }} fontWeight="500">
                        Loading profile...
                    </Text>
                </VStack>
            </Container>
        );
    }

    // User not found
    if (!profileUser || error) {
        return (
            <Container centerContent py={{ base: 12, md: 20 }}>
                <VStack gap={4} align="center">
                    <Heading size="lg" color="red.600" _dark={{ color: "red.400" }}>
                        User Not Found
                    </Heading>
                    <Text color="gray.500" _dark={{ color: "gray.400" }} textAlign="center" fontSize="sm">
                        The user you're looking for doesn't exist or has been removed.
                    </Text>
                    {error && (
                        <Text color="gray.400" _dark={{ color: "gray.500" }} textAlign="center" fontSize="xs">
                            Error: {error}
                        </Text>
                    )}
                </VStack>
            </Container>
        );
    }

    return (
        <Container maxW="5xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
            <VStack gap={{ base: 8, md: 10 }} align="stretch">
                {/* Profile Header Card */}
                <Card.Root
                    bg="white"
                    _dark={{ bg: "gray.800" , borderColor: "gray.700" }}
                    borderWidth="1px"
                    borderColor="gray.200"
                    boxShadow="sm"
                    overflow="hidden"
                    transition="all 0.3s ease"
                    _hover={{
                        boxShadow: "md",
                    }}
                >
                    <Card.Body p={{ base: 6, md: 8 }}>
                        <Flex 
                            direction={{ base: 'column', sm: 'row' }} 
                            align={{ base: 'center', sm: 'flex-start' }}
                            gap={{ base: 8, md: 10 }}
                            justify="space-between"
                            width="100%"
                        >
                            {/* Left: Avatar and User Info */}
                            <Flex 
                                direction={{ base: 'column', sm: 'row' }}
                                align={{ base: 'center', sm: 'flex-start' }}
                                gap={{ base: 6, md: 8 }}
                                flex="1"
                                minW="0"
                            >
                                {/* Avatar with Border */}
                                <Avatar.Root 
                                    size={{ base: "2xl", md: "3xl" }}
                                    flexShrink={0}
                                    borderWidth="3px"
                                    borderColor="teal.300"
                                    _dark={{ borderColor: "teal.700" }}
                                >
                                    <Avatar.Fallback 
                                        name={profileUser.username}
                                        fontSize={{ base: "2xl", md: "3xl" }}
                                        fontWeight="700"
                                    />
                                </Avatar.Root>

                                {/* User Details */}
                                <VStack 
                                    align={{ base: 'center', sm: 'start' }}
                                    gap={2.5}
                                    flex="1"
                                    width={{ base: 'full', sm: 'auto' }}
                                >
                                    {/* Name with Badge */}
                                    <Flex 
                                        align="center" 
                                        gap={3} 
                                        wrap="wrap" 
                                        justify={{ base: 'center', sm: 'flex-start' }}
                                        width="100%"
                                    >
                                        <Heading 
                                            size={{ base: "lg", md: "xl" }}
                                            fontWeight="700"
                                            letterSpacing="-0.02em"
                                            color="teal.600"
                                            _dark={{ color: "teal.400" }}
                                        >
                                            {profileUser.firstName} {profileUser.lastName}
                                        </Heading>
                                        {isOwnProfile && (
                                            <Badge 
                                                colorPalette="teal" 
                                                variant="solid"
                                                fontSize="xs"
                                                fontWeight="700"
                                                px={2.5}
                                                py={1}
                                            >
                                                Your Profile
                                            </Badge>
                                        )}
                                    </Flex>
                                    
                                    {/* Username */}
                                    <Text 
                                        fontSize={{ base: "base", md: "lg" }}
                                        color="gray.600"
                                        _dark={{ color: "gray.400" }}
                                        fontWeight="600"
                                    >
                                        @{profileUser.username}
                                    </Text>

                                    {/* Email */}
                                    <Text 
                                        fontSize={{ base: "sm", md: "base" }}
                                        color="gray.500"
                                        _dark={{ color: "gray.500" }}
                                    >
                                        {profileUser.email}
                                    </Text>

                                    {/* Joined Date */}
                                    <HStack 
                                        gap={2}
                                        fontSize={{ base: "sm", md: "base" }}
                                        color="gray.500"
                                        _dark={{ color: "gray.500" }}
                                        mt={1}
                                    >
                                        <Icon as={LuCalendar} boxSize={5} />
                                        <Text>
                                            Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Flex>

                            {/* Right: Action Buttons */}
                            {!isOwnProfile && (
                                <VStack 
                                    gap={3}
                                    align={{ base: 'stretch', sm: 'flex-end' }}
                                    width={{ base: 'full', sm: 'auto' }}
                                    flexShrink={0}
                                >
                                    <Button
                                        size="lg"
                                        colorPalette="teal"
                                        variant="solid"
                                        onClick={handleOpenSend}
                                        gap={3}
                                        px={8}
                                        py={4}
                                        h="auto"
                                        transition="all 0.2s ease"
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            boxShadow: "lg",
                                        }}
                                        _active={{
                                            transform: "translateY(0)",
                                        }}
                                        fontWeight="600"
                                        fontSize={{ base: "sm", md: "base" }}
                                    >
                                        <Icon as={LuSend} boxSize={5} />
                                        <Text>Send Money</Text>
                                    </Button>
                                    <Button
                                        size="lg"
                                        colorPalette="blue"
                                        variant="outline"
                                        onClick={handleOpenRequest}
                                        gap={3}
                                        px={8}
                                        py={4}
                                        h="auto"
                                        transition="all 0.2s ease"
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            boxShadow: "lg",
                                        }}
                                        _active={{
                                            transform: "translateY(0)",
                                        }}
                                        fontWeight="600"
                                        fontSize={{ base: "sm", md: "base" }}
                                    >
                                        <Icon as={LuArrowDownLeft} boxSize={5} />
                                        <Text>Request Money</Text>
                                    </Button>
                                </VStack>
                            )}
                        </Flex>
                    </Card.Body>
                </Card.Root>

                {/* Stats Section - Only show for own profile */}
                {isOwnProfile && (
                    <>
                        <Grid
                            templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
                            gap={{ base: 4, md: 5 }}
                            width="100%"
                        >
                            {/* Total Sent */}
                            <Card.Root
                                bg="white"
                                _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                                borderWidth="1px"
                                borderColor="gray.200"
                                boxShadow="sm"
                                transition="all 0.3s ease"
                                _hover={{
                                    boxShadow: "md",
                                    borderColor: "red.300",
                                    _dark: { borderColor: "red.700" },
                                }}
                            >
                                <Card.Body p={5}>
                                    <VStack gap={3} align="start">
                                        <HStack gap={2} color="red.600" _dark={{ color: "red.400" }}>
                                            <Icon as={LuArrowUpRight} boxSize={5} />
                                            <Text fontSize="xs" fontWeight="700">Sent</Text>
                                        </HStack>
                                        <Heading size="lg" fontWeight="700">
                                            ₹{stats.totalSent.toFixed(2)}
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
                                            {stats.sentCount} transaction{stats.sentCount !== 1 ? 's' : ''}
                                        </Text>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Total Received */}
                            <Card.Root
                                bg="white"
                                _dark={{ bg: "gray.800" ,borderColor: "gray.700" }}
                                borderWidth="1px"
                                borderColor="gray.200"
                                boxShadow="sm"
                                transition="all 0.3s ease"
                                _hover={{
                                    boxShadow: "md",
                                    borderColor: "green.300",
                                    _dark: { borderColor: "green.700" },
                                }}
                            >
                                <Card.Body p={5}>
                                    <VStack gap={3} align="start">
                                        <HStack gap={2} color="green.600" _dark={{ color: "green.400" }}>
                                            <Icon as={LuArrowDownLeft} boxSize={5} />
                                            <Text fontSize="xs" fontWeight="700">Received</Text>
                                        </HStack>
                                        <Heading size="lg" fontWeight="700">
                                            ₹{stats.totalReceived.toFixed(2)}
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
                                            {stats.receivedCount} transaction{stats.receivedCount !== 1 ? 's' : ''}
                                        </Text>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Net Balance */}
                            <Card.Root
                                bg="white"
                                _dark={{ bg: "gray.800" ,borderColor: "gray.700" }}
                                borderWidth="1px"
                                borderColor="gray.200"
                                boxShadow="sm"
                                transition="all 0.3s ease"
                                _hover={{
                                    boxShadow: "md",
                                    borderColor: "blue.300",
                                    _dark: { borderColor: "blue.700" },
                                }}
                            >
                                <Card.Body p={5}>
                                    <VStack gap={3} align="start">
                                        <Text fontSize="xs" fontWeight="700" color="blue.600" _dark={{ color: "blue.400" }}>
                                            Net Balance
                                        </Text>
                                        <Heading 
                                            size="lg" 
                                            fontWeight="700"
                                            color={
                                                stats.totalReceived >= stats.totalSent 
                                                    ? "green.600" 
                                                    : "red.600"
                                            }
                                            _dark={{
                                                color:
                                                    stats.totalReceived >= stats.totalSent 
                                                        ? "green.400" 
                                                        : "red.400"
                                            }}
                                        >
                                            ₹{(stats.totalReceived - stats.totalSent).toFixed(2)}
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
                                            {stats.totalReceived >= stats.totalSent ? "Received more" : "Sent more"}
                                        </Text>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Total Users Connected */}
                            <Card.Root
                                bg="white"
                                _dark={{ bg: "gray.800" ,borderColor: "gray.700" }}
                                borderWidth="1px"
                                borderColor="gray.200"
                                boxShadow="sm"
                                transition="all 0.3s ease"
                                _hover={{
                                    boxShadow: "md",
                                    borderColor: "purple.300",
                                    _dark: { borderColor: "purple.700" },
                                }}
                            >
                                <Card.Body p={5}>
                                    <VStack gap={3} align="start">
                                        <HStack gap={2} color="purple.600" _dark={{ color: "purple.400" }}>
                                            <Icon as={LuUser} boxSize={5} />
                                            <Text fontSize="xs" fontWeight="700">Users</Text>
                                        </HStack>
                                        <Heading size="lg" fontWeight="700">
                                            {new Set([
                                                ...transactions
                                                    .filter(t => t.sender_id === profileUser.id)
                                                    .map(t => t.recipient_id),
                                                ...transactions
                                                    .filter(t => t.recipient_id === profileUser.id)
                                                    .map(t => t.sender_id)
                                            ]).size}
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
                                            Connected users
                                        </Text>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>
                        </Grid>
                    </>
                )}

                {/* Separator */}
                <Separator />

                {/* Transaction History Section */}
                <VStack align="stretch" gap={5}>
                    <Heading 
                        size="md"
                        fontWeight="700"
                        fontSize={{ base: "lg", md: "xl" }}
                    >
                        {isOwnProfile 
                            ? "Your Transaction History" 
                            : `Transactions with @${profileUser.username}`
                        }
                    </Heading>

                    {transactions.length === 0 && !isLoadingTxns ? (
                        <Card.Root
                            bg="gray.50"
                            _dark={{ bg: "gray.900" ,borderColor: "gray.700" }}
                            borderWidth="2px"
                            borderColor="gray.200"
                            borderStyle="dashed"
                        >
                            <Card.Body p={{ base: 8, md: 10 }}>
                                <Center>
                                    <VStack gap={4} align="center">
                                        <Icon as={LuArrowUpRight} boxSize={12} color="gray.300" _dark={{ color: "gray.600" }} />
                                        <Text 
                                            fontWeight="600" 
                                            color="gray.500"
                                            _dark={{ color: "gray.400" }}
                                            fontSize="base"
                                        >
                                            No transactions yet
                                        </Text>
                                        <Text 
                                            fontSize="sm" 
                                            color="gray.400"
                                            _dark={{ color: "gray.500" }}
                                            textAlign="center"
                                            maxW="sm"
                                        >
                                            {isOwnProfile 
                                                ? "Start sending or requesting money to see your transaction history"
                                                : `No transactions between you and @${profileUser.username}`
                                            }
                                        </Text>
                                    </VStack>
                                </Center>
                            </Card.Body>
                        </Card.Root>
                    ) : (
                        <Stack gap={4} width="100%">
                            <TransactionList 
                                transactions={transactions} 
                                currentUser={loggedInUser} 
                                title={isOwnProfile ? "Your Transactions" : `Transactions with ${profileUser.username}`}
                            />

                            {hasMore && (
                                <Center ref={ref} py={8}>
                                    <Spinner 
                                        size="md" 
                                        color="teal.600"
                                        thickness="4px"
                                    />
                                </Center>
                            )}

                            {!hasMore && transactions.length > 0 && (
                                <Center py={8}>
                                    <Text 
                                        fontSize="sm" 
                                        color="gray.500"
                                        _dark={{ color: "gray.400" }}
                                        fontWeight="500"
                                    >
                                        ✓ No more transactions
                                    </Text>
                                </Center>
                            )}
                        </Stack>
                    )}
                </VStack>
            </VStack>

            {/* Dialog Viewports */}
            <sendMoneyDialog.Viewport />
            <requestMoneyDialog.Viewport />
        </Container>
    );
}
