import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import FormError from "../components/FormError";
import "../styles/Register.css";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");

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
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Phone number must be exactly 10 digits";
        }

        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;
            const result = await register(userData);

            if (result.success) {
                navigate("/login", {
                    state: { message: "Registration successful! Please login." }
                });
            } else {
                setApiError(result.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            setApiError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">Create Account</h1>

                <FormError message={apiError} type="error" />

                <form onSubmit={handleSubmit} className="register-form">
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        label="Name"
                        placeholder="Jhon Doe"
                        error={errors.name}
                        required
                    />

                    <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        label="Username"
                        placeholder="john_doe"
                        error={errors.username}
                        required
                    />

                    <Input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        label="Phone Number"
                        placeholder="10-digit phone number"
                        maxLength={10}
                        error={errors.phoneNumber}
                        required
                    />

                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        label="Email"
                        placeholder="jhondoe@example.com"
                        error={errors.email}
                        required
                    />

                    <div className="register-password-field">
                        <label className="register-password-label">
                            Password <span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="register-password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`register-password-input ${errors.password ? "error" : ""}`}
                                placeholder="At least 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="register-password-toggle"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="register-password-error">{errors.password}</span>
                        )}
                    </div>

                    <div className="register-password-field">
                        <label className="register-password-label">
                            Confirm Password <span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="register-password-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`register-password-input ${errors.confirmPassword ? "error" : ""}`}
                                placeholder="Re-enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="register-password-toggle"
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="register-password-error">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <Button variant="outline" type="submit" loading={loading} fullWidth>
                        Register
                    </Button>

                    <div className="register-footer">
                        Already have an account?{" "}
                        <Link to="/login"><b> Login</b></Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;