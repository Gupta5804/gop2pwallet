import { Box, Table, Heading, Stack, Text, SimpleGrid } from "@chakra-ui/react"

const TableSchema = ({ name, columns }: { name: string, columns: { name: string, type: string, desc: string }[] }) => (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="bg.panel">
        <Box bg="gray.100" _dark={{ bg: "gray.700" }} p={3} borderBottomWidth="1px">
            <Heading size="sm">{name}</Heading>
        </Box>
        <Table.Root size="sm" variant="outline" striped>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>Column</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {columns.map((col, idx) => (
                    <Table.Row key={idx}>
                        <Table.Cell fontWeight="medium">{col.name}</Table.Cell>
                        <Table.Cell fontFamily="mono" fontSize="xs" color="purple.500">{col.type}</Table.Cell>
                        <Table.Cell color="fg.muted">{col.desc}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    </Box>
)

export const DatabaseSchema = () => {
    return (
        <Stack gap={8}>
            <Text color="fg.muted">
                The system uses PostgreSQL as the primary data store. While services are logically separated, they may share the same physical database instance in development.
            </Text>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
                <TableSchema
                    name="users"
                    columns={[
                        { name: "id", type: "UUID", desc: "Primary Key" },
                        { name: "username", type: "VARCHAR", desc: "Unique username" },
                        { name: "email", type: "VARCHAR", desc: "Unique email" },
                        { name: "password_hash", type: "VARCHAR", desc: "Bcrypt hash" },
                        { name: "created_at", type: "TIMESTAMP", desc: "Creation timestamp" }
                    ]}
                />
                <TableSchema
                    name="wallets"
                    columns={[
                        { name: "id", type: "UUID", desc: "Primary Key" },
                        { name: "user_id", type: "UUID", desc: "Foreign Key -> users.id" },
                        { name: "balance", type: "BIGINT", desc: "Balance in smallest unit (cents)" },
                        { name: "currency", type: "VARCHAR(3)", desc: "ISO 4217 code (e.g., USD)" },
                        { name: "updated_at", type: "TIMESTAMP", desc: "Last update" }
                    ]}
                />
                <TableSchema
                    name="transactions"
                    columns={[
                        { name: "id", type: "UUID", desc: "Primary Key" },
                        { name: "sender_id", type: "UUID", desc: "FK -> users.id" },
                        { name: "receiver_id", type: "UUID", desc: "FK -> users.id" },
                        { name: "amount", type: "BIGINT", desc: "Transfer amount" },
                        { name: "status", type: "ENUM", desc: "PENDING, COMPLETED, FAILED" },
                        { name: "created_at", type: "TIMESTAMP", desc: "Creation timestamp" }
                    ]}
                />
            </SimpleGrid>
        </Stack>
    )
}
