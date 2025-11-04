// src/components/layout/Navbar.tsx
import { 
    Box, 
    Button, 
    Flex, 
    Spacer,
    Heading,
    Menu,
    
    Avatar,
    Portal,
    MenuItemGroup,
    HStack,
} from '@chakra-ui/react';
import { Link ,useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import  UserSearch  from '@/components/ui/UserSearch';
import { ColorModeButton } from '@/components/ui/color-mode';
import { User } from '@/services/api';
export default function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleUserNavigation = (selectedUser: User) =>{
      navigate(`/users/${selectedUser.username}`);
    };
    
    const handleMenuSelect = (details: {value: string}) => {
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

    return (
        <Box bg="teal.400" p={4} color="white" as="nav" boxShadow="md" borderBottomWidth="1px" zIndex={10}>
            <Flex align="center" maxW="container.xl" mx="auto">
                <Heading as={Link} to="/" size="md" >
                        GoPay
                </Heading>
                <Spacer />
                <HStack gap={4}>
                  
                </HStack>
                <Box w={{ base: '150px', sm: '250px', md: '400px' }}>
                    <UserSearch onUserSelected={handleUserNavigation} zIndex="docked"/>
                </Box>
                <Spacer/>
                {user && (
                    <Menu.Root
                      positioning={{ placement: "bottom-end"}}
                      onSelect={handleMenuSelect}
                    >
                      <Menu.Trigger rounded="full" focusRing="outside" cursor="pointer">
                        <Avatar.Root size="sm">
                          <Avatar.Fallback name={user.username} />
                        </Avatar.Root>
                      </Menu.Trigger>

                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content>
                            <MenuItemGroup>
                              <Menu.ItemGroupLabel>{user.username}</Menu.ItemGroupLabel>
                              <Menu.Item value="profile">
                                My Profile
                              </Menu.Item>
                            </MenuItemGroup>
                            <Menu.Separator/>
                            <Menu.Item 
                              value="logout"
                              color="fg.error"
                              _hover={{bg : "bg.error", color:"fg.error"}}
                            >
                              Logout
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
    </Menu.Root>
                )}
            </Flex>
        </Box>
    )

}
