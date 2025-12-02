import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            // Navigation happens after logout completes
            navigate("/Home");
        } catch (error) {
            // Even if logout fails, still navigate to home
            console.error("Logout error:", error);
            navigate("/Home");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem"
            }}>
                <h1>Dashboard</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>
            </div>

            {user && (
                <div style={{ marginBottom: "2rem" }}>
                    <h2>Welcome, {user.name}!</h2>
                    <p style={{ color: "#666" }}>
                        @{user.username} | {user.phoneNumber}
                    </p>
                </div>
            )}

            <div>
                <p>Dashboard content goes here...</p>
            </div>
        </div>
    );
}