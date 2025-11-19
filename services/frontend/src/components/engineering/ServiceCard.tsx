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
        <Card.Root variant="elevated" height="full" _hover={{ transform: "translateY(-4px)", transition: "all 0.2s" }}>
            <Card.Header>
                <HStack justify="space-between" align="start">
                    <Box p={2} borderRadius="md" bg={`${colorPalette}.100`} color={`${colorPalette}.600`}>
                        {icon}
                    </Box>
                    <Badge colorPalette={colorPalette}>{type}</Badge>
                </HStack>
                <Card.Title mt={4} fontSize="xl">{title}</Card.Title>
                <Card.Description>{description}</Card.Description>
            </Card.Header>
            <Card.Body>
                <Stack gap={2}>
                    <Text fontWeight="semibold" fontSize="sm">Key Responsibilities:</Text>
                    <List.Root gap={1} variant="plain" align="start">
                        {responsibilities.map((resp, index) => (
                            <List.Item key={index} fontSize="sm" color="fg.muted">
                                <List.Indicator asChild color={`${colorPalette}.500`}>
                                    {/* We can use a simple dot or checkmark here if needed, but plain list is fine for now */}
                                    <Box as="span" mr={2}>•</Box>
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
