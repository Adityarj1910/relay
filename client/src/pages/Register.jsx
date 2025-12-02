import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");

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
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        // Phone number validation (10 digits)
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Phone number must be exactly 10 digits";
        }

        // Email validation (optional but must be valid if provided)
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare data for API (exclude confirmPassword)
            const { confirmPassword, ...userData } = formData;

            // Call register function from AuthContext
            const result = await register(userData);

            if (result.success) {
                // Registration successful - redirect to login or dashboard
                // Since backend doesn't auto-login on register, redirect to login
                navigate("/login", {
                    state: { message: "Registration successful! Please login." }
                });
            } else {
                // Show error from API
                setApiError(result.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            setApiError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            backgroundColor: "#f5f5f5"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth: "500px"
            }}>
                <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
                    Create Account
                </h1>

                {/* API Error Display */}
                {apiError && (
                    <div style={{
                        backgroundColor: "#fee",
                        color: "#c33",
                        padding: "1rem",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                        border: "1px solid #fcc"
                    }}>
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                            Name <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: errors.name ? "1px solid #c33" : "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "1rem"
                            }}
                            placeholder="Enter your full name"
                        />
                        {errors.name && (
                            <span style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                                {errors.name}
                            </span>
                        )}
                    </div>

                    {/* Username Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                            Username <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: errors.username ? "1px solid #c33" : "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "1rem"
                            }}
                            placeholder="Choose a username"
                        />
                        {errors.username && (
                            <span style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                                {errors.username}
                            </span>
                        )}
                    </div>

                    {/* Phone Number Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                            Phone Number <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            maxLength="10"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: errors.phoneNumber ? "1px solid #c33" : "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "1rem"
                            }}
                            placeholder="10-digit phone number"
                        />
                        {errors.phoneNumber && (
                            <span style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                                {errors.phoneNumber}
                            </span>
                        )}
                    </div>

                    {/* Email Field (Optional) */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                            Email <span style={{ color: "#888", fontSize: "0.875rem" }}>(Optional)</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: errors.email ? "1px solid #c33" : "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "1rem"
                            }}
                            placeholder="your.email@example.com"
                        />
                        {errors.email && (
                            <span style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
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
                                    fontSize: "1rem"
                                }}
                                placeholder="At least 6 characters"
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
                                    fontSize: "0.875rem"
                                }}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <span style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                            Confirm Password <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    paddingRight: "3rem",
                                    border: errors.confirmPassword ? "1px solid #c33" : "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "1rem"
                                }}
                                placeholder="Re-enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#666",
                                    fontSize: "0.875rem"
                                }}
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                                {errors.confirmPassword}
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
                            marginBottom: "1rem"
                        }}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                    {/* Link to Login */}
                    <div style={{ textAlign: "center", color: "#666" }}>
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            style={{
                                color: "#007bff",
                                textDecoration: "none",
                                fontWeight: "500"
                            }}
                        >
                            Login here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;