import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditSubscription() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        billingCycle: "monthly",
        nextBillingDate: "",
        category: "",
        description: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");



    // Fetch subscription data on mount
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get(`/subscriptions/${id}`);
                const data = response.data;

                // Format date for input field
                const subscription = data.data;
                const formattedDate = subscription.nextBillingDate
                    ? new Date(subscription.nextBillingDate).toISOString().split("T")[0]
                    : "";

                setFormData({
                    name: subscription.name || "",
                    price: subscription.price || "",
                    billingCycle: subscription.billingCycle || "monthly",
                    nextBillingDate: formattedDate,
                    category: subscription.category || "",
                    description: subscription.description || "",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await api.put(`/subscriptions/${id}`, formData);
            // Redirect to dashboard on success
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Edit Subscription</h1>

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
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => navigate("/dashboard")}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditSubscription;
