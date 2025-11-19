import { Container, Heading, Text, Stack, Tabs, Box, VStack, HStack, Icon, Badge } from "@chakra-ui/react"
import { TechBadge } from "../components/engineering/TechBadge"
import { ServiceCard } from "../components/engineering/ServiceCard"
import { ArchitectureDiagram } from "../components/engineering/ArchitectureDiagram"
import { FullArchitectureDiagram } from "../components/engineering/FullArchitectureDiagram"
import { ContainerMap } from "../components/engineering/ContainerMap"
import { SequenceDiagram } from "../components/engineering/SequenceDiagram"
import { DatabaseSchema } from "../components/engineering/DatabaseSchema"
import { SiGo, SiReact, SiDocker, SiPostgresql, SiRabbitmq, SiNginx, SiTypescript, SiVite } from "react-icons/si"
import { FaServer, FaWallet, FaExchangeAlt, FaBell, FaNetworkWired, FaLayerGroup, FaDatabase, FaProjectDiagram, FaSitemap } from "react-icons/fa"

export const EngineeringPage = () => {
    return (
        <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
            {/* Hero Section */}
            <Box
                bg="linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)"
                color="white"
                py={{ base: 16, md: 24 }}
                position="relative"
                overflow="hidden"
            >
                {/* Decorative Elements */}
                <Box
                    position="absolute"
                    top={-10}
                    right={-10}
                    width="300px"
                    height="300px"
                    bg="white"
                    opacity="0.05"
                    rounded="full"
                    filter="blur(50px)"
                />
                <Box
                    position="absolute"
                    bottom={-20}
                    left={-20}
                    width="400px"
                    height="400px"
                    bg="white"
                    opacity="0.05"
                    rounded="full"
                    filter="blur(60px)"
                />

                <Container maxW="container.xl" position="relative" zIndex={1}>
                    <VStack gap={6} align="center" textAlign="center">
                        <Badge
                            bg="rgba(255, 255, 255, 0.15)"
                            color="white"
                            px={4}
                            py={1}
                            rounded="full"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            fontSize="xs"
                            fontWeight="bold"
                            border="1px solid rgba(255, 255, 255, 0.2)"
                        >
                            Under the Hood
                        </Badge>
                        <Heading
                            size="5xl"
                            fontWeight="800"
                            letterSpacing="-0.02em"
                            lineHeight="1.1"
                        >
                            Engineering & Architecture
                        </Heading>
                        <Text fontSize="xl" maxW="2xl" color="rgba(255, 255, 255, 0.9)" lineHeight="relaxed">
                            Explore the technical design, microservices architecture, and modern stack that powers GoPay's secure and scalable platform.
                        </Text>
                    </VStack>
                </Container>
            </Box>

            <Container maxW="container.xl" py={12} px={{ base: 4, md: 8 }}>
                <Tabs.Root defaultValue="overview" variant="line">
                    <Tabs.List
                        mb={12}
                        bg="white"
                        _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                        p={1}
                        rounded="xl"
                        shadow="sm"
                        border="1px solid"
                        borderColor="gray.200"
                        display="inline-flex"
                        width={{ base: "100%", lg: "auto" }}
                        overflowX="auto"
                    >
                        {[
                            { value: "overview", icon: FaProjectDiagram, label: "Overview" },
                            { value: "architecture", icon: FaSitemap, label: "Architecture" },
                            { value: "containers", icon: FaNetworkWired, label: "Containers" },
                            { value: "communication", icon: FaLayerGroup, label: "Communication" },
                            { value: "database", icon: FaDatabase, label: "Data Schema" },
                        ].map((tab) => (
                            <Tabs.Trigger
                                key={tab.value}
                                value={tab.value}
                                px={6}
                                py={3}
                                rounded="lg"
                                _selected={{
                                    bg: "teal.50",
                                    color: "teal.600",
                                    _dark: { bg: "rgba(20, 184, 166, 0.1)", color: "teal.400" }
                                }}
                                fontWeight="600"
                                color="gray.600"
                                _dark={{ color: "gray.400" }}
                                whiteSpace="nowrap"
                            >
                                <HStack gap={2}>
                                    <Icon as={tab.icon} />
                                    <Text>{tab.label}</Text>
                                </HStack>
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <Tabs.Content value="overview">
                        <Stack gap={16}>
                            {/* Tech Stack Section */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Technology Stack</Heading>
                                    <Text color="gray.500" fontSize="lg">Built with modern, performant technologies.</Text>
                                </VStack>
                                <Box display="flex" flexWrap="wrap" gap={4}>
                                    <TechBadge name="Golang" icon={<SiGo />} colorPalette="cyan" />
                                    <TechBadge name="React 19" icon={<SiReact />} colorPalette="blue" />
                                    <TechBadge name="TypeScript" icon={<SiTypescript />} colorPalette="blue" />
                                    <TechBadge name="Vite" icon={<SiVite />} colorPalette="purple" />
                                    <TechBadge name="Docker" icon={<SiDocker />} colorPalette="blue" />
                                    <TechBadge name="PostgreSQL" icon={<SiPostgresql />} colorPalette="blue" />
                                    <TechBadge name="RabbitMQ" icon={<SiRabbitmq />} colorPalette="orange" />
                                    <TechBadge name="Nginx" icon={<SiNginx />} colorPalette="green" />
                                </Box>
                            </Stack>

                            {/* Architecture Section */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>System Architecture</Heading>
                                    <Text color="gray.500" fontSize="lg">High-level overview of the system components.</Text>
                                </VStack>
                                <ArchitectureDiagram />
                            </Stack>

                            {/* Backend Services Section */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Backend Services</Heading>
                                    <Text color="gray.500" fontSize="lg">Microservices powering the core business logic.</Text>
                                </VStack>
                                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={6}>
                                    <ServiceCard
                                        title="User Service"
                                        description="Manages user identity, authentication, and profiles."
                                        type="Backend"
                                        icon={<FaServer />}
                                        colorPalette="purple"
                                        responsibilities={[
                                            "User Registration & Login",
                                            "JWT Token Management",
                                            "Profile Updates",
                                            "gRPC Auth Interceptors"
                                        ]}
                                    />
                                    <ServiceCard
                                        title="Wallet Service"
                                        description="Handles account balances and ledger operations."
                                        type="Backend"
                                        icon={<FaWallet />}
                                        colorPalette="green"
                                        responsibilities={[
                                            "Balance Tracking",
                                            "Deposit & Withdrawal",
                                            "Ledger Consistency",
                                            "Atomic Transactions"
                                        ]}
                                    />
                                    <ServiceCard
                                        title="Transaction Service"
                                        description="Orchestrates P2P transfers and transaction history."
                                        type="Backend"
                                        icon={<FaExchangeAlt />}
                                        colorPalette="blue"
                                        responsibilities={[
                                            "P2P Transfer Logic",
                                            "Saga Pattern Implementation",
                                            "Transaction History",
                                            "Idempotency Checks"
                                        ]}
                                    />
                                    <ServiceCard
                                        title="Notification Service"
                                        description="Delivers real-time updates to users."
                                        type="Backend"
                                        icon={<FaBell />}
                                        colorPalette="orange"
                                        responsibilities={[
                                            "Email Notifications",
                                            "Push Notifications",
                                            "Event Consumption (RabbitMQ)",
                                            "Template Management"
                                        ]}
                                    />
                                </Box>
                            </Stack>
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="architecture">
                        <Stack gap={8}>
                            <VStack align="start" gap={2}>
                                <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Full System Architecture</Heading>
                                <Text color="gray.500" fontSize="lg">
                                    Comprehensive view of all containers, their roles, and the communication protocols.
                                </Text>
                            </VStack>
                            <FullArchitectureDiagram />
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="containers">
                        <Stack gap={8}>
                            <VStack align="start" gap={2}>
                                <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Container Orchestration</Heading>
                                <Text color="gray.500" fontSize="lg">
                                    Detailed view of the Docker Compose setup and port mappings.
                                </Text>
                            </VStack>
                            <ContainerMap />
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="communication">
                        <Stack gap={8}>
                            <VStack align="start" gap={2}>
                                <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Service Communication</Heading>
                                <Text color="gray.500" fontSize="lg">
                                    Sequence of events for a typical P2P transfer.
                                </Text>
                            </VStack>
                            <SequenceDiagram />
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="database">
                        <Stack gap={8}>
                            <VStack align="start" gap={2}>
                                <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Data Schema</Heading>
                                <Text color="gray.500" fontSize="lg">
                                    Database relationships and schema definitions.
                                </Text>
                            </VStack>
                            <DatabaseSchema />
                        </Stack>
                    </Tabs.Content>
                </Tabs.Root>
            </Container>
        </Box>
    )
}
