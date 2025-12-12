import mongoose from "mongoose";

const { Schema } = mongoose;

const subscriptionInvitationSchema = new Schema({
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },

    hostUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    invitedUserPhone: {
        type: String,
        required: true
    },

    invitedUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    shareAmount: {
        type: Number,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired'],
        default: 'pending'
    },

    expiredAt: {
        type: Date,
        required: true
    },

    sentAt: {
        type: Date,
        default: Date.now
    },

    respondedAt: {
        type: Date
    },

})

const SubscriptionInvitation = mongoose.model('SubscriptionInvitation', subscriptionInvitationSchema);
export default SubscriptionInvitation;
