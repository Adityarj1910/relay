import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddSubscription() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        billingCycle: "monthly",
        nextBillingDate: "",
        category: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/subscriptions", formData);
            // Redirect to dashboard on success
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Add New Subscription</h1>

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Billing Cycle:</label>
                    <select
                        name="billingCycle"
                        value={formData.billingCycle}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "0.5rem" }}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Next Billing Date:</label>
                    <input
                        type="date"
                        name="nextBillingDate"
                        value={formData.nextBillingDate}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Category:</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Subscription"}
                    </button>
                    <button type="button" onClick={() => navigate("/dashboard")}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddSubscription;
