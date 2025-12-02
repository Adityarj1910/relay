import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import FormError from "../components/FormError";
import "../styles/AddSubscription.css";

function AddSubscription() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({

        serviceName: "",
        amount: "",
        billingCycle: "monthly",
        nextBillingDate: "",
        category: "",
        description: "",
        isActive: true,
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
            await api.post("/subscriptions/create", formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-subscription-container">
            <h1 className="add-subscription-title">Add New Subscription</h1>

            <FormError message={error} type="error" />

            <form onSubmit={handleSubmit} className="add-subscription-form">
                <Input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleChange}
                    label="Service Name"
                    placeholder="Netflix lets say"
                    required
                />

                <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    label="Amount"
                    placeholder="499"
                    required
                />

                <div className="form-field">
                    <label className="form-label">
                        Billing Cycle <span className="form-required">*</span>
                    </label>
                    <select
                        name="billingCycle"
                        value={formData.billingCycle}
                        onChange={handleChange}
                        className="form-select"
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
                    placeholder="19/10/2025"
                    required
                />
                {/* 
                <Input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                /> */}

                <div className="form-field">
                    <label className="form-label">
                        Category <span className="form-required">*</span>
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="entertainment">Entertainment</option>
                        <option value="education">Education</option>
                        <option value="utilities">Utilities</option>
                        <option value="software">Software</option>
                        <option value="health">Health</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-field">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="form-textarea"
                    />
                </div>

                <div className="form-actions">
                    <Button type="submit" loading={loading}>
                        Add Subscription
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddSubscription;
