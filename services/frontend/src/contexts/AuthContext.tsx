// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import apiClient from "@/services/api";

// Define the shape of your user object
interface User {
    id: string;
    username: string;
    email: string;
    created_at: string;
}


// Define the shape of the context value
interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: ()=> void;
}

// 1. Create the AuthContext with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider component
interface AuthProviderProps {
    children: ReactNode;
}

// 2. Create the AuthProvider component

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if(token) {
                try {
                    // fetch user's data using the token
                    const response = await apiClient.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to fetch user. Token might be invalid.', error);
                    // if token is bad, log the user out
                    logout();
                }
            }
            setIsLoading(false);
        };

        fetchUser();
    }, [token]);

    // function to set the token in state and local storage
    const login = (newToken: string) => {
        localStorage.setItem('token',newToken);
        setToken(newToken);
    };

    // function to clear token and user data
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Create a custom hook to use the AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

