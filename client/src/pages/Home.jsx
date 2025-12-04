import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "../styles/Home.css";
import { ContainerTextFlip } from "../components/ui/container-text-flip";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
// import { SparklesCore } from "../components/ui/sparkles";
// import TypingText from "../components/ui/typing-text";
import GlitchText from "../components/ui/glitch-text";
import GridBackground from "../components/ui/GridBackground";


function Home() {
    const { isAuthenticated, user } = useAuth();

    const words = ["Subscriptions", "Renewals", "Spending", "Budgets"];

    return (
        <div className="background">
            <div className="home-container">

                <h1 style={{ fontSize: "6rem", marginBottom: "0.5rem" }}>Relay</h1> <br />
                <motion.h1
                    initial={{
                        opacity: 0,
                    }}
                    whileInView={{
                        opacity: 1,
                    }}
                    className={cn(
                        "relative mb-6 max-w-2xl text-left text-4xl leading-normal font-bold tracking-tight text-zinc-700 md:text-7xl dark:text-zinc-100",
                    )}
                    layout
                >
                    <div className="home-manage-your" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", fontSize: "2.25rem" }}>
                        <span>Manage your</span>
                        <ContainerTextFlip words={words} />
                    </div>
                </motion.h1>

                {/* <p className="home-subtitle">Track all your subscriptions in one place</p> */}

                {isAuthenticated ? (
                    <div className="home-content">
                        <p className="home-welcome-message">Welcome back, {user?.name}!</p>
                        <Link to="/dashboard">
                            <Button variant="primary">Go to Dashboard</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="home-buttons" style={{ marginTop: "6rem" }}>
                        <Link to="/login">
                            <Button variant="primary">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline">Register</Button>
                        </Link>
                    </div>
                )}

            </div>
        </div>


    );
}

export default Home;
