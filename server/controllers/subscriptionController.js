import asyncHandler from 'express-async-handler'
import { User } from '../models/User.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Subscription from '../models/Subscription.js';

function calculateNextBillingDate(startDate, billingCycle) {
    const start = new Date(startDate);
    const nextBillDate = new Date(start);

    switch (billingCycle) {
        case 'weekly':
            nextBillDate.setDate(start.getDate() + 7);
            break;
        case 'monthly':
            nextBillDate.setMonth(start.getMonth() + 1);
            break;
        case 'quarterly':
            nextBillDate.setMonth(start.getMonth() + 3);
            break;
        case 'yearly':
            nextBillDate.setFullYear(start.getFullYear() + 1);
            break;
        default:
            throw new Error('Invalid billing cycle');
    }

    return nextBillDate;
}



const allowedCategory = [
    "entertainment",
    "education",
    "utilities",
    "software",
    "health",
    "other",
]

const allowedPaymentMethod = [
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Other'
]

// createSubscription:
const createSubscription = asyncHandler(async (req, res) => {

    const userId = req.user._id
    const {
        serviceName,
        amount,
        currency,
        startDate,
        billingCycle,
        notes,
        isActive,
        category,
        paymentMethod
    } = req.body;

    // Validate input
    if (!serviceName ||
        !amount ||
        !startDate ||
        !billingCycle
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const subscriptionExists = await Subscription.findOne({
        userId,
        serviceName,
        startDate,
        billingCycle
    })
    if (subscriptionExists) {
        throw new ApiError(400, "Subscription already exists");
    }


    if (category && !allowedCategory.includes(category)) {
        throw new ApiError(400, "Invalid category");
    }

    // Calculate nextRenewalDate based on startDate and billingCycle
    const nextBillingDate = calculateNextBillingDate(startDate, billingCycle);


    // Create subscription linked to authenticated user
    const subscription = await Subscription.create({
        userId,  // ✅ From authenticated user
        serviceName,
        amount,
        currency: currency || 'INR',
        startDate,
        billingCycle,
        nextBillingDate,
        notes,
        category: category || 'other',
        paymentMethod: paymentMethod || 'Other',
        isActive: true
    });

    // Return created subscription
    return res
        .status(201)
        .json(new ApiResponse(201, subscription, "Subscription created successfully"))
})

const getAllSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const subscriptions = await Subscription.find({ userId })
        .sort({ createdAt: -1 });  // Most recent first

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscriptions fetched successfully"));
})

const getSubscriptionByName = asyncHandler(async (req, res) => {
    const { subscriptionSearch } = req.body;

    if (!subscriptionSearch || !subscriptionSearch.trim() === "") {
        throw new ApiError(400, "Subscription name is required")
    }

    const subscriptionDetais = await Subscription.find({
        // userId,
        serviceName: { $regex: subscriptionSearch, $options: "i" }
    })
    return res
        .status(200)
        .json(new ApiResponse(200, subscriptionDetais, "Subscription Fetched Successfully"))
})

const getSubscriptionById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    // Find subscription by ID
    const subscription = await Subscription.findById(id);

    // Check if subscription exists
    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    // Check if subscription belongs to the authenticated user
    if (subscription.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to access this subscription");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscription, "Subscription Fetched Successfully"));
});

const getSubscriptionByNextBillingDate = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all subscriptions for the user and sort by nextBillingDate
    const subscriptions = await Subscription.find({ userId })
        .sort({ nextBillingDate: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscriptions fetched successfully"));
});

const updateSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { id } = req.params

    const {
        serviceName,
        amount,
        currency,
        startDate,
        billingCycle,
        notes,
        isActive,
        category,
        paymentMethod
    } = req.body;

    const subscription = await Subscription.findById(id)

    if (!subscription) {
        throw new ApiError(404, "Subscription not found")
    }

    if (subscription.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this subscription")
    }

    if (category && !allowedCategory.includes(category)) {
        throw new ApiError(400, "Invalid category")
    }

    if (paymentMethod && !allowedPaymentMethod.includes(paymentMethod)) {
        throw new ApiError(400, "Invalid payment method")
    }

    if (serviceName !== undefined) subscription.serviceName = serviceName;
    if (amount !== undefined) subscription.amount = amount;
    if (currency !== undefined) subscription.currency = currency;
    if (startDate !== undefined) subscription.startDate = startDate;
    if (billingCycle !== undefined) subscription.billingCycle = billingCycle;
    if (notes !== undefined) subscription.notes = notes;
    if (category !== undefined) subscription.category = category;
    if (paymentMethod !== undefined) subscription.paymentMethod = paymentMethod;
    if (isActive !== undefined) subscription.isActive = isActive;


    if (startDate !== undefined || billingCycle !== undefined) {
        subscription.nextBillingDate = calculateNextBillingDate(
            subscription.startDate,
            subscription.billingCycle
        );
    }


    const updatedSubscription = await subscription.save()

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSubscription, "Subscription Updated Successfully"))
})

const deleteSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { id } = req.params

    const subscription = await Subscription.findById(id)

    if (!subscription) {
        throw new ApiError(404, "Subscription not found")
    }

    if (subscription.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this subscription")
    }


    try {
        await subscription.deleteOne()

        return res
            .status(200)
            .json(new ApiResponse(200, subscription, "Subscription Deleted Successfully"))
    } catch (error) {
        throw new ApiError(500, "Failed to delete subscription")
    }
})

const shareSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    // Get and validate subscription
    const subscription = await Subscription.findById(id);

    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    // Verify user owns the subscription
    if (subscription.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to share this subscription");
    }

    // Get request body
    const { phoneNumbers } = req.body;

    // Validate phone numbers
    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        throw new ApiError(400, "Phone numbers array is required and cannot be empty");
    }

    // Import SubscriptionInvitation model
    const SubscriptionInvitation = (await import('../models/SubscriptionInvitation.js')).default;

    // Verify all phone numbers are registered users
    const verifiedUsers = [];
    for (const phoneNumber of phoneNumbers) {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            throw new ApiError(404, `User with phone number ${phoneNumber} is not registered`);
        }

        // Check if user is already invited or is a member
        const alreadyInvited = subscription.sharedWith.some(
            member => member.userId && member.userId.toString() === user._id.toString()
        );

        if (alreadyInvited) {
            throw new ApiError(400, `User ${phoneNumber} is already invited or is a member`);
        }

        verifiedUsers.push(user);
    }

    // Set subscription as shared (if first time)
    if (!subscription.isShared) {
        subscription.isShared = true;
        subscription.hostUserId = userId;
        subscription.splitType = 'equal';

        // Initialize sharedWith array with host
        subscription.sharedWith = [{
            userId: userId,
            role: 'host',
            shareAmount: 0, // Will be calculated below
            isPaid: false,
            invitationStatus: 'accepted',
            joinedAt: new Date()
        }];
    }

    // Calculate new total participants (existing members + new invitations)
    const currentMembers = subscription.sharedWith.filter(
        member => member.invitationStatus === 'accepted'
    ).length;
    const newTotalMembers = currentMembers + verifiedUsers.length;

    // Calculate equal share for all members
    const totalAmount = subscription.amount;
    const sharePerPerson = totalAmount / newTotalMembers;

    // Update existing members' share amounts
    subscription.sharedWith.forEach(member => {
        if (member.invitationStatus === 'accepted') {
            member.shareAmount = sharePerPerson;
        }
    });

    // Create invitations for each verified user
    const invitations = [];
    const invitationExpiry = new Date();
    invitationExpiry.setDate(invitationExpiry.getDate() + 7); // 7 days expiry

    for (const user of verifiedUsers) {
        // Create invitation
        const invitation = await SubscriptionInvitation.create({
            subscriptionId: subscription._id,
            hostUserId: userId,
            invitedUserPhone: user.phoneNumber,
            invitedUserId: user._id,
            shareAmount: sharePerPerson,
            message: `You've been invited to share ${subscription.serviceName}`,
            status: 'pending',
            expiredAt: invitationExpiry
        });

        invitations.push(invitation);

        // Add to sharedWith array with pending status
        subscription.sharedWith.push({
            userId: user._id,
            role: 'member',
            shareAmount: sharePerPerson,
            isPaid: false,
            invitationStatus: 'pending',
            joinedAt: null // Will be set when they accept
        });
    }

    // Update total participants
    subscription.totalParticipants = newTotalMembers;

    // Save updated subscription
    await subscription.save();

    // Return response
    return res.status(201).json(
        new ApiResponse(201, {
            subscription: {
                _id: subscription._id,
                serviceName: subscription.serviceName,
                isShared: subscription.isShared,
                totalAmount: subscription.amount,
                splitType: subscription.splitType,
                sharePerPerson: sharePerPerson,
                totalParticipants: subscription.totalParticipants,
                currentAcceptedMembers: currentMembers,
                newInvitations: verifiedUsers.length
            },
            invitations: invitations.map(inv => ({
                _id: inv._id,
                userName: verifiedUsers.find(u => u._id.toString() === inv.invitedUserId.toString())?.name,
                phoneNumber: inv.invitedUserPhone,
                shareAmount: inv.shareAmount,
                status: inv.status,
                expiresAt: inv.expiredAt
            })),
            updatedShares: subscription.sharedWith.map(member => ({
                userId: member.userId,
                role: member.role,
                shareAmount: member.shareAmount,
                invitationStatus: member.invitationStatus
            }))
        }, "Subscription shared successfully. Invitations sent and shares recalculated for all members.")
    );
})


const getSharedSubscriptionDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    // Get subscription and populate user details
    const subscription = await Subscription.findById(id)
        .populate('userId', 'name phoneNumber email')
        .populate('hostUserId', 'name phoneNumber email')
        .populate('sharedWith.userId', 'name phoneNumber email');

    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    // Verify user is part of this subscription (either host or member)
    const isHost = subscription.userId.toString() === userId.toString() ||
        subscription.hostUserId?.toString() === userId.toString();

    const isMember = subscription.sharedWith.some(
        member => member.userId && member.userId._id.toString() === userId.toString()
    );

    if (!isHost && !isMember) {
        throw new ApiError(403, "You are not authorized to view this subscription's details");
    }

    // Only allow viewing shared details if subscription is actually shared
    if (!subscription.isShared) {
        throw new ApiError(400, "This subscription is not shared");
    }

    // Extract host details
    const host = subscription.sharedWith.find(member => member.role === 'host');
    const hostDetails = {
        userId: host?.userId?._id || subscription.hostUserId,
        name: host?.userId?.name || subscription.userId?.name,
        phoneNumber: host?.userId?.phoneNumber || subscription.userId?.phoneNumber,
        email: host?.userId?.email || subscription.userId?.email,
        shareAmount: host?.shareAmount || 0,
        isPaid: host?.isPaid || false,
        paidAt: host?.paidAt || null
    };

    // Extract members details (excluding host)
    const members = subscription.sharedWith
        .filter(member => member.role === 'member')
        .map(member => ({
            userId: member.userId?._id || null,
            name: member.userId?.name || 'Pending User',
            phoneNumber: member.userId?.phoneNumber || 'N/A',
            email: member.userId?.email || 'N/A',
            shareAmount: member.shareAmount,
            isPaid: member.isPaid,
            paidAt: member.paidAt,
            invitationStatus: member.invitationStatus,
            joinedAt: member.joinedAt
        }));

    // Calculate payment summary
    const totalAmount = subscription.amount;
    const totalPaidAmount = subscription.sharedWith
        .filter(member => member.isPaid)
        .reduce((sum, member) => sum + (member.shareAmount || 0), 0);

    const totalUnpaidAmount = subscription.sharedWith
        .filter(member => !member.isPaid)
        .reduce((sum, member) => sum + (member.shareAmount || 0), 0);

    const totalPaidMembers = subscription.sharedWith.filter(member => member.isPaid).length;
    const totalUnpaidMembers = subscription.sharedWith.filter(member => !member.isPaid).length;
    const totalPendingInvitations = subscription.sharedWith.filter(
        member => member.invitationStatus === 'pending'
    ).length;

    // Determine current user's role and share
    const currentUserMember = subscription.sharedWith.find(
        member => member.userId && member.userId._id.toString() === userId.toString()
    );

    const currentUserDetails = currentUserMember ? {
        role: currentUserMember.role,
        shareAmount: currentUserMember.shareAmount,
        isPaid: currentUserMember.isPaid,
        paidAt: currentUserMember.paidAt
    } : null;

    // Prepare response
    const response = {
        subscriptionDetails: {
            _id: subscription._id,
            serviceName: subscription.serviceName,
            totalAmount: totalAmount,
            currency: subscription.currency,
            billingCycle: subscription.billingCycle,
            startDate: subscription.startDate,
            nextBillingDate: subscription.nextBillingDate,
            category: subscription.category,
            isActive: subscription.isActive,
            splitType: subscription.splitType,
            totalParticipants: subscription.totalParticipants
        },
        host: hostDetails,
        members: members,
        currentUser: currentUserDetails,
        paymentSummary: {
            totalAmount: totalAmount,
            totalPaidAmount: totalPaidAmount,
            totalUnpaidAmount: totalUnpaidAmount,
            totalMembers: subscription.totalParticipants,
            paidMembers: totalPaidMembers,
            unpaidMembers: totalUnpaidMembers,
            pendingInvitations: totalPendingInvitations,
            paymentProgress: totalAmount > 0 ? ((totalPaidAmount / totalAmount) * 100).toFixed(2) : 0
        }
    };

    return res.status(200).json(
        new ApiResponse(200, response, "Shared subscription details fetched successfully")
    );
})

export {
    createSubscription,
    getAllSubscription,
    getSubscriptionByName,
    getSubscriptionById,
    getSubscriptionByNextBillingDate,
    updateSubscription,
    deleteSubscription,
    shareSubscription,
    getSharedSubscriptionDetails
}