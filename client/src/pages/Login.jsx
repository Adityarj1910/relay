import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import FormError from "../components/FormError";
import "../styles/Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
        setApiError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.identifier.trim()) {
            newErrors.identifier = "Username or phone number is required";
        } else {
            const isNumeric = /^\d+$/.test(formData.identifier);
            if (isNumeric && formData.identifier.length !== 10) {
                newErrors.identifier = "Phone number must be exactly 10 digits";
            }
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMessage("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const isPhoneNumber = /^\d+$/.test(formData.identifier);
            const credentials = {
                password: formData.password,
            };

            if (isPhoneNumber) {
                credentials.phoneNumber = formData.identifier;
            } else {
                credentials.username = formData.identifier;
            }

            const result = await login(credentials);

            if (result.success) {
                navigate("/dashboard");
            } else {
                setApiError(result.error || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            setApiError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome Back</h1>

                <FormError message={successMessage} type="success" />
                <FormError message={apiError} type="error" />

                <form onSubmit={handleSubmit} className="login-form">
                    <Input
                        type="text"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        label="Username or Phone Number"
                        placeholder="Enter username or 10-digit phone number"
                        autoComplete="username"
                        error={errors.identifier}
                        required
                    />

                    <div className="password-field-wrapper">
                        <label className="password-label">
                            Password <span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`password-input ${errors.password ? "error" : ""}`}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="password-error">{errors.password}</span>
                        )}
                    </div>

                    <Button type="submit" loading={loading} fullWidth>
                        Login
                    </Button>

                    <div className="login-footer">
                        Don't have an account?{" "}
                        <Link to="/register">Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;