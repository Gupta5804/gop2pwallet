import { Box, SimpleGrid, Text, Badge, Stack, Flex, Icon } from "@chakra-ui/react"
import { FaDocker, FaGlobe, FaDatabase } from "react-icons/fa"
import { SiNginx, SiGo, SiRabbitmq, SiReact } from "react-icons/si"
import { useServiceHealth } from "../../hooks/useServiceHealth"

const HEALTH_ENDPOINTS: Record<string, string> = {
    "user-service": "/health/user",
    "wallet-service": "/health/wallet",
    "transaction-service": "/health/transaction",
    "notification-service": "/health/notification",
};

const ContainerBox = ({ name, port, icon, colorPalette, type }: { name: string, port: string, icon: React.ReactNode, colorPalette: string, type: string }) => {
    const endpoint = HEALTH_ENDPOINTS[name];
    const { data: status, isLoading, isError } = endpoint
        ? useServiceHealth(name, endpoint)
        : { data: 'static', isLoading: false, isError: false };

    let badgeColor = 'blue';
    let badgeText = 'Active';

    if (isLoading) {
        badgeColor = 'gray';
        badgeText = 'Checking...';
    } else if (status === 'online') {
        badgeColor = 'green';
        badgeText = 'Running';
    } else if (status === 'offline' || isError) {
        badgeColor = 'red';
        badgeText = 'Offline';
    } else if (status === 'static') {
        badgeColor = 'blue';
        badgeText = 'Active';
    }

    return (
        <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg="bg.panel"
            boxShadow="sm"
            position="relative"
            overflow="hidden"
        >
            <Box position="absolute" top={0} right={0} px={2} py={1} bg={`${colorPalette}.100`} _dark={{ bg: `${colorPalette}.900` }} borderBottomLeftRadius="md">
                <Text fontSize="xs" fontWeight="bold" color={`${colorPalette}.700`} _dark={{ color: `${colorPalette}.200` }}>{type}</Text>
            </Box>
            <Stack gap={3}>
                <Flex align="center" gap={3}>
                    <Box fontSize="2xl" color={`${colorPalette}.500`} flexShrink={0}>{icon}</Box>
                    <Box minW={0}>
                        <Text fontWeight="bold" truncate>{name}</Text>
                        <Text fontSize="xs" color="fg.muted">Port: {port}</Text>
                    </Box>
                </Flex>
                <Badge size="sm" variant="surface" colorPalette={badgeColor}>{badgeText}</Badge>
            </Stack>
        </Box>
    );
}

export const ContainerMap = () => {
    return (
        <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.subtle">
            <Stack gap={8}>
                <Flex align="center" gap={2}>
                    <Icon as={FaDocker} fontSize="2xl" color="blue.500" />
                    <Text fontWeight="bold" fontSize="lg">Docker Compose Network</Text>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    <ContainerBox name="frontend" port="3000" icon={<SiReact />} colorPalette="blue" type="Frontend" />
                    <ContainerBox name="nginx" port="80:80" icon={<SiNginx />} colorPalette="green" type="Gateway" />
                    <ContainerBox name="user-service" port="8080" icon={<SiGo />} colorPalette="cyan" type="Service" />
                    <ContainerBox name="wallet-service" port="8081" icon={<SiGo />} colorPalette="cyan" type="Service" />
                    <ContainerBox name="transaction-service" port="8082" icon={<SiGo />} colorPalette="cyan" type="Service" />
                    <ContainerBox name="notification-service" port="8083" icon={<SiGo />} colorPalette="cyan" type="Service" />
                    <ContainerBox name="db" port="5432" icon={<FaDatabase />} colorPalette="blue" type="Database" />
                    <ContainerBox name="rabbitmq" port="5672" icon={<SiRabbitmq />} colorPalette="orange" type="Message Broker" />
                </SimpleGrid>

                <Box p={4} bg="blue.50" _dark={{ bg: "blue.900/20" }} borderRadius="md" borderWidth="1px" borderColor="blue.200">
                    <Text fontSize="sm" color="blue.700" _dark={{ color: "blue.200" }}>
                        <strong>Network Topology:</strong> All containers share a default bridge network, allowing direct communication via service names (e.g., <code>ping user-service</code>). Nginx acts as the ingress controller, routing external traffic to specific containers.
                    </Text>
                </Box>
            </Stack>
        </Box>
    )
}
