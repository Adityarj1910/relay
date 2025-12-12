import asyncHandler from 'express-async-handler';
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import SubscriptionInvitation from '../models/SubscriptionInvitation.js';
import Subscription from '../models/Subscription.js';
import SettleUp from '../models/SettleUp.js';
import { User } from '../models/User.js';

// Get all invitations for authenticated user
const getMyInvitations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userPhone = req.user.phoneNumber;

    // Find invitations by phone number or userId
    const invitations = await SubscriptionInvitation.find({
        $or: [
            { invitedUserPhone: userPhone },
            { invitedUserId: userId }
        ],
        status: 'pending'
    })
        .populate('subscriptionId', 'serviceName amount currency billingCycle category')
        .populate('hostUserId', 'name phoneNumber email')
        .sort({ sentAt: -1 });

    // Filter out expired invitations
    const now = new Date();
    const activeInvitations = invitations.filter(inv => new Date(inv.expiredAt) > now);

    return res.status(200).json(
        new ApiResponse(200, activeInvitations, "Invitations fetched successfully")
    );
});

// Accept invitation
const acceptInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    // Find invitation
    const invitation = await SubscriptionInvitation.findById(id)
        .populate('subscriptionId');

    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }

    // Verify invitation is for authenticated user
    if (invitation.invitedUserPhone !== req.user.phoneNumber &&
        invitation.invitedUserId?.toString() !== userId.toString()) {
        throw new ApiError(403, "This invitation is not for you");
    }

    // Check if invitation is already accepted or declined
    if (invitation.status !== 'pending') {
        throw new ApiError(400, `Invitation already ${invitation.status}`);
    }

    // Check if invitation is expired
    if (new Date(invitation.expiredAt) < new Date()) {
        invitation.status = 'expired';
        await invitation.save();
        throw new ApiError(400, "Invitation has expired");
    }

    // Get subscription
    const subscription = await Subscription.findById(invitation.subscriptionId);

    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    // Find member in sharedWith array
    const memberIndex = subscription.sharedWith.findIndex(
        member => member.userId?.toString() === userId.toString() ||
            (member.userId === null && invitation.invitedUserPhone === req.user.phoneNumber)
    );

    if (memberIndex === -1) {
        throw new ApiError(404, "You are not invited to this subscription");
    }

    // Update member status to accepted and set joinedAt
    subscription.sharedWith[memberIndex].invitationStatus = 'accepted';
    subscription.sharedWith[memberIndex].joinedAt = new Date();
    if (!subscription.sharedWith[memberIndex].userId) {
        subscription.sharedWith[memberIndex].userId = userId;
    }

    await subscription.save();

    // Update invitation
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    if (!invitation.invitedUserId) {
        invitation.invitedUserId = userId;
    }
    await invitation.save();

    // Create SettleUp record for tracking
    await SettleUp.create({
        userId: userId,
        subscriptionId: subscription._id,
        amount: invitation.shareAmount,
        isPaid: false,
        dueDate: subscription.nextBillingDate,
        hostUserId: subscription.hostUserId || subscription.userId,
        billingCycle: subscription.billingCycle
    });

    return res.status(200).json(
        new ApiResponse(200, {
            invitation,
            subscription: {
                _id: subscription._id,
                serviceName: subscription.serviceName,
                yourShare: invitation.shareAmount,
                totalAmount: subscription.amount,
                nextBillingDate: subscription.nextBillingDate
            }
        }, "Invitation accepted successfully. Subscription added to your dashboard.")
    );
});

// Decline invitation
const declineInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    // Find invitation
    const invitation = await SubscriptionInvitation.findById(id);

    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }

    // Verify invitation is for authenticated user
    if (invitation.invitedUserPhone !== req.user.phoneNumber &&
        invitation.invitedUserId?.toString() !== userId.toString()) {
        throw new ApiError(403, "This invitation is not for you");
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
        throw new ApiError(400, `Invitation already ${invitation.status}`);
    }

    // Update invitation status
    invitation.status = 'declined';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Remove from subscription's sharedWith array
    const subscription = await Subscription.findById(invitation.subscriptionId);
    if (subscription) {
        subscription.sharedWith = subscription.sharedWith.filter(
            member => member.userId?.toString() !== userId.toString()
        );

        // Recalculate shares for remaining members (equal split)
        const acceptedMembers = subscription.sharedWith.filter(
            member => member.invitationStatus === 'accepted'
        ).length;

        if (acceptedMembers > 0) {
            const newSharePerPerson = subscription.amount / acceptedMembers;
            subscription.sharedWith.forEach(member => {
                if (member.invitationStatus === 'accepted') {
                    member.shareAmount = newSharePerPerson;
                }
            });
            subscription.totalParticipants = acceptedMembers;
        }

        await subscription.save();
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Invitation declined successfully")
    );
});

// Cancel invitation (Host only)
const cancelInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    // Find invitation
    const invitation = await SubscriptionInvitation.findById(id);

    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }

    // Verify user is the host who sent the invitation
    if (invitation.hostUserId.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the host can cancel this invitation");
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
        throw new ApiError(400, "Cannot cancel an accepted invitation. Remove the member instead.");
    }

    // Delete invitation
    await SubscriptionInvitation.findByIdAndDelete(id);

    // Remove from subscription's sharedWith array
    const subscription = await Subscription.findById(invitation.subscriptionId);
    if (subscription) {
        subscription.sharedWith = subscription.sharedWith.filter(
            member => member.userId?.toString() !== invitation.invitedUserId?.toString() &&
                member.invitationStatus !== 'pending'
        );
        await subscription.save();
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Invitation cancelled successfully")
    );
});

export {
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
    cancelInvitation
}
