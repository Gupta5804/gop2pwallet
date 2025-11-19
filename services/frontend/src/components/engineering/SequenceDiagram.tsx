import { Box, Flex, Text, Stack, Circle, Separator } from "@chakra-ui/react"
import { FaLaptop, FaServer, FaDatabase, FaCheck, FaArrowDown } from "react-icons/fa"
import { SiNginx, SiRabbitmq } from "react-icons/si"

const Step = ({ number, title, description, icon, isLast = false }: { number: number, title: string, description: string, icon: React.ReactNode, isLast?: boolean }) => (
    <Flex gap={4}>
        <Flex direction="column" align="center">
            <Circle size="40px" bg="teal.500" color="white" fontWeight="bold">
                {number}
            </Circle>
            {!isLast && <Box flex="1" w="2px" bg="teal.100" my={2} />}
        </Flex>
        <Stack gap={1} pb={8}>
            <Flex align="center" gap={2}>
                <Box color="teal.600" fontSize="lg">{icon}</Box>
                <Text fontWeight="bold" fontSize="lg">{title}</Text>
            </Flex>
            <Text color="fg.muted">{description}</Text>
        </Stack>
    </Flex>
)

export const SequenceDiagram = () => {
    return (
        <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.subtle">
            <Stack gap={6}>
                <Text fontWeight="bold" fontSize="xl" mb={4}>P2P Transfer Lifecycle</Text>

                <Box maxW="3xl">
                    <Step
                        number={1}
                        title="Client Request"
                        description="User initiates transfer. React App sends POST /api/v1/transactions to Nginx."
                        icon={<FaLaptop />}
                    />
                    <Step
                        number={2}
                        title="Gateway Routing"
                        description="Nginx forwards request to Transaction Service (Port 8082)."
                        icon={<SiNginx />}
                    />
                    <Step
                        number={3}
                        title="Validation & Saga Start"
                        description="Transaction Service validates inputs and starts the Saga. It creates a pending transaction record."
                        icon={<FaServer />}
                    />
                    <Step
                        number={4}
                        title="Wallet Operations (gRPC)"
                        description="Transaction Service calls Wallet Service via gRPC to atomically Debit Sender and Credit Receiver."
                        icon={<FaDatabase />}
                    />
                    <Step
                        number={5}
                        title="Event Publishing"
                        description="On success, Transaction Service publishes 'TransactionCompleted' event to RabbitMQ."
                        icon={<SiRabbitmq />}
                    />
                    <Step
                        number={6}
                        title="Notification Delivery"
                        description="Notification Service consumes event and pushes update to Receiver via WebSocket."
                        icon={<FaCheck />}
                        isLast
                    />
                </Box>
            </Stack>
        </Box>
    )
}
