import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import { Box } from "@chakra-ui/react"

export const ApiDocs = () => {
    return (
        <Box bg="white" rounded="xl" overflow="hidden" shadow="sm" border="1px solid" borderColor="gray.200" className="swagger-container">
            <SwaggerUI url="/swagger.json" />
        </Box>
    )
}
// Note: The URL is a placeholder. In a real setup, we'd point to the actual openapi.json location.
// For now, this renders the UI.
