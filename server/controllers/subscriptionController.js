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


// createSubscription:

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

export {
    createSubscription,
    getAllSubscription,
    getSubscriptionByName,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
}