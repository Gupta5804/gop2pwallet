import { Edge, Node, MarkerType, Position } from 'reactflow';

const colors = {
    client: '#EBF8FF', // blue.50
    gateway: '#F0FFF4', // green.50
    service: '#F3F4F6', // gray.100
    queue: '#FFFAF0',   // orange.50
};

const nodeDefaults = {
    style: {
        padding: '10px 15px',
        borderRadius: '12px',
        border: '1px solid #CBD5E0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontWeight: 'bold',
        fontSize: '14px',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center' as const,
        minWidth: '150px',
        color: '#2D3748',
        background: 'white',
    },
};

const commonEdgeProps = {
    type: 'smoothstep',
    pathOptions: { borderRadius: 20 },
};

// Separating style (CSS) from other Edge properties to fix type errors
export const edgeConfigs = {
    http: {
        ...commonEdgeProps,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3182CE' },
        style: {
            stroke: '#3182CE',
            strokeWidth: 2,
        },
    },
    grpc: {
        ...commonEdgeProps,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#805AD5' },
        style: {
            stroke: '#805AD5',
            strokeWidth: 2,
            strokeDasharray: '5,5',
        },
    },
    rabbitmq: {
        ...commonEdgeProps,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#DD6B20' },
        style: {
            stroke: '#DD6B20',
            strokeWidth: 2,
        },
    },
    websocket: {
        ...commonEdgeProps,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#38A169' },
        style: {
            stroke: '#38A169',
            strokeWidth: 2,
        },
    },
};

export const initialNodes: Node[] = [
    // 1. Client: Sends Right, Receives at Bottom (Loop back)
    {
        id: '1', position: { x: 0, y: 50 },
        data: { label: 'Client (React)' },
        sourcePosition: Position.Right, targetPosition: Position.Bottom,
        style: { ...nodeDefaults.style, background: colors.client, borderColor: '#3182CE' }
    },
    // 2. Gateway: Receives Left, Sends Right
    {
        id: '2', position: { x: 250, y: 50 },
        data: { label: 'Nginx Gateway' },
        sourcePosition: Position.Right, targetPosition: Position.Left,
        style: { ...nodeDefaults.style, background: colors.gateway, borderColor: '#38A169' }
    },
    // 3. Tx Svc: Receives Left, Sends Right (to Rabbit) AND Right (to Wallet)
    {
        id: '3', position: { x: 500, y: 50 },
        data: { label: 'Transaction Svc' },
        sourcePosition: Position.Right, targetPosition: Position.Left,
        style: { ...nodeDefaults.style, background: colors.service }
    },
    // 4. Wallet Svc: Receives Left (Clean drop from Tx)
    {
        id: '4', position: { x: 500, y: 250 },
        data: { label: 'Wallet Svc' },
        sourcePosition: Position.Right, targetPosition: Position.Left,
        style: { ...nodeDefaults.style, background: colors.service }
    },
    // 5. RabbitMQ: Receives Left, Sends Right
    {
        id: '5', position: { x: 750, y: 50 },
        data: { label: 'RabbitMQ' },
        sourcePosition: Position.Right, targetPosition: Position.Left,
        style: { ...nodeDefaults.style, background: colors.queue, borderColor: '#DD6B20' }
    },
    // 6. Notif Svc: Receives Left, Sends Bottom (for loop)
    {
        id: '6', position: { x: 750, y: 250 },
        data: { label: 'Notification Svc' },
        sourcePosition: Position.Bottom, targetPosition: Position.Left,
        style: { ...nodeDefaults.style, background: colors.service }
    },
];

export const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', label: 'HTTP', ...edgeConfigs.http },
    { id: 'e2-3', source: '2', target: '3', ...edgeConfigs.http },
    // 3->4: Comes out Right of 3, turns down, enters Left of 4
    { id: 'e3-4', source: '3', target: '4', label: 'gRPC', ...edgeConfigs.grpc },
    // 3->5: Straight shot Right to Left
    { id: 'e3-5', source: '3', target: '5', label: 'Event', ...edgeConfigs.rabbitmq },
    // 5->6: Out Right of 5? No, let's go cleaner. 5 Right to 6 Right? Or 5 Right to 6 Left (wrap around)?
    // Let's rely on auto-routing for 5->6 since 6 is below.
    { id: 'e5-6', source: '5', target: '6', ...edgeConfigs.rabbitmq },
    // 6->1: The Big Loop. Out Bottom of 6, In Bottom of 1.
    { id: 'e6-1', source: '6', target: '1', label: 'WS Push', ...edgeConfigs.websocket },
];
