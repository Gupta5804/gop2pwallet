import axios from "axios";

// 1. Create new axios instance with a base URL
// dont need to type `/api/v1` for every request
export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    firstName: string;
    lastName: string;
}
export interface AuthResponse {
    token: string;
}

export interface BalanceResponse {
    balance: number;
    currency: string;
}
export interface Transaction {
    id: string;
    sender_id: string;
    recipient_id: string;
    amount: number;
    status: string;
    created_at: string;
    updated_at: string;

    sender_username?: string;
    recipient_username?: string;
}

// Payload for POST /api/v1/transactions/send
export interface SendMoneyPayload {
    recipient_id: string;
    amount: number;
}

// Payload for POST /api/v1/transactions/request
export interface RequestMoneyPayload {
    requestee_id: string;
    amount: number;
}

// --- Axios Client setup ---
const apiClient = axios.create({
    baseURL: '/api/v1',
})

// 2. Add a request interceptor
// lets us modify request before it is sent

apiClient.interceptors.request.use((config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');

    // if the token exists, add the authorization header
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;
},
(error) => {
    // handle request errors
    return Promise.reject(error);
});

//  Centralized API functions
// We Define all app network calls here 

export const api = {
    // --- User Service ---
    login: (data: any) => apiClient.post<AuthResponse>('/auth/login', data),
    loginWithGoogle: (credential: string) => apiClient.post<AuthResponse>('/auth/google', {GoogleToken: credential}),
    signup: (data: any) => apiClient.post<AuthResponse>('/auth/register', data),
    getMe: () => apiClient.get<User>('/auth/me'),
    searchUsers: (query: string) => apiClient.get<User[]>(`/users/search?q=${query}`),
    getUserProfile: (username: string) => apiClient.get<User>(`/users/${username}`),

    // --- wallet service ---
    getBalance: () => apiClient.get<BalanceResponse>('/wallet/balance'),

    // --- transaction service ---
    getTransactionHistory: (limit?: number,offset?: number, withUserId?: string)=> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        if (withUserId) params.append('with_user', withUserId);

        const queryString = params.toString();
        const url = queryString ? `/transactions?${queryString}` : '/transactions';
        return apiClient.get<Transaction[]>(url);
    },
    sendMoney: (payload: SendMoneyPayload) =>
        apiClient.post<Transaction>('/transactions/send', payload),
    requestMoney: (payload: RequestMoneyPayload) =>
        apiClient.post<Transaction>('/transactions/request', payload),
    getPendingTransactions: (limit?: number,offset?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        const queryString = params.toString();
        const url = queryString? `/transactions/pending?${queryString}` : '/transactions/pending';
        return apiClient.get<Transaction[]>(url);
    },
    approveTransaction: (txID: string) =>
        apiClient.post<Transaction>(`/transactions/approve/${txID}`),
    rejectTransaction: (txID: string) =>
        apiClient.post<Transaction>(`/transactions/reject/${txID}`),
}

export default apiClient;