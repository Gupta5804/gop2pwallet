import { Card, Heading, List, Stack, Text, Badge, HStack, Box } from "@chakra-ui/react"
import { ReactElement } from "react"

interface ServiceCardProps {
    title: string
    description: string
    icon: ReactElement
    responsibilities: string[]
    type: "Frontend" | "Backend" | "Database" | "Infrastructure"
    colorPalette?: string
}

export const ServiceCard = ({ title, description, icon, responsibilities, type, colorPalette = "blue" }: ServiceCardProps) => {
    return (
        <Card.Root
            variant="elevated"
            height="full"
            _hover={{
                transform: "translateY(-4px)",
                shadow: "lg",
                borderColor: `${colorPalette}.200`,
                _dark: { borderColor: `${colorPalette}.800` }
            }}
            transition="all 0.2s"
            border="1px solid"
            borderColor="transparent"
            bg="white"
            _dark={{ bg: "gray.800" }}
        >
            <Card.Header>
                <HStack justify="space-between" align="start">
                    <Box
                        p={3}
                        borderRadius="xl"
                        bg={`${colorPalette}.50`}
                        color={`${colorPalette}.600`}
                        _dark={{ bg: `${colorPalette}.900`, color: `${colorPalette}.300` }}
                    >
                        {icon}
                    </Box>
                    <Badge colorPalette={colorPalette} variant="solid" fontSize="xs" px={2} py={0.5} rounded="md">
                        {type}
                    </Badge>
                </HStack>
                <Card.Title mt={4} fontSize="xl" fontWeight="bold">{title}</Card.Title>
                <Card.Description fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                    {description}
                </Card.Description>
            </Card.Header>
            <Card.Body pt={0}>
                <Stack gap={3}>
                    <Text fontWeight="semibold" fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="gray.400">
                        Key Responsibilities
                    </Text>
                    <List.Root gap={2} variant="plain" align="start">
                        {responsibilities.map((resp, index) => (
                            <List.Item key={index} fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} display="flex" alignItems="center">
                                <List.Indicator asChild color={`${colorPalette}.500`}>
                                    <Box as="span" mr={2} fontSize="lg" lineHeight={0}>•</Box>
                                </List.Indicator>
                                {resp}
                            </List.Item>
                        ))}
                    </List.Root>
                </Stack>
            </Card.Body>
        </Card.Root>
    )
}
