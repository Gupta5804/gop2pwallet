// src/components/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    if(!isAuthenticated) {
        // User is not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    //Outlet renders the child route's element if the user is authenticated
    return <Outlet />;
}
