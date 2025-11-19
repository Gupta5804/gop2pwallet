import { Badge, HStack, Text } from "@chakra-ui/react"
import { ReactElement } from "react"

interface TechBadgeProps {
  name: string
  colorPalette?: string
  icon?: ReactElement
}

export const TechBadge = ({ name, colorPalette = "gray", icon }: TechBadgeProps) => {
  return (
    <Badge colorPalette={colorPalette} variant="subtle" px={3} py={1} borderRadius="full">
      <HStack gap={2}>
        {icon}
        <Text>{name}</Text>
      </HStack>
    </Badge>
  )
}
