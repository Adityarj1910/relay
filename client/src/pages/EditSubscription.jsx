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
        serviceName: "",
        amount: "",
        billingCycle: "monthly",
        startDate: "",
        category: "",
        description: "",
    });
    const [originalData, setOriginalData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get(`/subscriptions/getSubscriptionById/${id}`);
                const data = response.data;
                const subscription = data.data;
                const formattedDate = subscription.startDate
                    ? new Date(subscription.startDate).toISOString().split("T")[0]
                    : "";

                // Store original data for placeholders
                const original = {
                    serviceName: subscription.serviceName || "",
                    amount: subscription.amount || "",
                    billingCycle: subscription.billingCycle || "monthly",
                    startDate: formattedDate,
                    category: subscription.category || "",
                    description: subscription.notes || "",
                };

                setOriginalData(original);
                // Set formData with original values so fields are pre-filled
                setFormData(original);
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
            await api.put(`/subscriptions/update/${id}`, formData);
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
            <div className="edit-subscription-card">
                <h1 className="edit-subscription-title">Edit Subscription</h1>

                <FormError message={error} type="error" />

                <form onSubmit={handleSubmit} className="edit-subscription-form">
                    <Input
                        type="text"
                        name="serviceName"
                        value={formData.serviceName}
                        onChange={handleChange}
                        label="Service Name"
                        placeholder={originalData.serviceName || "Enter service name"}
                        required
                    />

                    <Input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        label="Amount"
                        placeholder={originalData.amount || "Enter amount"}
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
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <Input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        label="Start Date"
                        placeholder={originalData.startDate || "Select date"}
                        required
                    />

                    <div className="edit-form-field">
                        <label className="edit-form-label">
                            Category <span className="edit-form-required">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="edit-form-select"
                        >
                            <option value="entertainment">Entertainment</option>
                            <option value="education">Education</option>
                            <option value="utilities">Utilities</option>
                            <option value="software">Software</option>
                            <option value="health">Health</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="edit-form-field">
                        <label className="edit-form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="edit-form-textarea"
                            placeholder={originalData.description || "Enter description"}
                        />
                    </div>

                    <div className="edit-form-actions">
                        <Button type="submit" variant="primary" loading={saving}>
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditSubscription;
