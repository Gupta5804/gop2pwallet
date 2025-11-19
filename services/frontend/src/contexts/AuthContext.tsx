// src/contexts/AuthContext.tsx
import { 
    createContext, 
    useContext, 
    useState, 
    ReactNode, 
    useEffect,
    useCallback,
    useRef, 
} from "react";
import {api, User } from "@/services/api";
import { toaster } from "@/components/ui/toaster";

// Define the shape of your user object
// interface User {
//     id: string;
//     username: string;
//     email: string;
//     created_at: string;
// }


// Define the shape of the context value
interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: ()=> void;

    subscribeToRefresh: (callback: () => void) => void;
    unsubscribeFromRefresh: (callback: () => void) => void;
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
    // websocket and emitter refs
    const ws = useRef<WebSocket | null>(null);
    const refreshCallbacks = useRef<(() => void)[]>([]);
    const userRef = useRef<User | null>(null);
    useEffect(() => {
        userRef.current = user;
    },[user]);
    // event emitter
    const subscribeToRefresh = useCallback((callback: () => void) => {
        refreshCallbacks.current.push(callback);
    }, []);
    const unsubscribeFromRefresh = useCallback((callback: () => void) => {
        refreshCallbacks.current = refreshCallbacks.current.filter(cb => cb !== callback);
    },[]);

    useEffect(() => {
        // Dont do anything if there is no token
        if (!token) {
            setIsLoading(false);
            return;
        }

        let wsBaseUrl = "ws://localhost"; //
        if(window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
            const protocol = window.location.protocol === "https:" ? "wss" : "ws";
            wsBaseUrl = `${protocol}://${window.location.host}`;
        }
        // Connect to Websocket Server
        // Nginx will route ws://localhost/ws to notification-service
        const wsUrl = `${wsBaseUrl}/ws?token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connection opened');
        };
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("WebSocket message received:", message);
            const currentUser = userRef.current;

            if (!currentUser){
                console.log("Message received but no current user");
                return;
            } 

            const amount = (message.amount / 100).toFixed(2);

            // 1. Payment success (Sent to Sender and Recipient)
            if (message.type == "payment_success") {
                if (currentUser.id === message.sender_id) {
                    toaster.success({
                        title: "Payment Sent!",
                        description: `You have sent ₹${amount} to ${message.recipient_username}.`,
                    });
                } else if (currentUser.id === message.recipient_id) {
                    toaster.success({
                        title: "Payment Received!",
                        description: `You have received ₹${amount} from ${message.sender_username}.`,
                    });
                }
            }
            // 2. Payment failed (Sent only to sender)
            else if (message.type == "payment_failed") {
                if (currentUser.id === message.sender_id) {
                    toaster.error({
                        title: "Payment Failed!",
                        description: `Payment of ₹${amount} to ${message.recipient_username} failed: ${message.reason}.`,
                    });
                }
            }
            // 3. Payment Request (Sent only to requestee)
            else if (message.type == "payment_request") {
                if (currentUser.id === message.requestee_id) {
                    toaster.info({
                        title: "New Request",
                        description: `${message.requester_username} has requested ₹${amount}.`,
                    });
                }
            }
            // 4. Payment Rejected (Sent only to requester)
            else if (message.type == "payment_rejected") {
                if (currentUser.id === message.requester_id) {
                    toaster.error({
                        title: "Request Rejected!",
                        description: `${message.requestee_username} has rejected your request for ₹${amount}.`,
                    });
                }
            }    
            // show a toast notification
            // switch (message.type) {
            //     case "payment_success":
            //         const amount = (message.amount / 100).toFixed(2);
            //         if (currentUser?.id === message.sender_id) {
            //             toaster.success({
            //                 title: "Payment Sent!",
            //                 description: `You have sent ₹${amount} to ${message.recipient_username}.`,
            //             });
            //         }
            //         else if(currentUser?.id === message.recipient_id) {
            //             toaster.success({
            //                 title: "Payment Received!",
            //                 description: `You have received ₹${amount} from ${message.sender_username}.`,
            //             });
            //         }
            //         break;
            //     case "payment_request":
            //         if (currentUser?.id === message.requester_id) {
            //             return;
            //         }

            //         toaster.info({
            //             title: "New Request",
            //             description: `${message.requester_username} has requested ₹${message.amount / 100}.`,
            //         });
            //         break;
            //     case "payment_rejected":
            //         if (currentUser?.id === message.rejecter_id) {
            //             return;
            //         }
            //         toaster.error({
            //             title: "Request Rejected",
            //             description: `${message.rejecter_username} has rejected your request of ₹${message.amount / 100}.`,
            //         });
            //         break;
            // }
            refreshCallbacks.current.forEach((callback) => callback());
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        const fetchUser = async () => {
            try {
                    // fetch user's data using the token
                    const response = await api.getMe();
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to fetch user. Token might be invalid.', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            
            setIsLoading(false);
        };

        fetchUser();

        return () => {
            ws.current?.close();
        }
    }, [token]);

    // function to set the token in state and local storage
    const login = async (data: any) => {
        try {
            const response = await api.login(data);
            const { token } = response.data;
            localStorage.setItem("token",token);
            setToken(token);
        } catch (error: any) {
            console.error("login failed", error);
            toaster.error({
                title: "Login Failed",
                description: error.response?.data?.error || "Invalid credentials",
            });
            throw error;
        }
    };
    const googleLogin = async (credential: string) => {
        try {
            const response = await api.loginWithGoogle(credential);
            const { token } = response.data;
            localStorage.setItem("token",token);
            setToken(token);
        } catch (error: any) {
            console.error("google login failed", error);
            toaster.error({
                title: "Google Login Failed",
                description: error.response?.data?.error || "could not login via google",
            });
            throw error;
        }
    };

    const signup = async (data: any) => {
        try {
            await api.signup(data);
            await login({email: data.email, password: data.password});
        } catch (error: any) {
            console.error("signup failed", error);
            toaster.error({
                title: "Signup Failed",
                description: error.response?.data?.error || "Could not sign up",
            });
            throw error;
        }
    };

    // function to clear token and user data
    const logout = () => {
        ws.current?.close();
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toaster.info({ title: "Logged Out" });
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        subscribeToRefresh,
        unsubscribeFromRefresh,
        googleLogin
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

