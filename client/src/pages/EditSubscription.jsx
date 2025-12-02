import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import FormError from "../components/FormError";
import "../styles/EditSubscription.css";

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

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get(`/subscriptions/getSubscriptionById/${id}`);
                const data = response.data;
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
            await api.put(`/subscriptions/update${id}`, formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="edit-subscription-loading">Loading...</div>;
    }

    return (
        <div className="edit-subscription-container">
            <h1 className="edit-subscription-title">Edit Subscription</h1>

            <FormError message={error} type="error" />

            <form onSubmit={handleSubmit} className="edit-subscription-form">
                <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    label="Name"
                    required
                />

                <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    label="Price"
                    required
                />

                <div className="edit-form-field">
                    <label className="edit-form-label">
                        Billing Cycle <span className="edit-form-required">*</span>
                    </label>
                    <select
                        name="billingCycle"
                        value={formData.billingCycle}
                        onChange={handleChange}
                        className="edit-form-select"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>

                <Input
                    type="date"
                    name="nextBillingDate"
                    value={formData.nextBillingDate}
                    onChange={handleChange}
                    label="Next Billing Date"
                    required
                />

                <Input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                />

                <div className="edit-form-field">
                    <label className="edit-form-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="edit-form-textarea"
                    />
                </div>

                <div className="edit-form-actions">
                    <Button type="submit" loading={saving}>
                        Save Changes
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default EditSubscription;
