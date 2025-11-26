import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useServiceHealth = (serviceName: string, endpoint: string) => {
    return useQuery({
        queryKey: ['health', serviceName],
        queryFn: async () => {
            try {
                const res = await axios.get(endpoint);
                if (res.status === 200) {
                    return 'online';
                }
                return 'offline';
            } catch (error) {
                return 'offline';
            }
        },
        refetchInterval: 10000, // Poll every 10 seconds
        retry: 1,
    });
};
