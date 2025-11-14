// src/components/layout/Navbar.tsx
import { 
    Box, 
    Flex, 
    Menu,
    Avatar,
    Portal,
    MenuItemGroup,
    Icon,
    IconButton,
    Drawer,
    Text,
    Image,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserSearch from '@/components/ui/UserSearch';
import { User } from '@/services/api';
import { useState, useEffect } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';

export default function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Track scroll position for shadow effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleUserNavigation = (selectedUser: User) => {
        navigate(`/users/${selectedUser.username}`);
    };
    
    const handleMenuSelect = (details: { value: string }) => {
        switch(details.value) {
            case "profile":
                navigate(`/users/${user?.username}`);
                break;
            case "logout":
                logout();
                navigate('/login');
                break;
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <Box 
            as="nav"
            position="sticky"
            top={0}
            zIndex={100}
            width="100%"
            background="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
            color="white"
            boxShadow={scrolled ? "0 4px 20px rgba(0, 0, 0, 0.15)" : "none"}
            transition="all 0.3s ease"
            borderBottomWidth={scrolled ? "0px" : "1px"}
            borderBottomColor="rgba(255, 255, 255, 0.1)"
        >
            <Flex 
                align="center" 
                justify="space-between"
                maxW="container.2xl" 
                mx="auto" 
                px={{ base: 4, md: 8 }}
                py={{ base: 2, md: 3 }}
                gap={4}
            >
                {/* Logo - Left Side */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <Flex 
                        align="center"
                        gap={2}
                        _hover={{
                            opacity: 0.9,
                            transition: 'opacity 0.2s ease'
                        }}
                    >
                        <Image
                            src="/logos/gop2pwallet.png"
                            alt="GoPay Logo"
                            h={{ base: '32px', md: '40px' }}
                            w="auto"
                            transition="all 0.2s ease"
                            _hover={{
                                transform: 'scale(1.05)',
                            }}
                        />
                    </Flex>
                </Link>

                {/* Search Bar - Center (Hidden on mobile) */}
                <Box 
                    display={{ base: 'none', md: 'block' }}
                    flex={1}
                    maxW="400px"
                    mx={4}
                >
                    <UserSearch 
                        onUserSelected={handleUserNavigation} 
                        zIndex="docked"
                    />
                </Box>

                {/* Right Side - User Menu & Mobile Toggle */}
                <Flex align="center" gap={{ base: 2, md: 4 }}>
                    {/* Mobile Menu Toggle - Show only on small screens */}
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        variant="ghost"
                        size="lg"
                        onClick={() => setMobileMenuOpen(true)}
                        _hover={{
                            bg: 'rgba(255, 255, 255, 0.15)',
                            transform: 'scale(1.05)',
                            transition: 'all 0.2s ease'
                        }}
                        aria-label="Open menu"
                    >
                        <Icon as={LuMenu} boxSize={6} />
                    </IconButton>

                    {/* User Profile Avatar - Show on all screens */}
                    {user && (
                        <Menu.Root
                            positioning={{ 
                                placement: "bottom-end",
                                offset: { mainAxis: 8, crossAxis: 0 }
                            }}
                            onSelect={handleMenuSelect}
                            closeOnSelect={true}
                        >
                            <Menu.Trigger 
                                asChild
                                cursor="pointer"
                            >
                                <Avatar.Root 
                                    size={{ base: 'sm', md: 'md' }}
                                    _hover={{
                                        transform: 'scale(1.08)',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    cursor="pointer"
                                >
                                    <Avatar.Fallback 
                                        name={user.username}
                                        bg="rgba(255, 255, 255, 0.25)"
                                        color="white"
                                        fontWeight={600}
                                    />
                                </Avatar.Root>
                            </Menu.Trigger>

                            <Portal>
                                <Menu.Positioner>
                                    <Menu.Content 
                                        bg="white"
                                        boxShadow="lg"
                                        rounded="lg"
                                        minW="220px"
                                        zIndex={1000}
                                        border="1px solid"
                                        borderColor="gray.100"
                                    >
                                        <MenuItemGroup title={user.username}>
                                            <Menu.Item 
                                                value="profile"
                                                px={4}
                                                py={3}
                                                _hover={{
                                                    bg: 'gray.100',
                                                }}
                                            >
                                                My Profile
                                            </Menu.Item>
                                        </MenuItemGroup>
                                        <Menu.Separator />
                                        <Menu.Item 
                                            value="logout"
                                            color="fg.error"
                                            px={4}
                                            py={3}
                                            _hover={{
                                                bg: "red.50",
                                                color: "fg.error",
                                            }}
                                        >
                                            Logout
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu.Positioner>
                            </Portal>
                        </Menu.Root>
                    )}
                </Flex>
            </Flex>

            {/* Mobile Menu Drawer */}
            <Drawer.Root 
                open={mobileMenuOpen} 
                onOpenChange={(details) => {
                    if (!details.open) {
                        closeMobileMenu();
                    }
                }}
                placement="end"
            >
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content
                        bg="white"
                        color="gray.900"
                    >
                        <Drawer.CloseTrigger 
                            position="absolute"
                            top={4}
                            insetEnd={4}
                            asChild
                        >
                            <IconButton 
                                variant="ghost"
                                size="lg"
                                aria-label="Close menu"
                            >
                                <Icon as={LuX} boxSize={6} />
                            </IconButton>
                        </Drawer.CloseTrigger>

                        <Drawer.Body pt={16} pb={8}>
                            <Flex 
                                flexDirection="column" 
                                gap={4}
                            >
                                {/* Mobile Search */}
                                <Box mb={4}>
                                    <Text 
                                        fontSize="sm" 
                                        fontWeight={600} 
                                        mb={2}
                                        color="gray.600"
                                    >
                                        Find User
                                    </Text>
                                    <UserSearch 
                                        onUserSelected={(user) => {
                                            handleUserNavigation(user);
                                            closeMobileMenu();
                                        }}
                                        zIndex="docked"
                                    />
                                </Box>

                                {/* Mobile Menu Items */}
                                {user && (
                                    <>
                                        <Box
                                            p={4}
                                            bg="gray.50"
                                            rounded="lg"
                                            cursor="pointer"
                                            _hover={{
                                                bg: 'gray.100',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => {
                                                navigate(`/users/${user?.username}`);
                                                closeMobileMenu();
                                            }}
                                        >
                                            <Text fontWeight={600}>
                                                My Profile
                                            </Text>
                                            <Text 
                                                fontSize="sm" 
                                                color="gray.600"
                                            >
                                                @{user.username}
                                            </Text>
                                        </Box>

                                        <Box
                                            p={4}
                                            bg="red.50"
                                            rounded="lg"
                                            cursor="pointer"
                                            _hover={{
                                                bg: 'red.100',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => {
                                                logout();
                                                navigate('/login');
                                                closeMobileMenu();
                                            }}
                                        >
                                            <Text 
                                                fontWeight={600}
                                                color="red.600"
                                            >
                                                Logout
                                            </Text>
                                        </Box>
                                    </>
                                )}
                            </Flex>
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Drawer.Root>
        </Box>
    );
}
