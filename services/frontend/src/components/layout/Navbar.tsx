// src/components/layout/Navbar.tsx
import { 
    Box, 
    Flex, 
    Avatar,
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
import { useState, useEffect, useRef } from 'react';
import { LuMenu, LuX, LuUser, LuLogOut } from 'react-icons/lu';

export default function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Track scroll position for shadow effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                avatarRef.current &&
                !avatarRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUserNavigation = (selectedUser: User) => {
        navigate(`/users/${selectedUser.username}`);
    };

    const handleProfileClick = () => {
        navigate(`/users/${user?.username}`);
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDropdownOpen(false);
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

                    {/* User Profile Avatar with Custom Dropdown - Show on all screens */}
                    {user && (
                        <Box position="relative" ref={avatarRef}>
                            <Avatar.Root 
                                size={{ base: 'sm', md: 'md' }}
                                _hover={{
                                    transform: 'scale(1.08)',
                                    transition: 'transform 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                cursor="pointer"
                                border="2px solid"
                                borderColor="rgba(255, 255, 255, 0.3)"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <Avatar.Fallback 
                                    name={user.username}
                                    bg="rgba(255, 255, 255, 0.25)"
                                    color="white"
                                    fontWeight={600}
                                />
                            </Avatar.Root>

                            {/* Custom Dropdown Menu */}
                            {dropdownOpen && (
                                <Box
                                    ref={dropdownRef}
                                    position="absolute"
                                    top="calc(100% + 8px)"
                                    right="0"
                                    bg="white"
                                    boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                                    rounded="xl"
                                    minW="240px"
                                    zIndex={9999}
                                    border="1px solid"
                                    borderColor="gray.100"
                                    py={0}
                                    overflow="hidden"
                                    animation="slideDown 200ms ease-out"
                                    sx={{
                                        '@keyframes slideDown': {
                                            from: {
                                                opacity: 0,
                                                transform: 'translateY(-10px)'
                                            },
                                            to: {
                                                opacity: 1,
                                                transform: 'translateY(0)'
                                            }
                                        }
                                    }}
                                >
                                    {/* Header with user name */}
                                    <Box
                                        px={4}
                                        py={3}
                                        borderBottom="1px solid"
                                        borderColor="gray.100"
                                        bg="linear-gradient(135deg, #F0FDFA 0%, #F0F9FF 100%)"
                                    >
                                        <Text 
                                            fontSize="sm"
                                            fontWeight={700}
                                            color="#0E7C86"
                                            letterSpacing="0.5px"
                                        >
                                            {user.username}
                                        </Text>
                                    </Box>
                                    
                                    {/* Profile Item */}
                                    <Box
                                        px={4}
                                        py={3}
                                        display="flex"
                                        alignItems="center"
                                        gap={3}
                                        fontSize="sm"
                                        fontWeight={500}
                                        color="gray.700"
                                        _hover={{
                                            bg: '#F0FDFA',
                                            color: '#0E7C86',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleProfileClick}
                                    >
                                        <Icon as={LuUser} boxSize={4} color="#14B8A6" />
                                        My Profile
                                    </Box>
                                    
                                    {/* Logout Item */}
                                    <Box
                                        px={4}
                                        py={3}
                                        display="flex"
                                        alignItems="center"
                                        gap={3}
                                        fontSize="sm"
                                        fontWeight={500}
                                        color="red.600"
                                        _hover={{
                                            bg: "red.50",
                                            color: "red.700",
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleLogout}
                                    >
                                        <Icon as={LuLogOut} boxSize={4} color="red.500" />
                                        Logout
                                    </Box>
                                </Box>
                            )}
                        </Box>
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
                                            bg="linear-gradient(135deg, #F0FDFA 0%, #F0F9FF 100%)"
                                            rounded="lg"
                                            cursor="pointer"
                                            border="1px solid"
                                            borderColor="rgb(20, 184, 166)"
                                            _hover={{
                                                bg: 'linear-gradient(135deg, #E0F8F5 0%, #E0F7FF 100%)',
                                                borderColor: '#0E7C86',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => {
                                                navigate(`/users/${user?.username}`);
                                                closeMobileMenu();
                                            }}
                                        >
                                            <Flex gap={3} align="center">
                                                <Icon as={LuUser} boxSize={5} color="#14B8A6" />
                                                <Box>
                                                    <Text fontWeight={600} color="#0E7C86">
                                                        My Profile
                                                    </Text>
                                                    <Text 
                                                        fontSize="sm" 
                                                        color="gray.600"
                                                    >
                                                        @{user.username}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        </Box>

                                        <Box
                                            p={4}
                                            bg="red.50"
                                            rounded="lg"
                                            cursor="pointer"
                                            border="1px solid"
                                            borderColor="red.200"
                                            _hover={{
                                                bg: 'red.100',
                                                borderColor: 'red.400',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => {
                                                logout();
                                                navigate('/login');
                                                closeMobileMenu();
                                            }}
                                        >
                                            <Flex gap={3} align="center">
                                                <Icon as={LuLogOut} boxSize={5} color="red.600" />
                                                <Text 
                                                    fontWeight={600}
                                                    color="red.600"
                                                >
                                                    Logout
                                                </Text>
                                            </Flex>
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
