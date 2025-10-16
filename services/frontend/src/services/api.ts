import axios from "axios";

// 1. Create new axios instance with a base URL
// dont need to type `/api/v1` for every request

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

export default apiClient;