import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "../styles/Home.css";

function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="home-container">
            <h1 className="home-title">Welcome to </h1>
            <h1 className="home-title-name">Relay</h1>
            <p className="home-subtitle">Manage all your subscriptions in one place</p>

            {isAuthenticated ? (
                <div className="home-content">
                    <p className="home-welcome-message">Welcome back, {user?.name}!</p>
                    <Link to="/dashboard">
                        <Button variant="primary">Go to Dashboard</Button>
                    </Link>
                </div>
            ) : (
                <div className="home-buttons">
                    <Link to="/login">
                        <Button variant="primary">Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="outline">Register</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Home;

// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Button from "../components/Button";
// import { LayoutTextFlip } from "../components/ui/LayoutTextFlip";
// import "../styles/Home.css";

// function Home() {
//     const { isAuthenticated, user } = useAuth();

//     return (
//         <div className="home-container">
//             <h1 className="home-title">Welcome to Relay</h1>

//             {/* Animated Text Component */}
//             <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
//                 <LayoutTextFlip
//                     text="Manage"
//                     words={["Subscriptions", "Renewals", "Spending", "Budgets"]}
//                     duration={2500}
//                 />
//             </div>

//             <p className="home-subtitle">Track all your subscriptions in one place</p>

//             {isAuthenticated ? (
//                 <div className="home-content">
//                     <p className="home-welcome-message">Welcome back, {user?.name}!</p>
//                     <Link to="/dashboard">
//                         <Button variant="primary">Go to Dashboard</Button>
//                     </Link>
//                 </div>
//             ) : (
//                 <div className="home-buttons">
//                     <Link to="/login">
//                         <Button variant="primary">Login</Button>
//                     </Link>
//                     <Link to="/register">
//                         <Button variant="outline">Register</Button>
//                     </Link>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Home;



