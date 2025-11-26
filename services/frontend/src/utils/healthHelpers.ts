export const getStatusColor = (status: string | undefined, isError: boolean) => {
    if (isError) return 'red';
    if (status === 'online') return 'green';
    return 'gray';
};
