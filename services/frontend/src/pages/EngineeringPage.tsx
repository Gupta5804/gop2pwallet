import { Container, Heading, Text, Stack, Tabs, Box } from "@chakra-ui/react"
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
        <Container maxW="container.xl" py={10}>
            <Stack gap={8}>
                {/* Hero Section */}
                <Stack gap={4} textAlign="center" align="center" mb={4}>
                    <Heading size="4xl" fontWeight="extrabold" letterSpacing="tight">
                        Engineering & Architecture
                    </Heading>
                    <Text fontSize="xl" color="fg.muted" maxW="2xl">
                        A deep dive into the technical design, microservices architecture, and modern stack powering GoP2PWallet.
                    </Text>
                </Stack>

                <Tabs.Root defaultValue="overview" variant="enclosed">
                    <Tabs.List justifyContent="center" mb={8}>
                        <Tabs.Trigger value="overview">
                            <FaProjectDiagram /> Overview
                        </Tabs.Trigger>
                        <Tabs.Trigger value="architecture">
                            <FaSitemap /> Architecture
                        </Tabs.Trigger>
                        <Tabs.Trigger value="containers">
                            <FaNetworkWired /> Containers
                        </Tabs.Trigger>
                        <Tabs.Trigger value="communication">
                            <FaLayerGroup /> Communication
                        </Tabs.Trigger>
                        <Tabs.Trigger value="database">
                            <FaDatabase /> Data Schema
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="overview">
                        <Stack gap={12}>
                            {/* Tech Stack Section */}
                            <Stack gap={6}>
                                <Heading size="2xl">Technology Stack</Heading>
                                <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
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
                            <Stack gap={6}>
                                <Heading size="2xl">System Architecture</Heading>
                                <ArchitectureDiagram />
                            </Stack>

                            {/* Backend Services Section */}
                            <Stack gap={6}>
                                <Heading size="2xl">Backend Services</Heading>
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
                        <Stack gap={6}>
                            <Heading size="2xl">Full System Architecture</Heading>
                            <Text color="fg.muted">
                                Comprehensive view of all containers, their roles, and the communication protocols (HTTP, gRPC, AMQP) connecting them.
                            </Text>
                            <FullArchitectureDiagram />
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="containers">
                        <Stack gap={6}>
                            <Heading size="2xl">Container Orchestration</Heading>
                            <Text color="fg.muted">
                                Detailed view of the Docker Compose setup, including port mappings and service types.
                            </Text>
                            <ContainerMap />
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="communication">
                        <Stack gap={6}>
                            <Heading size="2xl">Service Communication</Heading>
                            <Text color="fg.muted">
                                Sequence of events for a typical P2P transfer, demonstrating HTTP, gRPC, and Event-Driven patterns.
                            </Text>
                            <SequenceDiagram />
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="database">
                        <Stack gap={6}>
                            <Heading size="2xl">Data Schema</Heading>
                            <DatabaseSchema />
                        </Stack>
                    </Tabs.Content>
                </Tabs.Root>
            </Stack>
        </Container>
    )
}
