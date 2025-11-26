import { TransactionFlow } from "../components/engineering/diagrams/TransactionFlow"
import { Container, Heading, Text, Stack, Tabs, Box, VStack, HStack, Icon, Badge, useBreakpointValue, Button } from "@chakra-ui/react"
import { TechBadge } from "../components/engineering/TechBadge"
import { ServiceCard } from "../components/engineering/ServiceCard"
import { ArchitectureDiagram } from "../components/engineering/ArchitectureDiagram"
import { FullArchitectureDiagram } from "../components/engineering/FullArchitectureDiagram"
import { ContainerMap } from "../components/engineering/ContainerMap"
import { SequenceDiagram } from "../components/engineering/SequenceDiagram"
import { DatabaseSchema } from "../components/engineering/DatabaseSchema"
import { ApiDocs } from "../components/engineering/ApiDocs"
import { TECH_STACK } from "../constants/engineering"
import { SiGo, SiReact, SiDocker, SiPostgresql, SiRabbitmq, SiNginx, SiTypescript, SiVite } from "react-icons/si"
import { FaServer, FaWallet, FaExchangeAlt, FaBell, FaNetworkWired, FaLayerGroup, FaDatabase, FaProjectDiagram, FaSitemap, FaHeartbeat, FaBook, FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
//import { Button } from "@/components/ui/button"

export const EngineeringPage = () => {
    const navigate = useNavigate()
    const diagramHeight = useBreakpointValue({ base: "400px", md: "600px" })

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
                {/* Back Button */}
                <Button
                    position="absolute"
                    top={4}
                    left={4}
                    zIndex={10}
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => navigate(-1)}
                    size="sm"
                >
                    <Icon as={FaArrowLeft} mr={2} />
                    Back to App
                </Button>

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
                <Tabs.Root defaultValue="health" variant="line">
                    <Box overflowX="auto" pb={2}>
                        <Tabs.List
                            mb={8}
                            bg="white"
                            _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                            p={1}
                            rounded="xl"
                            shadow="sm"
                            border="1px solid"
                            borderColor="gray.200"
                            display="inline-flex"
                            minW="fit-content"
                        >
                            {[
                                { value: "health", icon: FaHeartbeat, label: "System Health" },
                                { value: "architecture", icon: FaSitemap, label: "Architecture & Flow" },
                                { value: "reference", icon: FaBook, label: "Reference" },
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
                    </Box>

                    <Tabs.Content value="health">
                        <Stack gap={16}>
                            {/* Container Orchestration */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>System Health & Containers</Heading>
                                    <Text color="gray.500" fontSize="lg">
                                        Real-time status of Docker containers and microservices.
                                    </Text>
                                </VStack>
                                <ContainerMap />
                            </Stack>

                            {/* Tech Stack */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Technology Stack</Heading>
                                    <Text color="gray.500" fontSize="lg">Built with modern, performant technologies.</Text>
                                </VStack>
                                <Box display="flex" flexWrap="wrap" gap={4}>
                                    {TECH_STACK.map((tech) => (
                                        <TechBadge key={tech.name} name={tech.name} icon={<tech.icon />} colorPalette={tech.color} />
                                    ))}
                                </Box>
                            </Stack>
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="architecture">
                        <Stack gap={16}>
                            {/* Live Transaction Flow */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Live Transaction Flow</Heading>
                                    <Text color="gray.500" fontSize="lg">
                                        Interactive visualization of a P2P transfer request.
                                    </Text>
                                </VStack>
                                <Box height={diagramHeight} borderWidth="1px" borderRadius="xl" overflow="hidden">
                                    <TransactionFlow />
                                </Box>
                            </Stack>

                            {/* High Level Architecture */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>System Architecture</Heading>
                                    <Text color="gray.500" fontSize="lg">High-level overview of the system components.</Text>
                                </VStack>
                                <ArchitectureDiagram />
                            </Stack>

                            {/* Full Architecture */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Full System Architecture</Heading>
                                    <Text color="gray.500" fontSize="lg">
                                        Comprehensive view of all containers and protocols.
                                    </Text>
                                </VStack>
                                <FullArchitectureDiagram />
                            </Stack>

                            {/* Communication */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Service Communication</Heading>
                                    <Text color="gray.500" fontSize="lg">
                                        Sequence of events for a typical P2P transfer.
                                    </Text>
                                </VStack>
                                <SequenceDiagram />
                            </Stack>
                        </Stack>
                    </Tabs.Content>

                    <Tabs.Content value="reference">
                        <Stack gap={16}>
                            {/* API Docs */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>API Documentation</Heading>
                                    <Text color="gray.500" fontSize="lg">
                                        OpenAPI/Swagger documentation for the microservices.
                                    </Text>
                                </VStack>
                                <ApiDocs />
                            </Stack>

                            {/* Database Schema */}
                            <Stack gap={8}>
                                <VStack align="start" gap={2}>
                                    <Heading size="2xl" color="gray.800" _dark={{ color: "white" }}>Data Schema</Heading>
                                    <Text color="gray.500" fontSize="lg">
                                        Database relationships and schema definitions.
                                    </Text>
                                </VStack>
                                <DatabaseSchema />
                            </Stack>
                        </Stack>
                    </Tabs.Content>
                </Tabs.Root>
            </Container>
        </Box >
    )
}
