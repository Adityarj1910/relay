import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor - Attach JWT token to all requests
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        // If token exists, add it to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Handle request error
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        // Return successful response data
        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            const requestUrl = error.config?.url || "";

            switch (status) {
                case 401:
                    // Unauthorized - token expired or invalid
                    console.error("Unauthorized access - redirecting to login");
                    localStorage.removeItem("token");

                    // Don't redirect to login if this is a logout request
                    // Let the logout function handle navigation
                    if (!requestUrl.includes("/users/logout")) {
                        window.location.href = "/login";
                    }
                    break;

                case 403:
                    // Forbidden - user doesn't have permission
                    console.error("Access forbidden:", data.message);
                    break;

                case 404:
                    // Not found
                    console.error("Resource not found:", data.message);
                    break;

                case 500:
                    // Server error
                    console.error("Server error:", data.message);
                    break;

                default:
                    console.error("API error:", data.message || "Unknown error");
            }

            // Return error with message
            return Promise.reject({
                status,
                message: data.message || "An error occurred",
                data: data,
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error("No response from server:", error.request);
            return Promise.reject({
                message: "No response from server. Please check your connection.",
            });
        } else {
            // Something else happened
            console.error("Error:", error.message);
            return Promise.reject({
                message: error.message || "An unexpected error occurred",
            });
        }
    }
);

// Export the configured axios instance
export default api;

// Optional: Export specific API methods for common operations
export const apiService = {
    // GET request
    get: (url, config = {}) => api.get(url, config),

    // POST request
    post: (url, data, config = {}) => api.post(url, data, config),

    // PUT request
    put: (url, data, config = {}) => api.put(url, data, config),

    // PATCH request
    patch: (url, data, config = {}) => api.patch(url, data, config),

    // DELETE request
    delete: (url, config = {}) => api.delete(url, config),
};
