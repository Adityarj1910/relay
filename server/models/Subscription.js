import mongoose from "mongoose";

const { Schema } = mongoose;

const subscriptionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        serviceName: {
            type: String,
            required: [true, "Service name is required"],
            trim: true,
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },

        currency: { type: String, default: 'INR' },

        // new field — billing start date (selected by user)
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },

        billingCycle: {
            type: String,
            enum: ["monthly", "quarterly", "yearly", "weekly"],
            required: true,
        },

        notes: { type: String },
        
        // auto-calculated — NOT provided by user
        nextBillingDate: {
            type: Date,
        },

        isActive: { type: Boolean, default: true },

        category: {
            type: String,
            enum: [
                "entertainment",
                "education",
                "utilities",
                "software",
                "health",
                "other",
            ],
            default: "other",
        },

        paymentMethod: {
            type: String,
            enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'],
            default: 'Other'
        },
    },
    { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
