import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Computed property for authentication status
    const isAuthenticated = !!user && !!token;

    // Login function - accepts username and/or phoneNumber with password
    const login = async (credentials) => {
        try {
            // credentials can be: { username, password } or { phoneNumber, password } or { username, phoneNumber, password }
            const response = await api.post("/users/login", credentials);
            const data = response.data;

            // Store token and user data
            setToken(data.data.accessToken);
            setUser(data.data.user);
            localStorage.setItem("token", data.data.accessToken);

            return { success: true, data };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await api.post("/users/register", userData);
            const data = response.data;

            // Automatically log in after successful registration
            // Backend doesn't return tokens on register, so we need to login separately
            // Or if backend does return tokens, adjust accordingly
            setUser(data.data);

            return { success: true, data };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: error.message };
        }
    };

    // Logout function - calls backend to clear refresh token and cookies
    const logout = async () => {
        // Store token before clearing
        const currentToken = token;

        // Clear local state FIRST to prevent any 401 redirects
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");

        // Then try to call backend to clear refresh token (best effort)
        try {
            if (currentToken) {
                // Use fetch instead of api to avoid interceptor redirect
                await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1"}/users/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${currentToken}`,
                    },
                });
            }
        } catch (error) {
            console.error("Logout backend call error:", error);
            // Ignore errors - local logout already complete
        }
    };

    // Fetch user data using token
    const fetchUserData = async (authToken) => {
        try {
            // Token is automatically attached by axios interceptor
            const response = await api.get("/users/profile");
            const data = response.data;

            setUser(data.data);
        } catch (error) {
            console.error("Fetch user error:", error);
            // If token is invalid, clear it
            logout();
        }
    };

    // Auto-load user on app mount if token exists
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");

            if (storedToken) {
                setToken(storedToken);
                await fetchUserData(storedToken);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    // Context value
    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
