import { Badge, HStack, Text } from "@chakra-ui/react"
import { ReactElement } from "react"

interface TechBadgeProps {
  name: string
  colorPalette?: string
  icon?: ReactElement
}

export const TechBadge = ({ name, colorPalette = "gray", icon }: TechBadgeProps) => {
  return (
    <Badge
      colorPalette={colorPalette}
      variant="surface"
      px={4}
      py={2}
      borderRadius="full"
      transition="all 0.2s"
      _hover={{
        transform: "scale(1.05)",
        shadow: "sm"
      }}
      cursor="default"
    >
      <HStack gap={2}>
        {icon}
        <Text fontSize="sm" fontWeight="medium">{name}</Text>
      </HStack>
    </Badge>
  )
}
