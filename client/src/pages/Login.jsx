import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        identifier: "", // Can be phone number or username
        password: "",
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Check for success message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
        setApiError("");
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Identifier validation (username or phone number)
        if (!formData.identifier.trim()) {
            newErrors.identifier = "Username or phone number is required";
        } else {
            // If it's all digits, validate as phone number
            const isNumeric = /^\d+$/.test(formData.identifier);
            if (isNumeric && formData.identifier.length !== 10) {
                newErrors.identifier = "Phone number must be exactly 10 digits";
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMessage("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Determine if identifier is phone number or username
            const isPhoneNumber = /^\d+$/.test(formData.identifier);

            // Prepare credentials object
            const credentials = {
                password: formData.password,
            };

            // Add either phoneNumber or username
            if (isPhoneNumber) {
                credentials.phoneNumber = formData.identifier;
            } else {
                credentials.username = formData.identifier;
            }

            // Call login function from AuthContext
            const result = await login(credentials);

            if (result.success) {
                // Login successful - redirect to dashboard
                navigate("/dashboard");
            } else {
                // Show error from API
                setApiError(result.error || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            setApiError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                backgroundColor: "#f5f5f5",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "2rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    width: "100%",
                    maxWidth: "450px",
                }}
            >
                <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
                    Welcome Back
                </h1>

                {/* Success Message (from registration) */}
                {successMessage && (
                    <div
                        style={{
                            backgroundColor: "#d4edda",
                            color: "#155724",
                            padding: "1rem",
                            borderRadius: "4px",
                            marginBottom: "1rem",
                            border: "1px solid #c3e6cb",
                        }}
                    >
                        {successMessage}
                    </div>
                )}

                {/* API Error Display */}
                {apiError && (
                    <div
                        style={{
                            backgroundColor: "#fee",
                            color: "#c33",
                            padding: "1rem",
                            borderRadius: "4px",
                            marginBottom: "1rem",
                            border: "1px solid #fcc",
                        }}
                    >
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Username or Phone Number Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "500",
                            }}
                        >
                            Username or Phone Number <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: errors.identifier ? "1px solid #c33" : "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "1rem",
                            }}
                            placeholder="Enter username or 10-digit phone number"
                            autoComplete="username"
                        />
                        {errors.identifier && (
                            <span
                                style={{
                                    color: "#c33",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                    display: "block",
                                }}
                            >
                                {errors.identifier}
                            </span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "500",
                            }}
                        >
                            Password <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    paddingRight: "3rem",
                                    border: errors.password ? "1px solid #c33" : "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "1rem",
                                }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#666",
                                    fontSize: "0.875rem",
                                }}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <span
                                style={{
                                    color: "#c33",
                                    fontSize: "0.875rem",
                                    marginTop: "0.25rem",
                                    display: "block",
                                }}
                            >
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: loading ? "#ccc" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "1rem",
                            fontWeight: "500",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginBottom: "1rem",
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {/* Link to Register */}
                    <div style={{ textAlign: "center", color: "#666" }}>
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            style={{
                                color: "#007bff",
                                textDecoration: "none",
                                fontWeight: "500",
                            }}
                        >
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;