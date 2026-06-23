import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    // FIX: queried directly from Subscription — completely independent of
    // whether the channel has any videos. Previously this lived inside the
    // Video aggregate, so a channel with 0 videos always returned 0 subscribers
    // even if they had 500, because $match on videos returned [] and the rest
    // of the pipeline never ran.
    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    })

    // FIX: subscriber lookup removed from here entirely — no more repeating
    // the same subscriber lookup once per video (500 videos = 500 redundant
    // lookups before). Now it only runs once above, regardless of video count.
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$videoLikes" } }
            }
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1
            }
        }
    ])

    // if the channel has no videos, aggregate returns [] — default to zeros
    // but subscriber count is already correct regardless
    const { totalVideos = 0, totalViews = 0, totalLikes = 0 } = videoStats[0] || {}

    const channelStats = {
        totalSubscribers: subscriberCount,
        totalVideos,
        totalViews,
        totalLikes
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channelStats, "Channel stats fetched successfully"))
})


const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id
    const { page = 1, limit = 10 } = req.query

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                likesCount: 1
            }
        }
    ]

    const videoAggregate = Video.aggregate(pipeline)

    const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10
    }

    const videos = await Video.aggregatePaginate(videoAggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})


export {
    getChannelStats,
    getChannelVideos
}