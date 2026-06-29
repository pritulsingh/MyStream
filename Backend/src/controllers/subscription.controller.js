import { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    // Prevent user from subscribing to themselves
    if (channelId === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    // Check if channel (user) exists
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (existingSubscription) {
        // Already subscribed — unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id)

        const subscriberCount = await Subscription.countDocuments({ channel: channelId })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribed: false, subscriberCount },
                    "Unsubscribed successfully"
                )
            )
    }

    // Not subscribed — subscribe
    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    const subscriberCount = await Subscription.countDocuments({ channel: channelId })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed: true, subscriberCount },
                "Subscribed successfully"
            )
        )
})


// Return subscriber list of a channel
// Route: GET /subscribers/:channelId
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const [subscribers, totalCount] = await Promise.all([
        Subscription.find({ channel: channelId })
            .populate("subscriber", "username fullName avatar")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Subscription.countDocuments({ channel: channelId })
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    subscribers: subscribers.map((s) => s.subscriber),
                    totalCount,
                    page,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNextPage: page * limit < totalCount
                },
                "Subscribers fetched successfully"
            )
        )
})


// Return channel list to which user has subscribed
// Route: GET /subscriptions/:userId
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const [subscribedChannels, totalCount] = await Promise.all([
        Subscription.find({ subscriber: userId })
            .populate("channel", "username fullName avatar")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Subscription.countDocuments({ subscriber: userId })
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    channels: subscribedChannels.map((s) => s.channel),
                    totalCount,
                    page,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNextPage: page * limit < totalCount
                },
                "Subscribed channels fetched successfully"
            )
        )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}