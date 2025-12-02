import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Button from "../components/Button";
import "../styles/Dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await api.get("/subscriptions");
                setSubscriptions(response.data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            navigate("/");
        }
    };


        // const handleUpdate = async (id) => {
    //     if (!window.confirm("Are you sure you want to Update this subscription?")) {
    //         return;
    //     }

    //     try {
    //         await api.delete(`/subscriptions/update/${id}`);
    //         setSubscriptions(subscriptions.filter((sub) => sub._id !== id));
    //     } catch (err) {
    //         alert("Failed to delete subscription: " + err.message);
    //     }
    // };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subscription?")) {
            return;
        }

        try {
            await api.delete(`/subscriptions/delete/${id}`);
            setSubscriptions(subscriptions.filter((sub) => sub._id !== id));
        } catch (err) {
            alert("Failed to delete subscription: " + err.message);
        }
    };

    // Calculate stats
    const totalSubscriptions = subscriptions.length;

    const monthlySpending = subscriptions.reduce((total, sub) => {
        const price = parseFloat(sub.amount) || 0;
        let monthlyAmount = price;
        if (sub.billingCycle === "yearly") {
            monthlyAmount = price / 12;
        } else if (sub.billingCycle === "weekly") {
            monthlyAmount = price * 4;
        }
        return total + monthlyAmount;
    }, 0);

    const upcomingRenewals = subscriptions.filter((sub) => {
        const nextBilling = new Date(sub.nextBillingDate);
        const today = new Date();
        const diffTime = nextBilling - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    }).length;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    {user && <p className="dashboard-welcome">Welcome back, {user.name}!</p>}
                </div>
                <Button variant="danger" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-card-blue">
                    <p className="stat-card-label">Total Subscriptions</p>
                    <h2 className="stat-card-value">{totalSubscriptions}</h2>
                </div>

                <div className="stat-card stat-card-purple">
                    <p className="stat-card-label">Monthly Spending</p>
                    <h2 className="stat-card-value">₹{monthlySpending.toFixed(2)}</h2>
                </div>

                <div className="stat-card stat-card-orange">
                    <p className="stat-card-label">Upcoming Renewals (7 days)</p>
                    <h2 className="stat-card-value">{upcomingRenewals}</h2>
                </div>
            </div>

            {/* Add Subscription Button */}
            <div className="dashboard-add-section">
                <Link to="/subscriptions/add">
                    <Button variant="primary">+ Add New Subscription</Button>
                </Link>
            </div>

            {/* Error Display */}
            {error && <div className="dashboard-error">{error}</div>}

            {/* Subscriptions List */}
            <div className="subscriptions-section">
                <h2>Your Subscriptions</h2>

                {subscriptions.length === 0 ? (
                    <div className="subscriptions-empty">
                        <p>No subscriptions yet</p>
                        <Link to="/subscriptions/add">
                            <Button variant="primary">Add Your First Subscription</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="subscriptions-list">
                        {subscriptions.map((sub) => {
                            const nextBilling = new Date(sub.nextBillingDate);
                            const nextBillingDDMMYY = nextBilling.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                            });
                            const today = new Date();
                            const diffTime = nextBilling - today;
                            const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const isUpcoming = daysUntil >= 0 && daysUntil <= 7;

                            return (
                                <div
                                    key={sub._id}
                                    className={`subscription-card ${isUpcoming ? "upcoming" : ""}`}
                                >
                                    <div className="subscription-content">
                                        <h3>{sub.serviceName}</h3>
                                        <div className="subscription-meta">
                                            <span>
                                                <strong>₹{sub.amount}</strong> / {sub.billingCycle}
                                            </span>
                                            {sub.category && <span> {sub.isActive ? "Active" : "Inactive"}</span>}
                                            <span>
                                                📅 Next: {nextBillingDDMMYY}
                                                {isUpcoming && (
                                                    <span className="subscription-upcoming-badge">
                                                        ({daysUntil} {daysUntil === 1 ? "day" : "days"})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {sub.description && (
                                            <p className="subscription-description">{sub.description}</p>
                                        )}
                                    </div>
                                    <div className="subscription-actions">
                                        <Link to={`/subscriptions/update/${sub._id}`}>
                                            <Button variant="outline">Edit</Button>
                                        </Link>
                                        <Button variant="danger" onClick={() => handleDelete(sub._id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}