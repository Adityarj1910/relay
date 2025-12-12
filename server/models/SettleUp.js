import mongoose from "mongoose";

const { Schema } = mongoose;

const settleUpSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },

    amount: {
        type: Number,
        required: true
    }, // Their share

    isPaid: {
        type: Boolean,
        default: false
    },

    dueDate: {
        type: Date
    }, // Next billing date

    paidAt: {
        type: Date
    },

    hostUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // Who they owe to

    billingCycle: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const SettleUp = mongoose.model('SettleUp', settleUpSchema);
export default SettleUp;