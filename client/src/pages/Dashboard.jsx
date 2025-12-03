import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";
import editIcon from "../assets/edit.png";
import trashIcon from "../assets/trash.png";
import "../styles/Dashboard.css";

const ITEMS_PER_PAGE = 5;

function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isActiveToggle, setIsToggled] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await api.get("/subscriptions/getSubscriptionByNextBillingDate");
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

    const handleToggleActive = async (id, currentStatus) => {
        // Optimistic UI update
        setSubscriptions(subscriptions.map(sub =>
            sub._id === id ? { ...sub, isActive: !currentStatus } : sub
        ));

        try {
            await api.put(`/subscriptions/update/${id}`, {
                isActive: !currentStatus
            });
        } catch (err) {
            // Revert on error
            setSubscriptions(subscriptions.map(sub =>
                sub._id === id ? { ...sub, isActive: currentStatus } : sub
            ));
            alert("Failed to update subscription status: " + err.message);
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

    // Pagination calculations
    const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentSubscriptions = subscriptions.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <h1>Dashboard</h1>
                    {user && <p className="dashboard-welcome">Welcome back, {user.name}!</p>}
                </div>
                <Button variant="danger" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
            {/* Header */}

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
                        {currentSubscriptions.map((sub) => {
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
                                        <h3>{sub.serviceName.toUpperCase()}</h3>
                                        <div className="subscription-meta">
                                            <span>
                                                <strong>₹{sub.amount}</strong> - {sub.billingCycle.toUpperCase()}
                                            </span>
                                            {sub.category && (
                                                <span className="subscription-status">
                                                    <ToggleSwitch
                                                        checked={sub.isActive}
                                                        onChange={() => handleToggleActive(sub._id, sub.isActive)}
                                                        label={sub.isActive ? "Active" : "Inactive"}
                                                    />
                                                </span>
                                            )}
                                            <span className="subscription-category">
                                                {sub.category.toUpperCase()}
                                            </span>
                                            <span>
                                                📅 Next: {nextBillingDDMMYY}
                                                {isUpcoming && (
                                                    <span className="subscription-upcoming-badge">
                                                        ({daysUntil} {daysUntil === 1 ? "day" : "days"})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {/* {sub.description && (
                                            <p className="subscription-description">{sub.description}</p>
                                        )} */}
                                    </div>
                                    <div className="subscription-actions">
                                        <Link to={`/subscriptions/update/${sub._id}`}>
                                            <img
                                                src={editIcon}
                                                alt="Edit"
                                                className="action-icon edit-icon"
                                            />
                                        </Link>
                                        <img
                                            src={trashIcon}
                                            alt="Delete"
                                            className="action-icon delete-icon"
                                            onClick={() => handleDelete(sub._id)}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    className="pagination-button"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                >
                                    &#8249;
                                </button>
                                <span className="pagination-info">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="pagination-button"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    &#8250;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;