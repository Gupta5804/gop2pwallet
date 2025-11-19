import { Box, Flex, Heading, Icon, SimpleGrid, Stack, Text, Badge } from "@chakra-ui/react"
import { FaLaptop, FaServer, FaDatabase, FaArrowRight, FaArrowDown } from "react-icons/fa"
import { SiNginx, SiPostgresql, SiRabbitmq, SiGo } from "react-icons/si"

const ServiceNode = ({ icon, label, colorPalette }: { icon: React.ReactNode, label: string, colorPalette: string }) => (
    <Flex
        direction="column"
        align="center"
        p={4}
        bg="bg.panel"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="sm"
        minW="120px"
    >
        <Box fontSize="3xl" color={`${colorPalette}.500`} mb={2}>
            {icon}
        </Box>
        <Text fontWeight="bold" fontSize="sm">{label}</Text>
    </Flex>
)

const Arrow = () => (
    <Flex align="center" justify="center" color="gray.400">
        <Box display={{ base: "none", md: "block" }}>
            <FaArrowRight size={24} />
        </Box>
        <Box display={{ base: "block", md: "none" }}>
            <FaArrowDown size={24} />
        </Box>
    </Flex>
)

export const ArchitectureDiagram = () => {
    return (
        <Box p={8} borderWidth="1px" borderRadius="xl" bg="bg.subtle">
            <Stack direction={{ base: "column", md: "row" }} gap={8} align="center" justify="center">

                {/* Client */}
                <Stack align="center" gap={2}>
                    <ServiceNode icon={<FaLaptop />} label="Client" colorPalette="blue" />
                    <Badge colorPalette="blue">React 19</Badge>
                </Stack>

                <Arrow />

                {/* Gateway */}
                <Stack align="center" gap={2}>
                    <ServiceNode icon={<SiNginx />} label="API Gateway" colorPalette="green" />
                    <Badge colorPalette="green">Nginx</Badge>
                </Stack>

                <Arrow />

                {/* Microservices */}
                <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" _dark={{ bg: "gray.800" }} borderStyle="dashed">
                    <Stack gap={4} align="center">
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Microservices (gRPC)</Text>
                        <SimpleGrid columns={2} gap={4}>
                            <ServiceNode icon={<SiGo />} label="User" colorPalette="cyan" />
                            <ServiceNode icon={<SiGo />} label="Wallet" colorPalette="cyan" />
                            <ServiceNode icon={<SiGo />} label="Trans." colorPalette="cyan" />
                            <ServiceNode icon={<SiGo />} label="Notif." colorPalette="cyan" />
                        </SimpleGrid>
                    </Stack>
                </Box>

                <Arrow />

                {/* Data Layer */}
                <Stack gap={4}>
                    <ServiceNode icon={<SiPostgresql />} label="PostgreSQL" colorPalette="blue" />
                    <ServiceNode icon={<SiRabbitmq />} label="RabbitMQ" colorPalette="orange" />
                </Stack>

            </Stack>
        </Box>
    )
}
