import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Welcome to Relay</h1>
            <p>Manage all your subscriptions in one place</p>

            {isAuthenticated ? (
                <div>
                    <p>Welcome back, {user?.name}!</p>
                    <Link to="/dashboard">
                        <button>Go to Dashboard</button>
                    </Link>
                </div>
            ) : (
                <div style={{ marginTop: "2rem" }}>
                    <Link to="/login" style={{ margin: "0 1rem" }}>
                        <button>Login</button>
                    </Link>
                    <Link to="/register" style={{ margin: "0 1rem" }}>
                        <button>Register</button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Home;
