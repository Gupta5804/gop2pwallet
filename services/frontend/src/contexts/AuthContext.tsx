// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios"; // Ensure axios is installed for API calls

// Define the shape of your user object
interface User {
    userId: string;
    token: string;
    email: string;
    firstName: string;
    lastName: string;
}

// Define the shape of the context value
interface AuthContextType {
    currentUser: User | null; 
    login: (email: string, password: string) => Promise<void>;
    logout: () =>void; 
    loading: boolean;
    isAuthenticated: boolean;
}

// 1. Create the AuthContext with default values
const AuthContext = createContext<AuthContextType | null>(null);

// Define the props for the AuthProvider component
interface AuthProviderProps {
    children: ReactNode;
}

// 2. Create the AuthProvider component

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/v1/users/login', { email, password});
            const user: User = response.data;
            setCurrentUser(user);
            localStorage.setItem('authToken', user.token); // Store token in localStorage
        } catch (error) {
            console.error("Login failed", error);
            // in a real app, handle errors appropriately
        } finally {
            setLoading(false);
        }
    };
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('authToken'); // Remove token from localStorage
    };
    const value = {
        currentUser,
        login,
        logout,
        loading,
        isAuthenticated: !!currentUser, // true if currentUser is not null
    };
    return <AuthContext.Provider value = {value}>{children}</AuthContext.Provider>
}

// 3. Create a custom hook to use the AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

