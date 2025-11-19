import { Box, SimpleGrid, Text, Badge, Stack, Flex, Icon, GridItem } from "@chakra-ui/react"
import { FaLaptop, FaServer, FaDatabase, FaArrowDown, FaArrowRight, FaArrowLeft } from "react-icons/fa"
import { SiNginx, SiGo, SiRabbitmq, SiReact, SiPostgresql } from "react-icons/si"

const Node = ({ icon, label, type, colorPalette }: { icon: React.ReactNode, label: string, type: string, colorPalette: string }) => (
    <Flex
        direction="column"
        align="center"
        p={4}
        bg="bg.panel"
        borderWidth="2px"
        borderColor={`${colorPalette}.200`}
        _dark={{ borderColor: `${colorPalette}.800` }}
        borderRadius="lg"
        boxShadow="sm"
        position="relative"
        zIndex={2}
        h="full"
        justify="center"
    >
        <Badge
            position="absolute"
            top="-3"
            colorPalette={colorPalette}
            variant="solid"
            size="sm"
        >
            {type}
        </Badge>
        <Box fontSize="3xl" color={`${colorPalette}.500`} mb={2}>
            {icon}
        </Box>
        <Text fontWeight="bold" fontSize="sm" textAlign="center">{label}</Text>
    </Flex>
)

const Connection = ({ label, direction = "down" }: { label: string, direction?: "down" | "right" | "left" }) => {
    const isVertical = direction === "down";
    return (
        <Flex
            align="center"
            justify="center"
            direction={isVertical ? "column" : "row"}
            h="full"
            w="full"
            position="relative"
            color="gray.400"
        >
            {isVertical && <Box h="full" w="2px" bg="gray.200" position="absolute" />}
            {!isVertical && <Box w="full" h="2px" bg="gray.200" position="absolute" />}

            <Box bg="bg.subtle" px={2} py={1} borderRadius="md" zIndex={1} border="1px solid" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">{label}</Text>
            </Box>
        </Flex>
    )
}

export const FullArchitectureDiagram = () => {
    return (
        <Box p={8} borderWidth="1px" borderRadius="xl" bg="bg.subtle" overflowX="auto">
            <Box minW="800px">
                <Stack gap={8} align="center">

                    {/* Level 1: Client */}
                    <Box w="200px">
                        <Node icon={<FaLaptop />} label="Client (Browser)" type="Frontend" colorPalette="blue" />
                    </Box>

                    <Connection label="HTTPS / WSS" />

                    {/* Level 2: Gateway */}
                    <Box w="200px">
                        <Node icon={<SiNginx />} label="Nginx Gateway" type="Reverse Proxy" colorPalette="green" />
                    </Box>

                    <Connection label="HTTP Routing" />

                    {/* Level 3: Services Layer */}
                    <Box p={6} borderWidth="1px" borderRadius="xl" bg="white" _dark={{ bg: "gray.900" }} borderStyle="dashed" w="full">
                        <Text fontWeight="bold" mb={6} color="gray.500">Docker Compose Network (Bridge)</Text>

                        <SimpleGrid columns={5} gap={4} alignItems="center">
                            {/* Frontend Container */}
                            <Node icon={<SiReact />} label="Frontend Container" type="React App" colorPalette="blue" />

                            {/* User Service */}
                            <Node icon={<SiGo />} label="User Service" type="Auth" colorPalette="purple" />

                            {/* Wallet Service */}
                            <Node icon={<SiGo />} label="Wallet Service" type="Ledger" colorPalette="cyan" />

                            {/* Transaction Service */}
                            <Node icon={<SiGo />} label="Transaction Service" type="Orchestrator" colorPalette="blue" />

                            {/* Notification Service */}
                            <Node icon={<SiGo />} label="Notification Service" type="Real-time" colorPalette="orange" />
                        </SimpleGrid>

                        {/* Internal Communications */}
                        <SimpleGrid columns={5} gap={4} mt={4}>
                            <Box /> {/* Frontend spacer */}
                            <Box /> {/* User spacer */}

                            {/* Wallet <-> Transaction Connection */}
                            <GridItem colSpan={2}>
                                <Flex align="center" justify="center" gap={2}>
                                    <FaArrowLeft size={12} color="gray" />
                                    <Badge variant="outline">gRPC (Synchronous)</Badge>
                                    <FaArrowRight size={12} color="gray" />
                                </Flex>
                            </GridItem>

                            <Box /> {/* Notification spacer */}
                        </SimpleGrid>
                    </Box>

                    <Connection label="Persistence & Messaging" />

                    {/* Level 4: Data Layer */}
                    <SimpleGrid columns={2} gap={20} w="full" maxW="600px">
                        <Stack align="center" gap={4}>
                            <Node icon={<SiPostgresql />} label="PostgreSQL" type="Database" colorPalette="blue" />
                            <Text fontSize="xs" color="gray.500" textAlign="center">Stores Users, Wallets, Transactions</Text>
                        </Stack>

                        <Stack align="center" gap={4}>
                            <Node icon={<SiRabbitmq />} label="RabbitMQ" type="Message Broker" colorPalette="orange" />
                            <Text fontSize="xs" color="gray.500" textAlign="center">Async Events (TransactionCompleted)</Text>
                        </Stack>
                    </SimpleGrid>

                </Stack>
            </Box>
        </Box>
    )
}
